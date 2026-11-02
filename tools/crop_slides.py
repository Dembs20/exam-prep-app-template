#!/usr/bin/env python3
"""Crop figures out of slide or exercise PDFs and write the course's figures.js.

    python3 tools/crop_slides.py spec.json --out courses/<course>/figures.js [--preview DIR] [--only id1,id2]

spec.json:
{
  "dpi": 140, "maxWidth": 960, "quality": 82,
  "pdfs": {"L1": "slides/lecture1.pdf", "HW": "homework.pdf"},          (paths relative to spec.json)
  "figures": {
    "l1_bridges": {"pdf": "L1", "page": 13, "region": "auto:1"},
    "l1_laplace": {"pdf": "L1", "page": 16, "region": "auto:2",
                   "whiten": {"color": "#0099cc", "tol": 90}, "frame": true, "blank": [[0.72, 0.88, 1, 1]]},
    "hw_circuit": {"pdf": "HW", "page": 2, "region": [0.12, 0.30, 0.88, 0.62]}
  }
}

Per figure, in this order:
  region   "full" (whole page) | a layout name | [x0, y0, x1, y1] as fractions of the page |
           "auto:k" (k-th block of content from the top; quick but fragile, can cut a slide short)
           Define layouts once per deck in "layouts": {"slide-top": [0.16, 0.135, 0.87, 0.512], ...}
           (find the fractions with --grid PDFKEY:PAGE); built in: top-half, bottom-half
  whiten   paint pixels close to a colour white (coloured footer bars); {"color", "tol", "below": fraction}
           limits it to the part of the crop below that height fraction
  frame    true: remove long dark border lines (slide frames) and everything outside them
  blank    list of [x0, y0, x1, y1] fractions (of the crop) painted white, e.g. a university logo
  trim     default true: trim white margins, keeping an 8 px border
  box      final sub-crop [x0, y0, x1, y1] as fractions, to keep one diagram of a busy slide

ALWAYS look at every result (use --preview, then view the PNGs or the contact sheet): crops that cut off
part of a slide were the most common defect.
"""
import argparse, base64, io, json, os, re, subprocess, sys

import numpy as np
from PIL import Image, ImageOps

_cache = {}
BUILTIN_LAYOUTS = {'top-half': [0, 0, 1, 0.5], 'bottom-half': [0, 0.5, 1, 1]}


def render(pdf, page, dpi):
    key = (pdf, page, dpi)
    if key not in _cache:
        png = subprocess.run(['pdftoppm', '-r', str(dpi), '-f', str(page), '-l', str(page), '-png', pdf],
                             capture_output=True, check=True).stdout
        _cache[key] = Image.open(io.BytesIO(png)).convert('RGB')
    return _cache[key]


def blocks(im, min_h=150, gap=25):
    """Vertical blocks of content (rows with ink), merged across small gaps; used for 'auto:k'."""
    a = np.asarray(ImageOps.grayscale(im)); rows = (a < 235).sum(axis=1) > 3
    out, s = [], None
    for i, r in enumerate(rows):
        if r and s is None: s = i
        if not r and s is not None:
            if i - s > 40: out.append([s, i])
            s = None
    if s is not None: out.append([s, len(rows)])
    merged = []
    for b in out:
        if merged and b[0] - merged[-1][1] < gap: merged[-1][1] = b[1]
        else: merged.append(b)
    return [b for b in merged if b[1] - b[0] > min_h]


def frac_box(im, f):
    w, h = im.size
    return tuple(int(round(v)) for v in (f[0] * w, f[1] * h, f[2] * w, f[3] * h))


def hex_rgb(c):
    c = c.lstrip('#'); return np.array([int(c[i:i + 2], 16) for i in (0, 2, 4)])


def remove_frame(im, band=0.15):
    """Cut away a thin dark border (slide frame) if one runs along an edge of the crop."""
    g = np.asarray(ImageOps.grayscale(im)); ink = g < 200; h, w = ink.shape
    bh, bw = max(3, int(band * h)), max(3, int(band * w))
    rowf, colf = ink.mean(axis=1), ink.mean(axis=0)
    top = [i for i in range(0, bh) if rowf[i] > 0.6]; bot = [i for i in range(h - bh, h) if rowf[i] > 0.6]
    lef = [j for j in range(0, bw) if colf[j] > 0.6]; rig = [j for j in range(w - bw, w) if colf[j] > 0.6]
    t = top[-1] + 2 if top else 0; b = bot[0] - 1 if bot else h
    l = lef[-1] + 2 if lef else 0; r = rig[0] - 1 if rig else w
    return im.crop((l, t, r, b))


def trim(im, pad=8):
    g = np.asarray(ImageOps.grayscale(im)); ink = g < 225
    cols = np.where(ink.sum(axis=0) > 2)[0]; rows = np.where(ink.sum(axis=1) > 2)[0]
    if not len(cols) or not len(rows): return im
    return im.crop((max(0, cols[0] - pad), max(0, rows[0] - pad), min(im.width, cols[-1] + pad + 1), min(im.height, rows[-1] + pad + 1)))


