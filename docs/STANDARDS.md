# Standards and pitfalls

## What the student values (learned over four course apps)
- **Continuous explanation, not slide dumps.** Slides are information-dense but explain little; the text between
  them carries the understanding. Fewer figures, more prose, and a closing text per lecture.
- **Formulas kept and explained**: every symbol named, why the formula holds (a one-line derivation or counting
  argument), what it means, and a small numerical example. Long display formulas split with `aligned`.
- **Interactive labs with sliders** to feel how a quantity behaves; labels and read-outs in rendered LaTeX, never
  plain-text formulas.
- **Figures cropped from the slides and exam files**, complete (never cut off), clickable with an explanation.
- **Where it was asked**: every quiz question tagged with its source; "asked before" lists per lecture.
- **Progress at every level**: section, lecture, question; status dots that can be clicked.
- Consistent styling: theme colours with light and dark variants, text size, fonts applied everywhere.
- A file that friends can open (standalone HTML).

## Writing
- Explain in the order a student needs it: motivation → definition → why/derivation → example → link to exam.
- Paraphrase; do not copy long passages of the slides or the lecturer's words. Quotes from recordings stay short.
- Numbers in examples and answers are computed, not guessed (keep the check script, e.g. verify_*.py).
- Flag differences between sources (slides vs exam set vs recording of an earlier year) instead of silently picking one.
- Notes connect text to questions: "Exam prep Q4 asks ... ; Homework 1 A.1(d) gives ...".
- Mark what is not examined when the lecturer or the slides say so.

## Quiz questions
- Correct option first with `ans:0`; distractors are plausible mistakes (wrong formula, off-by-one, confused
  definition), not nonsense.
- The explanation says why the right answer is right and, where useful, why the tempting wrong one is wrong.
- Open questions get a complete worked solution.

## Technical pitfalls already hit (do not repeat)
- **Backslashes.** Write patch scripts and content with the Write tool. A shell heredoc with a regex that replaced
  `\;` corrupted every `;` in a file once. In Python use raw strings (`r"""..."""`), `chr(92)` for a single
  backslash in code, never end a raw triple-quoted string with a quote character and never write `\"` inside one.
- In `R\`...\`` content there must be no backtick and no `${`. Definition titles are normal strings: double the
  backslashes there.
- Patch by exact anchors and assert each anchor occurs exactly once before replacing.
- **MathJax**: config `svg.fontCache:'local'`; typeset after every render; labs render synchronously with
  `MathJax.tex2svg` and register a redraw for when MathJax is ready (`reg`). Clamp tiny numbers to 0 to avoid "−0".
- **Phone width**: grid children need `min-width:0`; wide formulas get `overflow-x:auto`; test at 420 px
  (test_render does). A 1 px overflow of a display formula was fixed with `#lec{overflow-x:clip}`.
- **Figures**: fixed crop windows cut slides off; always preview every crop. Whitening a colour over the whole
  crop also removed a blue slide title; limit it with `below`. Logo masks are per deck: check them.
- **Storage keys** must differ per course (file:// pages share localStorage).
- **Ids are stored in progress**: never rename lecture, section or question ids after sharing; add `l1s2b` style ids instead.
- **Artifacts**: republish from the same file path in the same conversation to keep the URL; from a new
  conversation, read the artifact first and publish with its URL.
- **Workspace**: the cloud workspace is temporary and private to one conversation. Keep the course source in the
  template repository (or the student's folder) and push after each working session.
- **Long conversations get expensive and get summarised**: start a new conversation for a new phase (new course,
  big extraction) and work from the repository and the recordings folder.
- **Recordings**: some Collegerama entries are empty or silent; the `ba` stream can be silent while another stream
  has audio; cookies expire after hours; transcribe in chunks (a whole file ran out of memory); load the
  Whisper model from the local cache (online checks hung); background jobs stop after about 2 hours.
