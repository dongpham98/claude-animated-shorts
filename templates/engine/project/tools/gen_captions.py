# Build src/videos/<slug>/captions.ts from words.json.
# usage: python3 tools/gen_captions.py <words.json> <out captions.ts> [--merge "nineteen nineteen,=1919,"] [--total-s 61.633]
# One caption per word: starts 1 frame before the word; holds until 1 frame before the next word if the gap < 0.35 s,
# else ends 0.25 s after the word. --merge joins consecutive spoken words into their written form (repeatable).
import json, sys, argparse
ap = argparse.ArgumentParser(); ap.add_argument("words"); ap.add_argument("out")
ap.add_argument("--merge", action="append", default=[]); ap.add_argument("--total-s", type=float, default=None); ap.add_argument("--fps", type=int, default=30)
a = ap.parse_args()
w = json.load(open(a.words))
merges = [(m.split("=")[0].split(), m.split("=")[1]) for m in a.merge]
caps, i = [], 0
while i < len(w):
    for src, dst in merges:
        if [x["word"] for x in w[i:i + len(src)]] == src:
            caps.append([dst, w[i]["start"], w[i + len(src) - 1]["end"]]); i += len(src); break
    else:
        caps.append([w[i]["word"], w[i]["start"], w[i]["end"]]); i += 1
total = a.total_s or caps[-1][2] + 0.6
out = []
for k, (t, s, e) in enumerate(caps):
    nxt = caps[k + 1][1] if k + 1 < len(caps) else total
    b = nxt - 0.03 if nxt - e < 0.35 else e + 0.25
    out.append((t, round((s - 0.03) * a.fps), round(b * a.fps)))
ts = "// Burned-in captions (one word at a time) from words.json: [text, first frame, end frame)\nexport const CAPTIONS: [string, number, number][] = [\n"
ts += ",\n".join(f"  [{json.dumps(t)}, {x}, {y}]" for t, x, y in out) + ",\n];\n"
open(a.out, "w").write(ts); print(len(out), "captions")
