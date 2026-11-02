#!/usr/bin/env python3
"""Check a built app in headless Chromium: content consistency and rendering at desktop and phone width.

    python3 tools/test_render.py dist/<course>/<standalone>.html [--shots DIR]

Exit code 1 when an error is found. Warnings (missing figure explanations, empty summaries, ...) do not fail.
Uses Playwright; in the cloud workspace Chromium is preinstalled (do not run `playwright install`).
"""
import asyncio, os, sys
from playwright.async_api import async_playwright

CONTENT_CHECKS = r"""() => {
 const err=[], warn=[]; const ids=new Set(), dup=x=>{if(ids.has(x))err.push('duplicate id '+x);ids.add(x)};
 const secs=new Set(); LECTURES.forEach(l=>{dup(l.id);l.sections.forEach(s=>{dup(s.id);secs.add(s.id)});
   if(!l.defs||!l.defs.length)warn.push(l.id+': no definitions');
   if(typeof SUMMARIES==='undefined'||!SUMMARIES[l.id])warn.push(l.id+': no closing summary');});
 const lecs=new Set(LECTURES.map(l=>l.id));
 QUESTIONS.forEach(q=>{dup(q.id);
   if(!lecs.has(q.lec))err.push(q.id+': unknown lecture '+q.lec);
   if(!q.sec)warn.push(q.id+': no sec (the "go to part" link will not work)');else if(!secs.has(q.sec))err.push(q.id+': unknown section '+q.sec);
   if(!q.src||!q.src.length)err.push(q.id+': no src');else q.src.forEach(s=>{if(!COURSE.sources[s.k])err.push(q.id+': source kind '+s.k+' not in course.json')});
   if(q.type==='mc'){if(!q.o||q.o.length<2)err.push(q.id+': mc needs options');else if(!(q.ans>=0&&q.ans<q.o.length))err.push(q.id+': ans out of range')}
   else if(q.type!=='open')err.push(q.id+': type must be mc or open');
   if(!q.a)warn.push(q.id+': no explanation');});
 const all=LECTURES.flatMap(l=>l.sections.map(s=>s.body)).join('\n')+(typeof SUMMARIES!=='undefined'?Object.values(SUMMARIES).join('\n'):'');
 [...all.matchAll(/<fig id="([^"]+)"/g)].forEach(m=>{if(!FIGS[m[1]])err.push('figure '+m[1]+' used but not in figures.js')});
 Object.keys(FIGS).forEach(k=>{if(typeof FIGEXPL==='undefined'||!FIGEXPL[k])warn.push('figure '+k+': no explanation in figexpl.js')});
 [...all.matchAll(/<ix id="([^"]+)"/g)].forEach(m=>{if(!WIDGETS[m[1]])err.push('lab '+m[1]+' used but not in widgets.js')});
 return {err,warn,counts:{lectures:LECTURES.length,sections:secs.size,questions:QUESTIONS.length,figures:Object.keys(FIGS).length,labs:Object.keys(WIDGETS).length}};
}"""

RENDER_CHECKS = r"""() => {
 const art=document.getElementById('lec'); const h=art.innerHTML; const r=[];
 ['<voice','<fig ','<ix '].forEach(t=>{if(h.includes(t))r.push('raw tag left: '+t)});
 if(document.querySelectorAll('#lec mjx-merror').length)r.push(document.querySelectorAll('#lec mjx-merror').length+' LaTeX errors');
 const raw=[...art.querySelectorAll('p,li,td,.formula,.note,.voice')].filter(e=>/\\\(|\\\[/.test(e.textContent)).length;
 if(raw)r.push(raw+' blocks with unrendered LaTeX');
 if(h.includes('Widget failed to load'))r.push('a lab failed to load');
 if(document.documentElement.scrollWidth>window.innerWidth+1)r.push('page scrolls sideways ('+document.documentElement.scrollWidth+'px)');
 return r;
}"""


async def main(path, shots):
    url = 'file://' + os.path.abspath(path)
    errors = 0
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--no-sandbox'])
        for width in (1300, 420):
            pg = await (await b.new_context(viewport={'width': width, 'height': 900})).new_page()
            perr = []; pg.on('pageerror', lambda e: perr.append(str(e)))
            await pg.goto(url + '#lectures'); await pg.wait_for_timeout(3000)
            if width == 1300:
                c = await pg.evaluate(CONTENT_CHECKS)
                print('content:', c['counts'])
                for e in c['err']: print('  ERROR', e); errors += 1
                for w in c['warn']: print('  warn ', w)
            for lid in await pg.evaluate('LECTURES.map(l=>l.id)'):
                await pg.evaluate("document.querySelector('.leclist [data-lec=%s]').click()" % lid)
                await pg.wait_for_timeout(2200)
                for prob in await pg.evaluate(RENDER_CHECKS):
                    print('  ERROR %s at %dpx: %s' % (lid, width, prob)); errors += 1
                if shots:
                    os.makedirs(shots, exist_ok=True)
                    await pg.screenshot(path=os.path.join(shots, '%s_%d.png' % (lid, width)), full_page=True)
            for view in ('dashboard', 'definitions', 'quiz', 'exam'):
                await pg.evaluate("location.hash='#%s'" % view); await pg.wait_for_timeout(900)
                if await pg.evaluate("document.documentElement.scrollWidth>window.innerWidth+1"):
                    print('  ERROR %s at %dpx: page scrolls sideways' % (view, width)); errors += 1
            await pg.evaluate("location.hash='#quiz'"); await pg.wait_for_timeout(500)
            await pg.evaluate("document.querySelector('[data-act=start]').click()"); await pg.wait_for_timeout(800)
            if not await pg.evaluate("!!document.querySelector('.qcard')"):
                print('  ERROR quiz run did not start at %dpx' % width); errors += 1
            for e in perr: print('  ERROR page error at %dpx: %s' % (width, e)); errors += 1
            await pg.close()
        await b.close()
    print('OK' if not errors else '%d error(s)' % errors)
    return errors


if __name__ == '__main__':
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    if not args: raise SystemExit(__doc__)
    shots = sys.argv[sys.argv.index('--shots') + 1] if '--shots' in sys.argv else None
    if shots in args: args.remove(shots)
    sys.exit(1 if asyncio.run(main(args[0], shots)) else 0)
