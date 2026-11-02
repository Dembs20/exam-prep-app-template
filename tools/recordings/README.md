# Lecture recordings: download and transcribe

Notes from the lecturer ("In class" boxes, exam tips, questions asked in class) come from the course's
lecture recordings. TU Delft Collegerama runs on Mediasite, which yt-dlp supports.

## On the student's Windows computer (one-time setup)
1. Install yt-dlp into their Python: `python -m pip install -U yt-dlp` (Anaconda prompts show `(base)`).
2. Install the Brave/Chrome extension **Get cookies.txt LOCALLY**.
3. Make a recordings folder, e.g. `Videos\<COURSE> recordings`, with `audio\`, `video\` and `transcripts\`,
   and copy `download.ps1`, `download.bat`, `check_streams.bat`, `lectures.txt` into it
   (these files keep Windows CRLF line endings).

## Per batch of lectures
1. Player link per lecture: take the code after `/presentation/` in the portal link (up to the `?`) and
   append it to `https://collegerama.tudelft.nl/Mediasite/Play/`. One link per line in `lectures.txt`.
2. Open one player link in the browser, check it plays, export `cookies.txt` into the folder
   (extension → Export). Logins expire after some hours: re-export when downloads fail with 401/403.
3. Double-click `download.bat`: up to 4 lectures download at once as `audio\<title>.m4a`; existing files are skipped.
4. If a file turns out silent, double-click `check_streams.bat` (writes `titles.txt` and `streams.txt`, downloads
   nothing) and pick the stream that has audio. Some Collegerama entries are genuinely empty (black thumbnail):
   check in the browser before spending time on them.

## Transcribing (in the cloud workspace)
Stage the audio files, then:

    pip install --break-system-packages faster-whisper
    python3 tools/recordings/transcribe.py /path/to/audio/*.m4a --out transcripts/

- Runs on CPU with the `small` model (about 15 minutes per 2-hour lecture on 2 cores), in 10-minute chunks
  so memory stays low (a whole 2-hour file at once was killed for running out of memory).
- Skips files that are silent (checked with ffmpeg first) instead of producing empty transcripts.
- Once the model is in the Hugging Face cache, it runs offline (online update checks were seen to hang).
- Long batches: a background job may be stopped after about 2 hours. The script skips recordings that
  already have a `_segments.json`, so just start it again.

Keep raw transcripts private (they are the lecturer's words); the app only contains paraphrased notes.
