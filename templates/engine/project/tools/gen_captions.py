# Build src/videos/<slug>/captions.ts from words.json.
# usage: python3 tools/gen_captions.py <words.json> <out captions.ts> [--merge "nineteen nineteen,=1919,"] [--total-s 61.633]
# One caption per word: starts 1 frame before the word; holds until 1 frame before the next word if the gap < 0.35 s,
# else ends 0.25 s after the word. --merge joins consecutive spoken words into their written form (repeatable); the match
# ignores case and trailing punctuation, and the last word's punctuation is kept ("sixty-five people." -> "65 people.").
# --min-frames (default 3): no caption shorter than this; the next word's start is pushed back to make room.
import json, sys, argparse
ap = argparse.ArgumentParser(); ap.add_argument("words"); ap.add_argument("out")
ap.add_argument("--merge", action="append", default=[]); ap.add_argument("--total-s", type=float, default=None); ap.add_argument("--fps", type=int, default=30)
ap.add_argument("--min-frames", type=int, default=3)
a = ap.parse_args()
w = json.load(open(a.words))
merges = [(m.split("=")[0].split(), m.split("=")[1]) for m in a.merge]
import re
norm = lambda s: re.sub(r"[^\w'-]", "", s).lower()
caps, i = [], 0
while i < len(w):
    for src, dst in merges:
        seg = w[i:i + len(src)]
        if len(seg) == len(src) and [norm(x["word"]) for x in seg] == [norm(x) for x in src]:
            tail = re.search(r"[^\w']*$", seg[-1]["word"]).group(0)
            caps.append([dst.rstrip(".,!?;:") + tail, seg[0]["start"], seg[-1]["end"]]); i += len(src); break
    else:
        caps.append([w[i]["word"], w[i]["start"], w[i]["end"]]); i += 1
total = a.total_s or caps[-1][2] + 0.6
out = []
for k, (t, s, e) in enumerate(caps):
    nxt = caps[k + 1][1] if k + 1 < len(caps) else total
    b = nxt - 0.03 if nxt - e < 0.35 else e + 0.25
    out.append([t, round((s - 0.03) * a.fps), round(b * a.fps)])
for k in range(len(out)):                      # minimum on-screen time; shift the following word if needed
    if out[k][2] - out[k][1] < a.min_frames:
        out[k][2] = out[k][1] + a.min_frames
        if k + 1 < len(out) and out[k + 1][1] < out[k][2]:
            out[k + 1][1] = out[k][2]; out[k + 1][2] = max(out[k + 1][2], out[k + 1][1] + 1)
ts = "// Burned-in captions (one word at a time) from words.json: [text, first frame, end frame)\nexport const CAPTIONS: [string, number, number][] = [\n"
ts += ",\n".join(f"  [{json.dumps(t)}, {x}, {y}]" for t, x, y in out) + ",\n];\n"
open(a.out, "w").write(ts); print(len(out), "captions")
