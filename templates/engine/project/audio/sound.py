# Sound for one video (worked example: "The Syrup That Outran People"). Rewrite music() and sfx() cue tables per story;
# keep main() (the mix rule). Synth libraries: templates/audio (copied to audio/lib by setup.sh).
# Sound for "The Syrup That Outran People" (molasses short): an original score (own synthesis, the skill's
# instruments.py), synthesized SFX on the picture's event times (sfx_gen.py), and the final mix: voice unchanged,
# music ducked under speech, SFX bed, master to -14 LUFS, <= -1 dBTP, 48 kHz stereo, exactly the picture length.
# usage: python3 sound.py <voice.wav> <words.json> <outdir>
import os, sys, json
import numpy as np
from scipy import signal
_HERE = os.path.dirname(os.path.abspath(__file__))
for _c in [os.environ.get("AUDIO_LIB", ""), os.path.join(_HERE, "lib"), os.path.join(_HERE, "..", "..", "..", "audio")]:
    if _c and os.path.exists(os.path.join(_c, "dsp.py")):
        sys.path.insert(0, _c); break
from dsp import (SR, ns, st, dbg, rng, lp, hp, bp, pan, place, widen, make_ir, convolve_st, integrated, momentary_max,
                 true_peak, read_wav, write_wav, colored, fades, ramp)
import instruments as I
import sfx_gen as X

FPS, TOTAL = 30, 1849
DUR = TOTAL / FPS
N = ns(DUR)
m2f = I.m2f
BEAT = 60 / 108
R = rng(7)

def safe(fn, *a, **k):
    try:
        y = fn(*a, **k)
        return np.asarray(y, float)
    except Exception as e:  # one bad generator call must never kill the mix
        print("  skip", getattr(fn, "__name__", fn), e)
        return np.zeros(10)

