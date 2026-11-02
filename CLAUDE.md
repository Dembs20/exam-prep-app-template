# Exam-prep app template

This repository builds single-page exam-prep apps for university courses (one folder per course in `courses/`).

- Before building or changing a course, read `docs/WORKFLOW.md` and `docs/STANDARDS.md`; `docs/FEATURES.md` is the
  spec and `docs/CONTENT_FORMAT.md` the content format. `courses/network-science/` is the reference for depth and
  style, `courses/example/` the minimal demo.
- Course content goes in `courses/<name>/`; `engine/` is shared by all courses. A change to the engine must keep
  every course building: rebuild and test them all.
- Build: `python3 tools/build.py courses/<name>`. Test: `python3 tools/test_render.py dist/<name>/<file>.html --shots shots/`
  (fix all errors, look at the screenshots at 1300 px and 420 px).
- Never rename lecture, section or question ids of a shared course (they are stored in students' progress).
- Commit and push the course folder at the end of every working session; the cloud workspace is temporary.
