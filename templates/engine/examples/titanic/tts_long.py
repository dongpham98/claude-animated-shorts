# Long-form Kokoro narration with exact word timings and per-sentence pauses.
# usage: python3 tts_long.py voice/lines.json <voice> <speed> <outdir> [first_n]
import sys, json, re, os, numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
KD = os.path.expanduser(os.environ.get('KOKORO_DIR', '~/tts'))
k = Kokoro(os.path.join(KD, 'kokoro-dur.onnx'), os.path.join(KD, 'voices-v1.0.bin'))
L = json.load(open(sys.argv[1])); voice, speed, outdir = sys.argv[2], float(sys.argv[3]), sys.argv[4]
if len(sys.argv) > 5: L = L[:int(sys.argv[5])]
SR = 24000
parts, words, t0, chapters, bad = [], [], 0.0, [], 0
for li, Ln in enumerate(L):
    l = Ln['tts']
    if not chapters or chapters[-1]['name'] != Ln['ch']:
        chapters.append({'name': Ln['ch'], 'start': round(t0, 3)})
    ph = k.tokenizer.phonemize(l, 'en-us'); toks = k.tokenizer.tokenize(ph)
    style = k._style_for(k.get_voice_style(voice), len(toks))
    o = k.sess.run(None, {'tokens': np.array([[0, *toks, 0]]), 'style': style, 'speed': np.array([speed], np.float32)})
    a, dur = o[0].ravel(), o[1].ravel().astype(float)
    spf = len(a) / dur.sum(); known = k.tokenizer.known(ph)
    edges = np.concatenate([[0], np.cumsum(dur)]) * spf
    wr, cur = [], None
    for i, c in enumerate(known):
        if c.isspace() or re.match(r'[.,!?;:\-—…"“”()]', c):
            if cur: wr.append(cur); cur = None
        else: cur = [i, i] if cur is None else [cur[0], i]
    if cur: wr.append(cur)
    out = []
    for a0, a1 in wr:
        w = known[a0:a1+1]
        m = re.match(r'(.+?)(ðə|ɐ|əv|ɾəv)$', w) if len(w) > 3 and re.search(r'(ðə|əv)$', w) else None
        if m and not w.startswith('ðə'):
            cut = a0 + len(m.group(1)) - (1 if m.group(2) == 'əv' and w[len(m.group(1))-1] == 'ɾ' else 0)
            out += [[a0, cut-1], [cut, a1]]
        else: out.append([a0, a1])
    spans = [[edges[a+1], edges[b+2]] for a, b in out]
    plen = [b - a + 1 for a, b in out]
    tw = l.split()
    wl = [max(1, len(re.sub(r'\s', '', k.tokenizer.phonemize(re.sub(r"[^\w'\-]", '', w) or w, 'en-us')))) for w in tw]
    # DP alignment: a phoneme span may hold 1-3 text words (fused 'than a'), a text word may span 1-3 phoneme spans
    INF = 1e9; n, m = len(spans), len(tw)
    D = [[INF]*(m+1) for _ in range(n+1)]; B = [[None]*(m+1) for _ in range(n+1)]; D[0][0] = 0
    for i in range(n+1):
        for j in range(m+1):
            if D[i][j] >= INF: continue
            for di, dj in ((1,1),(1,2),(1,3),(2,1),(3,1)):
                if i+di > n or j+dj > m: continue
                c = abs(sum(plen[i:i+di]) - sum(wl[j:j+dj])) + (0 if (di, dj) == (1, 1) else 2)
                if D[i][j] + c < D[i+di][j+dj]: D[i+di][j+dj] = D[i][j] + c; B[i+di][j+dj] = (di, dj)
    tspans = []
    if D[n][m] >= INF:
        bad += 1; print(f"MISMATCH line {li}: {n} vs {m}: {l} -> {ph}")
    else:
        i, j, segs = n, m, []
        while i or j:
            di, dj = B[i][j]; segs.append((i-di, i, j-dj, j)); i -= di; j -= dj
        for i0, i1, j0, j1 in reversed(segs):
            s0, s1 = spans[i0][0], spans[i1-1][1]
            if j1 - j0 == 1: tspans.append([s0, s1])
            else:
                tot = sum(wl[j0:j1]); acc = s0
                for q in range(j0, j1):
                    d = (s1 - s0) * wl[q] / tot; tspans.append([acc, acc + d]); acc += d
        if n != m: print(f"  realigned line {li}: {n} spans -> {m} words")
    spans = tspans
    idx = np.where(np.abs(a) > 0.01)[0]; lo, hi = max(0, idx[0]-480), idx[-1]+960
    a = a[lo:hi]
    for j in range(min(len(spans), len(tw))):
        s, e = spans[j]
        words.append({"word": tw[j], "start": round(max(s-lo, 0)/SR + t0, 3), "end": round(min(e-lo, len(a))/SR + t0, 3), "line": li})
    g = Ln['gap']; parts += [a, np.zeros(int(SR*g), np.float32)]; t0 += (len(a) + int(SR*g)) / SR
y = np.concatenate(parts); y = y/np.abs(y).max()*0.89
sf.write(f"{outdir}/voice.wav", y, SR)
json.dump(words, open(f"{outdir}/words.json", "w"), indent=1)
json.dump(chapters, open(f"{outdir}/chapters.json", "w"), indent=1)
w = sum(len(x['shown'].split()) for x in L); d = len(y)/SR
print(f"{d:.2f}s ({d/60:.2f} min), {w/d:.2f} w/s overall, {len(words)} words timed, {bad} mismatched lines")
