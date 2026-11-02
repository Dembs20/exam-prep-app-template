# Content format

A course is a folder `courses/<name>/` with `course.json` and plain JavaScript content files. `build.py` loads them
in the order listed in `course.json` "content", after defining `COURSE` (from course.json), `LECTURES=[]` and
`R=String.raw`. Look at `courses/example/` for a minimal version of every file and at `courses/network-science/`
for a complete course.

## course.json

| key | meaning |
|---|---|
| title, subtitle | header text (e.g. "Network Science Prep", "EE4C06 · TU Delft · Van Mieghem") and page title |
| storageKey | short unique key for saved progress and settings (one per course!) |
| standaloneName | file name of the offline file |
| logoSvg | inline `<svg viewBox="0 0 100 100">` for the header; use `currentColor` and `var(--accent)` |
| content | content files in load order (figures first, then lectures, questions, widgets, figexpl, summaries) |
| defSearchHint | placeholder of the definitions search box |
| askedFilter | label of the quiz filter "asked before only" (questions whose first source has `asked: true`) |
| sources | the four question source kinds `exam`, `hw`, `lec`, `rec` (fixed kinds; they have colours in the CSS) with: `cover` (dashboard coverage label), `from` (dashboard sentence, e.g. "from the exam-prep set"), `filter` (quiz filter label), `bank` (exam-bank group title), `bankCount` (add "(n questions)"), `asked` (counts as asked before) |
| aliases | normalised term → normalised definition title, for `<dfn>` words that differ from the definition title. Normalised = lower case, letters only, LaTeX removed: "Nyquist–Shannon sampling theorem" → `nyquistshannonsamplingtheorem` |
| defSections | normalised definition title → section id, when "where it is introduced" should point to a section that has no `<dfn>` for it |

## Lectures: `LECTURES.push({...})`

```js
LECTURES.push({id:'l1', num:1, title:'Introduction and representation of networks', short:'Representation',
  rec:'Includes notes from the 2022 recording of this lecture (recording 1). ...',      // optional
  sections:[ {id:'l1s1', title:'What a graph is', body:R`...HTML...`}, ... ],
  defs:[ {t:'Graph', d:R`Set of \(N\) nodes ...`}, ... ]});
```
- ids: lectures `l1`..`lN`, sections `l1s1`, `l1s2`, (`l1s2b` for an inserted one). Ids are stored in the student's
  progress: do not rename them once the app is shared.
- `short` is used in the sidebar and quiz selector.
- Definition titles are ordinary JS strings: write LaTeX in them with doubled backslashes,
  `{t:'Spectral radius \\(\\lambda_1\\)', ...}`; bodies use `R\`...\`` and single backslashes.

### Section body markup (inside `R\`...\``)
| markup | renders as |
|---|---|
| `<p>`, `<h4>`, `<ul>`, `<strong>`, `<em>` | normal text; keep paragraphs short and explanatory |
| `\( ... \)` and `\[ ... \]` | inline and display LaTeX (MathJax) |
| `<div class="formula">\[ ... \]</div>` | display formula in a tinted box; use `\begin{aligned}` to split long ones |
| `<dfn>term</dfn>` | clickable term with definition popup (must match a definition title, an alias, or a prefix) |
| `<fig id="l2_cluster" src="L2 slide 17">caption</fig>` | figure from FIGS with source tag, caption, lightbox with FIGEXPL[id] |
| `<div class="note">...</div>` | exam-coloured side note, typically linking to exam/homework questions |
| `<div class="note lec">...</div>` | note in the lecture colour (e.g. "not covered in the recording") |
| `<voice r="2" t="42:39">...</voice>` | "In class · recording 2, 42:39" note; add `hint` for an exam tip: `<voice r="2" t="42:39" hint>` |
| `<ix id="graphlab" title="..."></ix>` | interactive lab WIDGETS.graphlab |
| `<div class="tablewrap"><table>...</table></div>` | scrollable table |
| inline `<svg>` | small drawings; use `currentColor`, `var(--accent)`, `var(--accent-ink)` so they work in dark mode |

## Questions: `const QUESTIONS=[...]`
```js
{id:'e03', lec:'l2', sec:'l2s2', type:'mc', src:[{k:'exam', r:'Exam prep Q3'}],
 q:R`Compute the transitivity of ...`, o:[R`\(3/4\)`, R`\(1/2\)`, R`\(5/6\)`, R`\(1\)`], ans:0,
 a:R`Explanation / worked solution ...`},
{id:'h02', lec:'l2', sec:'l2s2', type:'open', src:[{k:'hw', r:'Homework 1 A.1(c)'}], q:R`...`, a:R`...`}
```
- `src`: the first entry decides the exam-bank group and whether it counts as "asked before"; add more entries for
  other places the question appears (e.g. `{k:'rec', r:'In class, rec. 3 at 43:07'}` when the lecturer stressed it).
- Conventions: ids `eNN` exam set, `hNN` homework/exercise sessions, `cNN` lecture concept checks, `rNN` from
  recordings. Always give `sec` so "Go to part" works.
- Write the correct option first and keep `ans:0` (options are shuffled on screen).

## Figures: `const FIGS={id:'data:image/jpeg;base64,...'}`
Written by `tools/crop_slides.py`; keep its spec next to it (`figures.spec.json`).

## Figure explanations: `const FIGEXPL={id:R\`<p>...</p>\`}`
How to read the figure: axes, what each part shows, what to notice, which exam question uses it.

## Closing summaries: `const SUMMARIES={l1:R\`<p>...</p>\`}`
"Taking stock" at the end of each lecture: the thread of the lecture in a few paragraphs, the formulas that matter
and the computation worth rehearsing. May contain `<voice>` notes (e.g. the lecturer's own summary).

## Labs: `WIDGETS.<id>=function(box){...}`
Build the controls and SVG inside `box`, draw, and re-draw on input. Helpers (engine/widgets-core.html):
`plot(svg,W,H,pad,xs,[ys...],{xmin,xmax,ymin,ymax,xlabel,ylabel,xticks,yticks,bars,colors})` returns `{X,Y}` scale
functions; `svgTex(svg,tex,x,y,{fs,anchor,color,rot})` TeX label inside SVG; `setMath(node,html)` sets HTML with
`\( \)` rendered synchronously; `line(label,html)` read-out line; `T(tex)` + `ctrlTex(box)` for control labels;
`reg(box,fn)` re-draw when MathJax becomes ready; `rafd(fn)` throttle to animation frames; `tnum(x,d)`, `tfr(x)`
(fractions), `tvec(v)`; `eig(M)` symmetric eigen-decomposition; `el(tag,attrs)` SVG element; `binom(n,k)`.
Pattern: see `courses/example/widgets.js`.