def figure(spec, pdfs, dpi, layouts=None):
    layouts = dict(BUILTIN_LAYOUTS, **(layouts or {}))
    page = render(pdfs[spec['pdf']], spec['page'], spec.get('dpi', dpi))
    reg = spec.get('region', 'full')
    if isinstance(reg, str) and reg in layouts:
        reg = layouts[reg]
    if reg == 'full':
        im = page
    elif isinstance(reg, str) and reg.startswith('auto:'):
        k = int(reg.split(':')[1]); bl = blocks(page)
        if k > len(bl): raise SystemExit('page %s has only %d content blocks' % (spec['page'], len(bl)))
        y0, y1 = bl[k - 1]; im = trim(page.crop((0, y0, page.width, y1)), pad=2)
    else:
        im = page.crop(frac_box(page, reg))
    if 'whiten' in spec:
        wsp = spec['whiten']; a = np.asarray(im).astype(int).copy()
        y0 = int(wsp.get('below', 0) * a.shape[0])
        sub = a[y0:]; mask = np.abs(sub - hex_rgb(wsp['color'])).sum(axis=2) < wsp.get('tol', 90)
        sub[mask] = 255; a[y0:] = sub; im = Image.fromarray(a.astype(np.uint8))
    if spec.get('frame'):
        im = remove_frame(im)
    for bx in spec.get('blank', []):
        a = np.asarray(im).copy(); x0, y0, x1, y1 = frac_box(im, bx); a[y0:y1, x0:x1] = 255; im = Image.fromarray(a)
    if spec.get('trim', True):
        im = trim(im)
    if 'box' in spec:
        im = im.crop(frac_box(im, spec['box']))
    return im


def data_uri(im, quality):
    b = io.BytesIO(); im.save(b, 'JPEG', quality=quality, optimize=True)
    return 'data:image/jpeg;base64,' + base64.b64encode(b.getvalue()).decode(), len(b.getvalue())


def read_figs(path):
    if not os.path.exists(path): return {}
    s = open(path, encoding='utf-8').read(); m = re.search(r'const FIGS=(\{.*\});', s, re.S)
    return json.loads(m.group(1)) if m else {}


def contact_sheet(pngs, path, width=1400):
    thumbs = []
    for name, im in pngs:
        t = im.copy(); t.thumbnail((440, 300)); thumbs.append((name, t))
    cols = 3; rows = (len(thumbs) + cols - 1) // cols
    sheet = Image.new('RGB', (width, rows * 330 + 10), 'white')
    from PIL import ImageDraw
    d = ImageDraw.Draw(sheet)
    for i, (name, t) in enumerate(thumbs):
        x = 10 + (i % cols) * 465; y = 10 + (i // cols) * 330
        sheet.paste(t, (x, y + 18)); d.rectangle([x - 1, y + 17, x + t.width, y + 18 + t.height], outline=(200, 0, 0))
        d.text((x, y), name, fill=(0, 0, 0))
    sheet.save(path)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('spec'); ap.add_argument('--out', required=True)
    ap.add_argument('--preview'); ap.add_argument('--only')
    ap.add_argument('--grid', help='PDFKEY:PAGE - write PDFKEY_pPAGE_grid.png with 5%% gridlines to pick region fractions')
    a = ap.parse_args()
    spec = json.load(open(a.spec)); base = os.path.dirname(os.path.abspath(a.spec))
    pdfs = {k: os.path.join(base, v) for k, v in spec['pdfs'].items()}
    dpi = spec.get('dpi', 140); maxw = spec.get('maxWidth', 960); q = spec.get('quality', 82)
    if a.grid:
        key, pg = a.grid.split(':'); im = render(pdfs[key], int(pg), dpi).copy()
        from PIL import ImageDraw
        d = ImageDraw.Draw(im); w, h = im.size
        for k in range(1, 20):
            c = (220, 0, 0) if k % 2 == 0 else (255, 170, 170)
            d.line([(k * w / 20, 0), (k * w / 20, h)], fill=c); d.line([(0, k * h / 20), (w, k * h / 20)], fill=c)
            if k % 2 == 0:
                d.text((k * w / 20 + 2, 2), '%.1f' % (k / 20), fill=(220, 0, 0)); d.text((2, k * h / 20 + 2), '%.1f' % (k / 20), fill=(220, 0, 0))
        out = '%s_p%s_grid.png' % (key, pg); im.save(out); print('wrote', out); return
    figs = read_figs(a.out); only = set(a.only.split(',')) if a.only else None
    previews = []
    for fid, fs in spec['figures'].items():
        if only and fid not in only: continue
        im = figure(fs, pdfs, dpi, spec.get('layouts'))
        if im.width > maxw: im = im.resize((maxw, int(im.height * maxw / im.width)), Image.LANCZOS)
        figs[fid], size = data_uri(im, q)
        print('%-24s %4dx%-4d %4d kB' % (fid, im.width, im.height, size // 1024))
        if a.preview:
            os.makedirs(a.preview, exist_ok=True); im.save(os.path.join(a.preview, fid + '.png')); previews.append((fid, im))
    with open(a.out, 'w', encoding='utf-8') as f:
        f.write('// Figures used in the lectures: id -> data URI. Written by tools/crop_slides.py.\nconst FIGS=' + json.dumps(figs) + ';\n')
    if previews:
        contact_sheet(previews, os.path.join(a.preview, '_contact_sheet.png'))
        print('previews and _contact_sheet.png in', a.preview)


if __name__ == '__main__':
    main()
