#!/usr/bin/env python3
"""Assemble one course into a single-page exam-prep app.

    python3 tools/build.py courses/<course>            # both outputs
    python3 tools/build.py courses/<course> --no-standalone

Outputs (in dist/<course>/):
    index.html          for publishing as an artifact (MathJax loaded from cdnjs)
    <standaloneName>    shareable file that works offline (MathJax inlined)

Load order: engine/head.html, the course config (const COURSE, LECTURES, R), engine/widgets-core.html,
the course content files in the order listed in course.json, engine/settings.html, engine/app.html.
"""
import json, os, subprocess, sys, tarfile, io

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ENGINE = os.path.join(ROOT, 'engine')
VENDOR = os.path.join(ROOT, 'tools', 'vendor')
MJ_VERSION = '3.2.2'
MJ_CDN = '<script src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/%s/es5/tex-svg.js"></script>' % MJ_VERSION


def read(p):
    with open(p, encoding='utf-8') as f:
        return f.read()


def script(js):
    if '</script' in js.lower():
        raise SystemExit('content contains "</script" which would break the page')
    return '<script>\n' + js.rstrip() + '\n</script>\n'


def mathjax_source():
    """Return the text of MathJax's es5/tex-svg.js, fetching the npm package once if needed."""
    path = os.path.join(VENDOR, 'mathjax', 'es5', 'tex-svg.js')
    if not os.path.exists(path):
        os.makedirs(VENDOR, exist_ok=True)
        print('fetching mathjax@%s from npm (once) ...' % MJ_VERSION)
        out = subprocess.run(['npm', 'pack', 'mathjax@' + MJ_VERSION, '--silent'], cwd=VENDOR,
                             capture_output=True, text=True, check=True).stdout.strip().splitlines()[-1]
        with tarfile.open(os.path.join(VENDOR, out)) as tf:
            for m in tf.getmembers():
                if m.name.startswith('package/es5/'):
                    m.name = 'mathjax/' + m.name[len('package/'):]
                    tf.extract(m, VENDOR, filter='data') if hasattr(tarfile, 'data_filter') else tf.extract(m, VENDOR)
        os.remove(os.path.join(VENDOR, out))
    return read(path)


def build(course_dir, standalone=True):
    course_dir = os.path.abspath(course_dir)
    name = os.path.basename(course_dir.rstrip('/'))
    cfg = json.loads(read(os.path.join(course_dir, 'course.json')))
    for k in ('title', 'subtitle', 'storageKey', 'content', 'sources'):
        if k not in cfg:
            raise SystemExit('course.json is missing "%s"' % k)

    head = read(os.path.join(ENGINE, 'head.html'))
    head = head.replace('{{TITLE}}', cfg['title']).replace('{{SUBTITLE}}', cfg['subtitle'])
    head = head.replace('{{LOGO_SVG}}', cfg.get('logoSvg', ''))
    pub = {k: v for k, v in cfg.items() if k not in ('logoSvg', 'content', 'standaloneName')}
    preamble = ('const COURSE=' + json.dumps(pub, ensure_ascii=False).replace('</', '<\\/') + ';\n'
                'const LECTURES=[];\nconst R=String.raw;\n')

    parts = [head, script(preamble), read(os.path.join(ENGINE, 'widgets-core.html'))]
    for f in cfg['content']:
        parts.append(script(read(os.path.join(course_dir, f))))
    parts.append(read(os.path.join(ENGINE, 'settings.html')))
    parts.append(read(os.path.join(ENGINE, 'app.html')))
    page = ''.join(p if p.endswith('\n') else p + '\n' for p in parts)

    out = os.path.join(ROOT, 'dist', name)
    os.makedirs(out, exist_ok=True)
    with open(os.path.join(out, 'index.html'), 'w', encoding='utf-8') as f:
        f.write(page)
    print('built', os.path.relpath(os.path.join(out, 'index.html'), ROOT), '(%d kB)' % (len(page) // 1024))

    if standalone:
        assert MJ_CDN in page, 'MathJax CDN tag not found in engine/head.html'
        mj = mathjax_source().replace('</script>', '<\\/script>')
        full = page.replace(MJ_CDN, '<script>' + mj + '</script>')
        i = full.find('<header class="top">')
        hd = full[:i].replace('<meta name="claude:viewport-fit-sides" content="cover">\n', '')
        doc = ('<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
               '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'
               '<style>[hidden]{display:none!important}img{max-width:100%}html{color-scheme:light dark}</style>\n'
               + hd + '</head>\n<body>\n' + full[i:] + '\n</body>\n</html>\n')
        fn = cfg.get('standaloneName', name + '_exam_prep.html')
        with open(os.path.join(out, fn), 'w', encoding='utf-8') as f:
            f.write(doc)
        print('built', os.path.relpath(os.path.join(out, fn), ROOT), '(%d kB)' % (len(doc) // 1024))
    return out


if __name__ == '__main__':
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    if len(args) != 1:
        raise SystemExit(__doc__)
    build(args[0], standalone='--no-standalone' not in sys.argv)