# ================================================================ music
def music():
    m = np.zeros((2, N))
    def P(x, t, g=1.0, p=0.0):
        x = np.asarray(x, float)
        place(m, pan(x, p) if x.ndim == 1 else x, t, g)
    D2, F2, A2, C3, D3, E3, F3, G3, A3, Bb3, C4, D4, E4, F4, G4, A4, Bb4, C5, D5, E5, F5, G5, A5 = \
        38, 41, 45, 48, 50, 52, 53, 55, 57, 58, 60, 62, 64, 65, 67, 69, 70, 72, 74, 76, 77, 79, 81
    # A hook (0-3.47): timpani, low stabs, snare roll into the flash
    for t, f in [(0.05, D2), (0.9, D2), (1.75, A2 - 12), (2.6, D2)]:
        P(I.timpani(m2f(f + 12), 0.85, R), t, 0.9)
    for t in [0.05, 1.75]:
        P(I.brass(m2f(D2 + 12), 0.5, 0.75, R, kind="tuba"), t, 0.8)
    for t, v in I.snare_roll(2.35, 3.45, 0.15, 0.8, R):
        P(I.snare(v, R, 0.2, buzz=True), t, 0.5)
    P(I.cymbal(0.8, R), 3.47, 0.7)
    # B setup (3.47-22.0): sneaky pizzicato + glock motif, brushes on the off-beats
    bass = [D2, A2, F2, A2]
    t = 3.5; k = 0
    while t < 22.0:
        P(I.pluck(m2f(bass[k % 4] + 12), 0.7, R, 0.6), t, 0.9, -0.2)
        if k % 2: P(I.brush(0.35, R), t, 0.5, 0.3)
        t += BEAT; k += 1
    motif = [(D5, 0, 1), (F5, 1, 1), (A5, 2, 1), (G5, 3, 0.5), (F5, 3.5, 0.5), (E5, 4, 1), (D5, 5, 2)]
    for bar0 in [3.5 + 2 * 4 * BEAT * i for i in range(5)]:
        if bar0 > 20.5: break
        for n, b, _d in motif:
            P(I.glock(m2f(n), 0.45, R, 1.2), bar0 + b * BEAT, 0.55, 0.25)
    # C tension (22.0-26.5): eighth-note pizzicato climbing, timpani pulse, snare roll into the split
    t = 22.0; k = 0
    while t < 26.45:
        P(I.pluck(m2f(D3 + (k // 4) % 8), 0.75, R, 0.35), t, 0.8, -0.1)
        t += BEAT / 2; k += 1
    for t in np.arange(22.0, 26.4, BEAT * 2): P(I.timpani(m2f(A2 + 12), 0.6, R, 1.2), t, 0.7)
    for t, v in I.snare_roll(24.5, 26.45, 0.1, 0.9, R): P(I.snare(v, R, 0.2, buzz=True), t, 0.45)
    # D chaos (26.5-35.2): crash, tumbling tuba line, horn stabs on the big words
    P(I.cymbal(1.0, R, 3.0), 26.5, 0.9); P(I.timpani(m2f(D3), 1.0, R, 2.5), 26.5, 1.0)
    line = [D3, C3 + 1, C3, 47, 46, 45, 44, 43]
    t = 27.0; k = 0
    while t < 35.0:
        P(I.brass(m2f(line[k % 8] - 12), BEAT * 0.9, 0.8, R, kind="tuba"), t, 0.7)
        if k % 2 == 0: P(I.snare(0.6, R), t, 0.35)
        t += BEAT; k += 1
    for t in [27.35, 30.35, 32.3, 34.55]:
        for n in [D4, F4, A4]: P(I.brass(m2f(n), 0.35, 0.7, R, kind="horn"), t, 0.35, 0.2)
    P(I.cymbal(0.7, R), 34.6, 0.6)
    # E: silence for "Twenty-one people never made it out." (35.2-37.1)
    # F mystery (37.1-45.4): slow vibes arpeggios + a music-box question
    arp = [D4, F4, A4, C5, E5, C5, A4, F4]
    t = 37.15; k = 0
    while t < 45.3:
        P(I.vibes(m2f(arp[k % 8]), 0.4, R, 1.4), t, 0.55, 0.2 * ((k % 2) * 2 - 1))
        if k % 4 == 0: P(I.pluck(m2f(D2 + 12 + (0 if k % 8 == 0 else -5)), 0.5, R, 0.8), t, 0.6)
        t += BEAT; k += 1
    for n, b in [(A5, 0), (G5, 0.5), (E5, 1), (F5, 2)]: P(I.musicbox(m2f(n), 0.5, R), 37.6 + b * BEAT, 0.5, -0.3)
    for n, b in [(D5, 0), (F5, 0.5), (A5, 1), (D5 + 12, 2)]: P(I.musicbox(m2f(n), 0.5, R), 40.35 + b * BEAT, 0.5, 0.3)
    # G freeze (45.4-50.9): cold pad, frost tinkles from "freezing"
    P(I.pad([m2f(D3), m2f(A3), m2f(F4), m2f(E5)], 5.2, 0.55, R, att=1.2, rel=1.2, warm=700), 45.4, 0.9)
    for i in range(16):
        P(I.glock(m2f(int(R.choice([E5 + 12, A5 + 12, D5 + 12, F5 + 12]))), 0.25, R, 0.8), 47.6 + i * 0.19 + R.uniform(0, 0.08), 0.35, R.uniform(-0.7, 0.7))
    # H rule (50.9-57.2): steady pizzicato, lift to D major on "changed", brass resolve
    t = 50.95; k = 0
    lineH = [D2, A2, D2, A2, G3 - 24, D2, A2 - 12, D2]
    while t < 57.2:
        P(I.pluck(m2f(lineH[k % 8] + 12), 0.65, R, 0.5), t, 0.8, -0.2)
        if k % 2 == 1: P(I.snare(0.25, R), t, 0.3)
        t += BEAT; k += 1
    for t, chord in [(52.43, [D4, F4 + 1, A4]), (54.2, [G4 - 12, 59, D4]), (55.55, [A3, C4 + 1, E4]), (56.95, [D4, F4 + 1, A4, D5])]:
        for n in chord: P(I.brass(m2f(n), 0.6, 0.6, R, kind="horn"), t, 0.32, 0.15)
    # I twist (57.38-61.63): the music stops on "And locals say" -- a low hit, then only a soft low drone
    P(I.timpani(m2f(D2), 1.0, R, 3.0), 57.36, 1.0)
    P(I.brass(m2f(D2), 0.9, 0.7, R, kind="soft"), 57.36, 0.7)
    P(I.pad([m2f(D2), m2f(A2)], DUR - 57.6, 0.55, R, att=0.5, rel=0.3, warm=420), 57.5, 0.9)
    P(I.glock(m2f(D5 + 12), 0.35, R, 1.4), 60.70, 0.35)
    # composed silence for the serious beat, and nothing from the old cue after the twist hit
    a, b = ns(35.15), ns(37.1)
    m[:, a:b] *= np.linspace(1, 0, b - a)[None, :] ** 6
    # room
    wet = convolve_st(m, make_ir(1.4, 3, hf=1.3))
    m = m + 0.22 * wet
    return m

# ================================================================ sound effects
def sfx():
    s = np.zeros((2, N))
    def S(x, t, g=1.0, p=0.0):
        x = np.asarray(x, float)
        if x.size < 20: return
        place(s, pan(x, p) if x.ndim == 1 else x, t, g)
    noise = lambda d, lo, hi, seed=0: bp(rng(seed).standard_normal(ns(d)), lo, hi)
    env = lambda d, a, r: np.minimum(1, np.minimum(np.arange(ns(d)) / max(1, ns(a)), (ns(d) - np.arange(ns(d))) / max(1, ns(r))))
    # hook: roaring wave under running feet and shouts
    roar = lp(colored(ns(3.5), R, slope=-1.0), 500) * env(3.5, 0.3, 0.6)
    S(roar, 0.0, 0.9)
    S(safe(X.water_bed, 3.5, R, 1.0, 1.6), 0.0, 0.6)
    for i in range(14): S(safe(X.stroll_step, R, 0.8), 0.15 + i * 0.22 + R.uniform(0, 0.05), 0.5, R.uniform(-0.6, 0.6))
    for t in [0.8, 1.9, 2.7]: S(safe(X.whoa, R), t, 0.55, R.uniform(-0.5, 0.5))
    S(safe(X.whoosh, 0.6, R), 3.2, 0.7)
    # harbor ambience in the setup
    S(safe(X.breeze, 18.5, R, 0.6), 3.5, 0.35)
    S(safe(X.bird_chirps, 8.0, R, 0.3, "sparrow"), 4.0, 0.25)
    # buckets: clink on "buckets", drip plop on "drips"
    S(safe(X.clink, R, 900, 0.18, 0.7), 12.38, 0.7, 0.2)
    plop = np.sin(2 * np.pi * np.cumsum(np.linspace(900, 300, ns(0.12))) / SR) * np.exp(-np.arange(ns(0.12)) / ns(0.03))
    S(plop, 13.25, 0.6, 0.15)
    # paint roller strokes, the new drip after "show"
    for t in [14.6, 14.85, 15.1]: S(safe(I.brush, 0.6, R, 0.3, True), t, 0.6, -0.1)
    S(plop, 16.45, 0.45, -0.1)
    # warm delivery: pump glugs, the groan
    S(safe(X.bubbles, 2.0, R, 6.0, 120, 600), 17.5, 0.55, 0.3)
    S(safe(X.chain_groan, 1.6, R, 0.3, 1.0, 18, 30), 20.3, 0.8)
    S(safe(X.creak, 1.2, R, 60, 90), 20.5, 0.5, -0.3)
    # rivets like a machine gun, then the split
    for i in range(9):
        S(safe(X.bolt_snap, R), 24.5 + i * 0.14, 0.2, -0.4 + 0.1 * i)
    S(safe(X.timber_tear, R, 1.0), 26.45, 0.8)
    S(safe(X.bolt_snap, R), 26.5, 0.9)
    boom = lp(rng(5).standard_normal(ns(2.0)), 160) * np.exp(-np.arange(ns(2.0)) / ns(0.5))
    S(boom * 3, 26.5, 1.0)
    # the wave rolling down the street
    roar2 = lp(colored(ns(8.6), R, slope=-1.0), 700) * env(8.6, 0.4, 2.0)
    S(roar2, 26.55, 1.0)
    S(safe(X.water_bed, 8.6, R, 1.0, 1.8), 26.55, 0.8)
    S(safe(X.whoosh, 1.0, R), 27.3, 0.6)
    S(safe(X.rattle, 2.5, R, 25.0, None, True), 29.0, 0.35, 0.4)
    # truck thrown, splash; firehouse shoved
    S(safe(X.whoosh, 0.9, R), 32.05, 0.7, 0.4)
    S(safe(X.splash_big, R), 32.95, 0.9, 0.3)
    S(safe(X.wood_crack, R), 34.45, 0.9, -0.2)
    S(safe(X.timber_tear, R, 0.7), 34.5, 0.7, -0.2)
    # serious beat: only a faint wind
    S(safe(X.breeze, 2.2, R, 0.35), 35.2, 0.3)
    # mystery: "?" pop, thermometer swing, mercury bloop
    S(safe(I.pluck, m2f(84), 0.5, R, 0.3), 37.15, 0.5, 0.3)
    S(safe(X.whoosh, 0.5, R, 0.3, 600, 3000), 38.95, 0.6, 0.5)
    rise = np.sin(2 * np.pi * np.cumsum(np.linspace(300, 1400, ns(0.35))) / SR) * env(0.35, 0.01, 0.1)
    S(rise, 40.2, 0.35, 0.3)
    # kitchen: cold puff, the stubborn blob, sizzle on the stove, the pour
    S(safe(X.breeze, 0.8, R, 0.6, 0.1, 2500), 41.3, 0.4)
    S(safe(X.bubbles, 0.9, R, 3.0, 100, 400), 42.6, 0.5)
    sizzle = hp(rng(9).standard_normal(ns(1.0)), 3000) * env(1.0, 0.2, 0.3) * 0.25
    S(sizzle, 43.75, 0.6, 0.2)
    S(safe(X.bubbles, 0.7, R, 14.0, 300, 1200), 44.8, 0.6, 0.2)
    # cooling: frost crackle, stuck rescuers' oofs
    crackle = hp(rng(11).standard_normal(ns(1.5)), 4000) * (rng(12).random(ns(1.5)) > 0.995) * 3
    S(crackle, 47.6, 0.5)
    for t, k in [(48.7, "oof"), (49.6, "oof"), (50.2, "oof")]: S(safe(X.oof, R, k), t, 0.5, R.uniform(-0.4, 0.4))
    # office: papers, book slam, scribble, signature, stamp, crane clank
    S(noise(0.6, 1500, 7000, 3) * env(0.6, 0.05, 0.2) * 0.3, 51.6, 0.6)
    S(safe(X.push_thump, R), 52.42, 1.0)
    S(safe(X.hammer_hit, R, 0.6), 52.42, 0.5)
    for i in range(6): S(noise(0.07, 2000, 6000, 20 + i) * env(0.07, 0.01, 0.03) * 0.4, 54.75 + i * 0.09, 0.6, 0.1)
    S(noise(0.45, 1800, 5000, 30) * env(0.45, 0.02, 0.1) * 0.35, 55.22, 0.6, 0.1)
    S(safe(X.hammer_hit, R, 0.8), 55.55, 0.9)
    S(safe(X.clink, R, 380, 0.4, 0.6), 56.95, 0.6, 0.5)
    S(safe(X.creak, 0.8, R, 40, 60), 56.8, 0.4, 0.5)
    # summer: birds, breeze, her steps, the sniff
    S(safe(X.bird_chirps, 4.4, R, 0.5, "sparrow"), 57.2, 0.35)
    S(safe(X.breeze, 4.4, R, 0.5), 57.2, 0.3)
    for i in range(6): S(safe(X.stroll_step, R, 0.4), 57.4 + i * 0.36, 0.35, -0.2)
    for t in [60.5, 60.75]: S(hp(noise(0.18, 800, 4000, 40), 600) * env(0.18, 0.06, 0.08) * 0.5, t, 0.5)
    return s

# ================================================================ mix
def main(voice_path, words_path, outdir):
    os.makedirs(outdir, exist_ok=True)
    v, sr = read_wav(voice_path)
    v = v[0] if v.ndim > 1 else v
    if sr != SR: v = signal.resample_poly(v, SR, sr)
    vb = np.zeros(N); vb[: min(N, len(v))] = v[:N]
    voice = st(vb)
    print("music..."); mu = music()
    print("sfx..."); fx = sfx()
    words = json.load(open(words_path))
    # duck key from the word timings, 120 ms attack / 300 ms release
    key = np.zeros(N)
    for w in words: key[ns(w["start"] - 0.05): ns(w["end"] + 0.1)] = 1
    key = signal.lfilter([1 - np.exp(-1 / (0.15 * SR))], [1, -np.exp(-1 / (0.15 * SR))], key)
    # skill mix rule: music = 50 % of the voice's gated RMS (-6 dB), SFX at 50 % with peaks capped at 0.7 x the
    # voice peak; no ducking, no compression; then one linear gain to -14 LUFS and a -1 dBFS peak limiter
    def grms(x):
        y = np.mean(x, axis=0) if x.ndim == 2 else x
        blk = ns(0.1); n = len(y) // blk
        r = np.sqrt(np.mean(y[: n * blk].reshape(n, blk) ** 2, axis=1))
        keep = r[r > r.max() * 10 ** (-30 / 20)]
        return float(np.sqrt(np.mean(keep ** 2))) if keep.size else 1e-9
    vg, vpk = grms(voice), float(np.abs(voice).max())
    mu *= 0.5 * vg / grms(mu)
    fx *= 0.5 * vg / grms(fx)
    cap = 0.7 * vpk
    fx = np.where(np.abs(fx) > 0.8 * cap, np.sign(fx) * (0.8 * cap + 0.2 * cap * np.tanh((np.abs(fx) - 0.8 * cap) / (0.2 * cap))), fx)
    print(f"levels vs voice (gated RMS): music {20*np.log10(grms(mu)/vg):+.1f} dB, sfx {20*np.log10(grms(fx)/vg):+.1f} dB, sfx peak {np.abs(fx).max()/vpk:.2f} x voice peak")
    mix = voice + mu + fx
    g = dbg(-14.0 - integrated(mix)); mix *= g
    c = dbg(-1.6)
    mix = np.where(np.abs(mix) > c * 0.85, np.sign(mix) * (c * 0.85 + (c * 0.15) * np.tanh((np.abs(mix) - c * 0.85) / (c * 0.15))), mix)
    mix = fades(mix, 0.005, 0.25)
    write_wav(os.path.join(outdir, "mix.wav"), mix)
    write_wav(os.path.join(outdir, "stem_music.wav"), mu * g); write_wav(os.path.join(outdir, "stem_sfx.wav"), fx * g); write_wav(os.path.join(outdir, "stem_voice.wav"), voice * g)
    print(f"mix: {integrated(mix):.1f} LUFS, true peak {true_peak(mix):.2f} dBTP, {mix.shape[1] / SR:.3f} s")

if __name__ == "__main__":
    main(*sys.argv[1:4])
