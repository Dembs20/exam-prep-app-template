# Features (the spec)

Everything below is implemented in `engine/` and driven by the content files of a course. When a future
version changes behaviour, update this file.

## Top bar and views
- Header: course logo (inline SVG from course.json), title, subtitle; tabs **Dashboard · Lectures · Definitions · Quiz · Exam bank**.
- Hash routing (`#dashboard`, `#lectures`, ...). Own **back / forward** buttons at the bottom right (an in-app history
  of view + lecture), placed above the settings button without covering content.

## Dashboard
- Overall progress ring = (sections understood + questions mastered) / (sections + questions).
- "Continue" button to the first not-understood section of the last opened lecture.
- **Exam coverage**: one bar per question source that has `cover` in course.json (e.g. exam prep set, homework).
- Per-lecture bars for reading (sections understood) and quiz (questions mastered).
- **To revisit**: questions answered wrong on the latest attempt, each a link that starts a one-question run.
- Progress data: show/copy as JSON, paste and load, reset (with confirmation).

## Lectures
- Left sidebar: all lectures with status dot, read/understood/quiz counts and a progress bar; the open lecture also
  lists its sections with their own dots. On phones the list becomes a horizontal scroller.
- Lecture header: progress bar, one **lecture status button** cycling unread → read → understood (understood marks
  all sections understood), optional recording line (`rec` in the lecture) with a microphone icon, table of contents.
- Sections: title with status dot, body HTML (see CONTENT_FORMAT), and an invisible end marker: a section turns
  **read** automatically once its end is scrolled into view.
- **Status dots** (grey unread, orange read, green understood) everywhere (sidebar, toc, section titles,
  navigator) and every dot is clickable to cycle the status by hand.
- **Section navigator**, Notion-like: thin lines at the right edge, one per section; hovering (or tapping) opens a
  panel listing the sections with dots; the section in view is highlighted; click to jump.
- End of lecture: **Taking stock** closing text (SUMMARIES), then two buttons that open panels:
  *Definitions in this lecture (n)* (each with a link to where it is introduced) and *Asked before in this lecture
  (n)* (exam/homework questions on this lecture, each with "Go to part" and "Practise"). Then "Quiz on lecture n"
  and "Next: lecture n+1".
- **Terms** written as `<dfn>` appear in the accent colour; clicking opens a popup with the definition from the
  definitions list and a button that jumps to (and flashes) the sentence where the term is introduced. Lookup by
  normalised text, with `aliases` and `defSections` in course.json for terms whose wording differs.
- **Figures**: cropped slide images with a source tag (e.g. "L2 slide 17") and caption; click (or Enter) opens a
  lightbox with the large image and a "How to read it" explanation (FIGEXPL).
- **Labs**: interactive boxes with sliders/selects and live plots; all labels and read-outs are rendered LaTeX
  (MathJax `tex2svg`), redrawn once MathJax is ready.
- **Recording notes**: `<voice>` blocks shown as "In class · recording r, mm:ss" (soft accent background) or
  "Exam tip from class · ..." (exam colour). Can be hidden from the menu.
- Notes (`div.note`) link the text to exam/homework questions ("Exam prep Q3 asks ...").

## Definitions
- All definitions grouped by lecture, live search filter, each with "where it is introduced" link.

## Quiz
- Setup: lecture (all / one), which questions (all / asked before only / per source with `filter` in course.json /
  not yet mastered / missed last time), order (in order / shuffled). Shows the number selected.
- Multiple choice: options shuffled per run (the correct one is stored first, `ans:0`), graded on click, verdict and
  explanation. Open questions: "Show solution", then the student marks "Yes, I had it" / "Not yet".
- Every question shows its source tags (where it was asked, e.g. "Exam prep Q4", "Homework 1 A.2", "In class, rec. 2 at 42:39").
- Previous / next / finish / quit; the result screen lists the missed ones.
- Per question: attempts, correct count, last result, time.

## Exam bank
- One panel per source with `bank` in course.json (grouped by the first source tag): every question with tag,
  latest result and "Practise".

## Bottom-right menu (settings)
- **Theme colour**: 10 accents, each with a light and a dark variant; **appearance** system / light / dark.
- **Text size**: 4 steps. **Letter type**: 6 readable fonts, applied to everything (body and headings).
- On lecture pages only: **mark mode** (select text to highlight in one of 6 colours; a banner shows the mode is on),
  **double-click any mark** (in or out of mark mode) to write/edit a note, change its colour or remove it;
  list of your marks in this lecture (jump to each); **notes from the recordings**: show / hide.
- Marks are stored as text offsets per section plus the marked text, and re-anchor on the text if the
  lecture text changed after an update.

## Storage
- localStorage, keys `<storageKey>-progress-v1` and `<storageKey>-settings`. Use a different storageKey per course:
  pages opened from file:// share one storage area, so two apps with the same key would overwrite each other.

## Output
- `index.html`: for publishing as an artifact (MathJax 3.2.2 from cdnjs).
- standalone file: complete HTML document with MathJax inlined (about 5 MB), works offline, can be sent to friends.
- Responsive down to 420 px phone width: no sideways page scroll; wide formulas scroll inside their own box.
