#!/usr/bin/env python3
"""Start a new course from the example course.

    python3 tools/new_course.py <folder-name> --title "Power Electronics Prep" --subtitle "EE4xxx · TU Delft · Lecturer" --key pe

Copies courses/example to courses/<folder-name> and fills in course.json. Then replace the example content.
"""
import argparse, json, os, re, shutil

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ap = argparse.ArgumentParser()
ap.add_argument('name'); ap.add_argument('--title', required=True); ap.add_argument('--subtitle', default='')
ap.add_argument('--key', required=True, help='short unique storage key, e.g. "pe" (progress is saved per key)')
a = ap.parse_args()
dst = os.path.join(ROOT, 'courses', a.name)
if os.path.exists(dst):
    raise SystemExit(dst + ' already exists')
shutil.copytree(os.path.join(ROOT, 'courses', 'example'), dst)
p = os.path.join(dst, 'course.json'); cfg = json.load(open(p))
cfg.update(title=a.title, subtitle=a.subtitle, storageKey=a.key,
           standaloneName=re.sub(r'\W+', '_', a.title).strip('_') + '_Exam_Prep.html', aliases={}, defSections={})
json.dump(cfg, open(p, 'w'), indent=2, ensure_ascii=False)
print('created', os.path.relpath(dst, ROOT), '- now replace the example content (see docs/CONTENT_FORMAT.md)')
