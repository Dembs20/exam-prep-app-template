# Exam-prep app template

A template for single-page exam-preparation apps for university courses: lectures rewritten as continuous
explanations with cropped slide figures, interactive slider labs, clickable definitions, notes from the
lecture recordings, a quiz built from past exam and homework questions (each tagged with where it was asked),
and progress tracking per section, lecture and question. One HTML file, works offline, shareable.

The first full course built with it is `courses/network-science` (TU Delft EE4C06). It is kept as the
reference for content depth and style; `courses/example` is a two-lecture demo of every feature.

## Quick start

    python3 tools/new_course.py power-electronics --title "Power Electronics Prep" --subtitle "EE4xxx · TU Delft" --key pe
    # write the content in courses/power-electronics/ (docs/CONTENT_FORMAT.md)
    python3 tools/build.py courses/power-electronics
    python3 tools/test_render.py dist/power-electronics/Power_Electronics_Prep_Exam_Prep.html --shots shots/

`dist/<course>/index.html` is the version to publish as an artifact (MathJax from cdnjs);
`dist/<course>/<standaloneName>` is the offline file to share. The first standalone build fetches
mathjax@3.2.2 from npm into `tools/vendor/` (not committed).

## Layout

    engine/                course-independent code (do not put course content here)
      head.html            CSS (light/dark tokens), MathJax config, header with {{TITLE}} {{SUBTITLE}} {{LOGO_SVG}}
      widgets-core.html    helpers for interactive labs (plot, TeX labels, eigen-decomposition, ...)
      settings.html        themes, fonts, text size, highlighting + notes, bottom-right menu
      app.html             views, progress, quiz, definitions, navigation
    courses/<course>/      one folder per course: course.json + content files
    tools/
      build.py             assemble a course into the two HTML files
      test_render.py       content checks + rendering checks at 1300 px and 420 px
      crop_slides.py       crop figures out of slide PDFs into figures.js
      new_course.py        start a course from the example
      recordings/          download (Windows, yt-dlp) and transcribe lecture recordings
    docs/
      FEATURES.md          everything the app does (the spec)
      CONTENT_FORMAT.md    how to write each content file
      WORKFLOW.md          step-by-step: from course files to a published app
      STANDARDS.md         writing and quality standards, and the pitfalls already hit

Read docs/WORKFLOW.md first when building a new course.
