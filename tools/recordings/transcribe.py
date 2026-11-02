#!/usr/bin/env python3
"""Transcribe lecture recordings with faster-whisper (CPU), in 10-minute chunks.

    python3 transcribe.py AUDIO [AUDIO ...] --out DIR [--model small] [--chunk 600]

For every input file NAME.m4a/.mp4/.wav this writes DIR/NAME_transcript.txt (one "[MMM:SS] text" line per
segment) and DIR/NAME_segments.json (start, end, text). Files that already have a segments file are skipped,
so an interrupted batch can simply be restarted. Silent files are reported and skipped.
"""
import argparse, glob, json, os, re, subprocess, sys, time, wave

import numpy as np


def loudness(path):
    """Mean and max volume in dB over the whole file (ffmpeg volumedetect)."""
    r = subprocess.run(['ffmpeg', '-hide_banner', '-i', path, '-af', 'volumedetect', '-f', 'null', '-'],
                       capture_output=True, text=True)
    mean = re.search(r'mean_volume: (-?[\d.]+) dB', r.stderr)
    peak = re.search(r'max_volume: (-?[\d.]+) dB', r.stderr)
    return (float(mean.group(1)) if mean else None, float(peak.group(1)) if peak else None)


def to_wav(path, wav):
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', path, '-ac', '1', '-ar', '16000', wav], check=True)


def local_model(name):
    """Path of a cached Systran/faster-whisper-<name> snapshot, so the model loads offline."""
    hits = glob.glob(os.path.expanduser('~/.cache/huggingface/hub/models--Systran--faster-whisper-%s/snapshots/*' % name))
    return hits[0] if hits else None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('audio', nargs='+')
    ap.add_argument('--out', required=True)
    ap.add_argument('--model', default='small')
    ap.add_argument('--chunk', type=int, default=600, help='chunk length in seconds')
    a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)

    from faster_whisper import WhisperModel
    path = local_model(a.model)
    if path:
        os.environ['HF_HUB_OFFLINE'] = '1'
    model = WhisperModel(path or a.model, device='cpu', compute_type='int8')

    for src in a.audio:
        name = os.path.splitext(os.path.basename(src))[0]
        seg_path = os.path.join(a.out, name + '_segments.json')
        if os.path.exists(seg_path) and os.path.getsize(seg_path) > 2:
            print(name, 'already transcribed, skipped', flush=True)
            continue
        mean, peak = loudness(src)
        if peak is not None and peak < -45:
            print(name, 'is silent (max %.1f dB), skipped: try another stream of this recording' % peak, flush=True)
            continue
        wav = os.path.join(a.out, name + '.tmp.wav')
        to_wav(src, wav)
        w = wave.open(wav); sr = w.getframerate(); n = w.getnframes(); t0 = time.time(); out = []
        with open(os.path.join(a.out, name + '_transcript.txt'), 'w') as f:
            for k in range(0, n, a.chunk * sr):
                w.setpos(k)
                audio = np.frombuffer(w.readframes(min(a.chunk * sr, n - k)), dtype=np.int16).astype(np.float32) / 32768
                off = k / sr
                segs, _ = model.transcribe(audio, language='en', beam_size=1, vad_filter=True,
                                           condition_on_previous_text=False)
                for s in segs:
                    st = s.start + off
                    out.append({'start': round(st, 1), 'end': round(s.end + off, 1), 'text': s.text.strip()})
                    f.write('[%03d:%02d] %s\n' % (int(st // 60), int(st % 60), s.text.strip()))
                f.flush()
                print(name, 'up to minute', int((off + a.chunk) // 60), flush=True)
        w.close(); os.remove(wav)
        json.dump(out, open(seg_path, 'w'))
        print(name, 'done in %d s, %d segments' % (time.time() - t0, len(out)), flush=True)


if __name__ == '__main__':
    main()
