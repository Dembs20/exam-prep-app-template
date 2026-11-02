# Workflow: from course files to a published app

The order matters: gather and understand the material first, then write, then build and check. Tell the student at
the start what you will build, keep a task list, and send drafts early (a first lecture is enough to get feedback).

## 0. Get the material
- Slides of every lecture (PDF), the exam-preparation set or past exams (with solutions), homework and exercise
  sessions (with solutions), the formula sheet if there is one, and the lecture recordings if available.
- Ask which earlier apps they liked (this template grew out of apps for Power Electronics, Cyber Security of Power
  Grids, Microgrids and Network Science) and keep the same feel.
- Check the exam format in the current exam material (open/closed book, formula sheet, multiple choice) and do not
  trust what a recording from an earlier year says about it.

## 1. Inventory
- Read every PDF fully. For each lecture list the topics in order; these become the sections (5–8 per lecture).
- Map every exam and homework question to its lecture and section. This table drives the "asked before" tags,
  the notes in the text and the quiz.
- Note what the slides only state and need explaining, and which concepts would profit from a slider lab.

## 2. Start the course
    python3 tools/new_course.py <name> --title "<Course> Prep" --subtitle "<code> · <university> · <lecturer>" --key <short>
Pick a logo: a simple inline SVG that suggests the subject (viewBox 0 0 100 100, `currentColor` + `var(--accent)`).

## 3. Figures
- Choose few, meaningful figures: about 5–8 per lecture, the diagrams and worked examples, not text slides.
- `python3 tools/crop_slides.py spec.json --out courses/<name>/figures.js --grid L1:13` writes a page with a 5 %
  grid; read off the region of one slide and define it once as a layout for the whole deck.
- Run with `--preview prev/` and look at **every** crop (`prev/_contact_sheet.png`, then single PNGs at full size):
  nothing may be cut off; remove footer bars, logos and slide numbers.
- Write FIGEXPL for every figure.

## 4. Lectures
- Write each section as continuous explanation (docs/STANDARDS.md): motivate, define, derive, explain each term of
  every formula, give a small worked example with numbers checked by code, connect to the exam questions in a note.
- Definitions list per lecture; every `<dfn>` in the text must resolve (test_render warns otherwise).
- Closing summary per lecture.
- Do lecture 1 (and 2) first, show it, adjust to feedback, then continue.

## 5. Questions
- Every question of the exam-prep set and of the homework/exercise sessions, as multiple choice where the answer is a
  value or a statement, as open (worked solution) where the derivation is the point.
- Concept checks per lecture for the important ideas that no exam question covers.
- Verify every numerical answer by computing it (Python, numpy, networkx, sympy).

## 6. Labs
Where moving a parameter shows an idea better than text (a threshold, a trade-off, how a spectrum changes),
add a lab: sliders on the left, plot and live read-out with rendered formulas on the right.

## 7. Build, test, publish
    python3 tools/build.py courses/<name>
    python3 tools/test_render.py dist/<name>/<standalone>.html --shots shots/
- Fix every ERROR; read the warnings. Look at the screenshots of each lecture at 1300 px and 420 px.
- Publish `dist/<name>/index.html` as an artifact (keep the same file path in the conversation so the URL stays;
  from another conversation read the artifact first and publish to its URL). Send the standalone file too.
- Commit the course folder to the template repository: the cloud workspace is temporary.

## 8. Recordings (optional, adds the lecturer's voice)
See tools/recordings/README.md for downloading (on the student's Windows computer) and transcribing.
- Identify first what each recording is (lecture n, homework session, unrelated) and keep an index file
  (recordings_index.txt) in the recordings folder. Recording numbers are not lecture numbers.
- Transcripts cost nothing to produce but tokens to read: transcribe everything first, then analyse each recording
  with its own subagent and a fixed checklist, instead of reading transcripts piece by piece in the main
  conversation:
  - what the recording covers and which sections it maps to
  - explanations, examples and analogies that go beyond the slides (with mm:ss)
  - explicit exam remarks: "not part of the exam", "put this on your formula sheet", "never forget", typical traps
  - questions the lecturer asks the room, with his answer (new quiz questions, src `rec`)
  - worked homework/exercise solutions and how he explains them (attach to the existing h/e questions)
  - places where the recording (older year) differs from the current slides
- Integrate as `<voice>` notes (paraphrased, never long quotes), `rec` questions and extra `rec` source tags, and a
  `rec` line per lecture. Spot-check the subagent notes against the transcript before they go in.

## 9. Iterate
The student will ask for changes (layout, wording, more depth). Make targeted edits in the content files with small
Python patch scripts written with the Write tool (see STANDARDS: pitfalls), rebuild, re-test, republish.
