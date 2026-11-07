# Kokoro narration + exact per-word timings (no speech recognition needed).
# usage: python3 tts/tts_timed.py <script_tts.txt (one sentence per line, as spoken)> <script_shown.txt (same lines as the
#   captions should read; may equal the first)> <voice e.g. am_puck> <speed e.g. 1.2> <outdir>  -> outdir/voice.wav + words.json
# needs: bash tts/get_models.sh (models + patched kokoro-dur.onnx in $KOKORO_DIR, default ~/tts)
import sys, json, re, numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
import os
KD = os.path.expanduser(os.environ.get('KOKORO_DIR', '~/tts'))
k = Kokoro(os.path.join(KD, 'kokoro-dur.onnx'), os.path.join(KD, 'voices-v1.0.bin'))
script, shown, voice, speed, outdir = sys.argv[1:6]; speed = float(speed)
lines = [l.strip() for l in open(script) if l.strip()]
shown_lines = [l.strip() for l in open(shown) if l.strip()]
SR, GAP = 24000, 0.12
parts, words, t0 = [], [], 0.0
for li, (l, sl) in enumerate(zip(lines, shown_lines)):
    ph = k.tokenizer.phonemize(l, 'en-us')
    toks = k.tokenizer.tokenize(ph)
    style = k._style_for(k.get_voice_style(voice), len(toks))
    o = k.sess.run(None, {'tokens': np.array([[0,*toks,0]]), 'style': style, 'speed': np.array([speed], np.float32)})
    a, dur = o[0].ravel(), o[1].ravel().astype(float)                     # frames per token incl. pad at both ends
    spf = len(a) / dur.sum()
    known = k.tokenizer.known(ph)
    assert len(known) == len(toks), (len(known), len(toks))
    edges = np.concatenate([[0], np.cumsum(dur)]) * spf  # sample edges; token i = dur[i+1]
    # phoneme-word spans as char ranges, then split espeak's fused function words
    wr, cur = [], None
    for i, c in enumerate(known):
        if c.isspace() or re.match(r'[.,!?;:\-—…"“”()]', c):
            if cur: wr.append(cur); cur = None
        else:
            cur = [i, i] if cur is None else [cur[0], i]
    if cur: wr.append(cur)
    out = []
    for a0, a1 in wr:
        w = known[a0:a1+1]
        m = re.match(r'(.+?)(ðə|ɐ|əv|ɾəv)$', w) if len(w) > 3 and re.search(r'(ðə|əv)$', w) else None
        if m and not w.startswith('ðə'):
            cut = a0 + len(m.group(1)) - (1 if m.group(2)=='əv' and w[len(m.group(1))-1]=='ɾ' else 0)
            out += [[a0, cut-1], [cut, a1]]
        else:
            out.append([a0, a1])
    spans = [[edges[a+1], edges[b+2]] for a, b in out]
    tw = l.split()
    if len(spans) != len(tw):
        print(f"line {li+1}: {len(spans)} phoneme words vs {len(tw)} text words -> {ph}")
    # trim edges as in say.py
    idx = np.where(np.abs(a) > 0.01)[0]; lo, hi = max(0, idx[0]-480), idx[-1]+960
    a = a[lo:hi]
    n = min(len(spans), len(tw))
    for j in range(n):
        s, e = spans[j]; s = max(s-lo, 0)/SR + t0; e = min(e-lo, len(a))/SR + t0
        words.append({"word": tw[j], "start": round(s, 3), "end": round(e, 3), "line": li+1})
    parts += [a, np.zeros(int(SR*GAP), np.float32)]
    t0 += (len(a) + int(SR*GAP)) / SR
y = np.concatenate(parts[:-1]); y = y/np.abs(y).max()*0.89
sf.write(f"{outdir}/voice.wav", y, SR)
json.dump(words, open(f"{outdir}/words.json", "w"), indent=1)
w = sum(len(l.split()) for l in shown_lines)
print(f"{len(y)/SR:.2f}s, {w/(len(y)/SR):.2f} w/s, {len(words)}/{w} words timed")
