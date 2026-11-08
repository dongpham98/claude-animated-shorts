# Sound for "Titanic's Lifeboats: 7 Myths" (long video). Original synthesized score + SFX on the picture's frames,
# mixed by the skill rule (voice unchanged, music 50 % of the voice's gated RMS, SFX <= that with peaks capped at
# 0.7 x voice peak, no ducking, one gain to -14 LUFS, soft limiter -1.6 dBFS).
# usage: AUDIO_LIB=<templates/audio> python3 sound.py <voice.wav> <words.json> <outdir> [end_frame]
# Cue tables cover the pilot (cold open + chapter 1, frames 0..3452); later chapters append cues below.
import os, sys, json
import numpy as np
from scipy import signal
for _c in [os.environ.get("AUDIO_LIB", ""), os.path.join(os.path.dirname(os.path.abspath(__file__)), "lib")]:
    if _c and os.path.exists(os.path.join(_c, "dsp.py")): sys.path.insert(0, _c); break
from dsp import (SR, ns, st, dbg, rng, lp, hp, bp, pan, place, make_ir, convolve_st, integrated, true_peak, read_wav, write_wav, colored, fades)
import instruments as I
import sfx_gen as X

FPS = 30
_V = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "voice")
WORDS = json.load(open(os.path.join(_V, "words.json")))
_LW = {}
for _w in WORDS: _LW.setdefault(_w["line"], []).append(_w["start"])
WARP = json.load(open(os.path.join(_V, "warp_pilot.json")))
def warp(f):   # pilot cue frame (v1 voice) -> v2 frame
    for i in range(1, len(WARP)):
        (o0, n0), (o1, n1) = WARP[i - 1], WARP[i]
        if f <= o1: return n0 + (f - o0) * (n1 - n0) / max(1e-6, o1 - o0)
    return f
def A(li, wi=0, lead=3):   # same anchor as story.ts
    l = _LW[li]; return round(l[min(wi, len(l) - 1)] * 30) - lead
LE_LAST = round(max(w["end"] for w in WORDS) * 30)
TOTAL = LE_LAST + 30 + 600
END = int(sys.argv[4]) if len(sys.argv) > 4 else TOTAL
DUR = END / FPS
N = ns(DUR)
m2f = I.m2f
R = rng(12)
F = lambda f: warp(f) / FPS    # pilot cue frame (v1) -> seconds in the v2 timeline
N2 = lambda f: f / FPS         # v2 frame -> seconds

def safe(fn, *a, **k):
    try: return np.asarray(fn(*a, **k), float)
    except Exception as e: print("  skip", getattr(fn, "__name__", fn), e); return np.zeros(10)

D2, E2, F2, G2, A2, Bb2, C3, D3, E3, F3, G3, A3, Bb3, C4, D4, E4, F4, G4, A4, Bb4, C5, D5, E5, F5, G5, A5 = \
    38, 40, 41, 43, 45, 46, 48, 50, 52, 53, 55, 57, 58, 60, 62, 64, 65, 67, 69, 70, 72, 74, 76, 77, 79, 81

def music():
    m = np.zeros((2, N))
    def P(x, t, g=1.0, p=0.0):
        x = np.asarray(x, float)
        if x.size < 20 or t >= DUR: return
        place(m, pan(x, p) if x.ndim == 1 else x, t, g)
    # ---- cold open (0 - 766): quiet and straight. Low D-minor pad, sparse vibes, a far-off string trio waltz (the band)
    P(I.pad([m2f(D2 + 12), m2f(A2 + 12), m2f(F3)], F(766) - 0.2, 0.5, R, att=2.0, rel=1.5, warm=520), 0.0, 0.9)
    for k, (n, t) in enumerate([(A4, 1.0), (F4, 3.4), (D4, 5.8), (E4, 8.2), (F4, 10.6), (A4, 13.0), (G4, 15.4), (E4, 17.8), (D4, 20.6)]):
        P(I.vibes(m2f(n), 0.32, R, 2.4), t, 0.55, 0.25 * (k % 2 * 2 - 1))
    # the question "why did so many of them leave half empty?" (f 686-755): a single high glock, then air
    P(I.glock(m2f(A5), 0.35, R, 2.0), F(741), 0.45, 0.2)
    # ---- title (766 - 1048): timpani on "seven", a rising brass figure into "law of the sea"
    P(I.timpani(m2f(D3), 0.9, R, 1.8), F(794), 0.9)
    for t, n in [(F(840), D4), (F(866), F4), (F(900), A4), (F(936), D5)]: P(I.brass(m2f(n), 0.35, 0.55, R, kind="horn"), t, 0.35, 0.15)
    for n in [D4, F4 + 1, A4, D5]: P(I.brass(m2f(n), 1.4, 0.7, R, kind="horn"), F(966), 0.32, 0.1)
    P(I.cymbal(0.7, R, 2.6), F(966), 0.55)
    # ---- chapter 1 (1049 - 3452): sneaky "rulebook" pizzicato in D minor, tick-tock woodblocks (brush), glock motif
    BEAT = 60 / 104
    bass = [D2, A2, F2, A2, G2, Bb2, A2, A2 - 12]
    motif = [(D5, 0, 1), (E5, 1, 0.5), (F5, 1.5, 0.5), (A5, 2, 1), (G5, 3, 1), (F5, 4, 0.5), (E5, 4.5, 0.5), (D5, 5, 2)]
    def pizz(t0, t1, gain=0.85, mot=True):
        t, k = t0, 0
        while t < t1:
            P(I.pluck(m2f(bass[k % 8] + 12), 0.7, R, 0.6), t, gain, -0.2)
            if k % 2: P(I.brush(0.28, R), t, 0.45, 0.3)
            if mot and k % 16 == 8:
                for n, b, _d in motif:
                    if t + b * BEAT < t1: P(I.glock(m2f(n), 0.4, R, 1.1), t + b * BEAT, 0.45, 0.25)
            t += BEAT; k += 1
    pizz(F(1049), F(1890))
    # "That's it." (1849): tuba plop; "whole rule" (1878): little smug music-box turn
    P(I.brass(m2f(D2), 0.45, 0.8, R, kind="tuba"), F(1849), 0.8)
    for n, b in [(A5, 0), (F5, 0.25), (D5, 0.5)]: P(I.musicbox(m2f(n), 0.5, R), F(1878) + b, 0.5, 0.2)
    # size chart (1900 - 2110): long rising tuba + horn swell as Titanic slides in
    P(I.brass(m2f(D2), 1.8, 0.7, R, kind="tuba", scoop=-40), F(1920), 0.7)
    for n in [D3, A3, D4]: P(I.brass(m2f(n), 2.0, 0.55, R, kind="horn"), F(1990), 0.3)
    pizz(F(2111), F(2795))
    # seats (2438 - 2817): the overflow turns red (2770): a low minor hit, then the pizzicato carries on softer
    P(I.timpani(m2f(D2 + 12), 0.8, R, 2.0), F(2772), 0.8)
    P(I.pad([m2f(D3), m2f(F3), m2f(A3)], 1.6, 0.4, R, att=0.1, rel=0.8, warm=600), F(2772), 0.6)
    pizz(F(2818), F(3110), 0.75, mot=False)
    # verdict (3126): stamp sting
    for n in [D4, F4, A4, D5]: P(I.brass(m2f(n), 0.5, 0.75, R, kind="horn"), F(3126), 0.35)
    P(I.cymbal(0.6, R, 1.8), F(3126), 0.45)
    pizz(F(3160), F(3290), 0.7, mot=False)
    # Belfast tease (3301 - end): low pad and a glock question on "Someone did"
    P(I.pad([m2f(D2 + 12), m2f(A2 + 12), m2f(E3)], F(3453) - F(3301) + 0.5, 0.45, R, att=0.8, rel=0.4, warm=480), F(3301), 0.8)
    for n, b in [(A4, 0), (D5, 0.35), (E5, 0.7)]: P(I.glock(m2f(n), 0.45, R, 1.6), F(3390) + b, 0.5, 0.2)
    music2(P, pizz)
    m = m + 0.25 * convolve_st(m, make_ir(1.8, 4, hf=1.2))
    return m

def music2(P, pizz):
    T = N2
    def sting(t, major=False):
        P(I.timpani(m2f(D3), 0.8, R, 1.6), t, 0.8)
        for n in ([D4, F4 + 1, A4] if major else [D4, F4, A4]): P(I.brass(m2f(n), 0.5, 0.6, R, kind="horn"), t, 0.3, 0.1)
    def stampcue(t, col="red"):
        for n in ([D4, F4, A4, D5] if col == "red" else [D4, G4, A4, D5]): P(I.brass(m2f(n), 0.5, 0.7, R, kind="horn"), t, 0.33)
        P(I.cymbal(0.55, R, 1.6), t, 0.4)
    def pad(t0, t1, notes, g=0.8, warm=520):
        if t1 > t0: P(I.pad([m2f(n) for n in notes], t1 - t0, 0.45, R, att=1.2, rel=1.0, warm=warm), t0, g)
    # myth chapters 2-5 and 7: card sting, pizzicato investigation, verdict stamp
    for c0, c1, v in [(A(47), A(70), A(65, 1, 0)), (A(70), A(92), A(88, 1, 0)), (A(92), A(118), A(114, 1, 0)), (A(118), A(141), A(139, 1, 0))]:
        sting(T(c0)); pizz(T(c0) + 1.2, T(v) - 0.3, 0.8); stampcue(T(v), "orange" if v in (A(65, 1, 0), A(88, 1, 0)) else "red"); pizz(T(v) + 1.4, T(c1) - 0.6, 0.65, mot=False)
    # chapter 4's deck at night: the band's waltz, far away (music box through a low-pass)
    for k, n in enumerate([D5, F5, A5, G5, F5, E5, D5, A4, D5, F5, A5, D5 + 12]): P(I.musicbox(m2f(n), 0.3, R), T(A(96)) + k * 0.38, 0.3, 0.4)
    # chapter 6: played straight. Low pad, no pulse, a few glock notes
    pad(T(A(141)), T(A(162)) - 0.5, [D2 + 12, A2 + 12, F3], 0.75, 460)
    for t in [A(143), A(150), A(158), A(160)]: P(I.vibes(m2f(A4), 0.25, R, 2.4), T(t), 0.4)
    # chapter 7: back to the boat, newspapers (pizz), stamp, then the answer swells
    pad(T(A(162)), T(A(170)), [D2 + 12, A2 + 12, E3], 0.6, 480)
    pizz(T(A(170)), T(A(177)) - 0.3, 0.75); sting(T(A(177))); stampcue(T(A(178, 1, 0)))
    pad(T(A(180)), T(A(186)), [D2 + 12, F2 + 12, A2 + 12], 0.65, 420)
    for k, t in enumerate([A(187), A(188), A(189), A(190)]):
        for n in [D4, F4, A4]: P(I.brass(m2f(n + k), 0.6, 0.55, R, kind="horn"), T(t), 0.25)
    # chapter 8: the boat that went back. Low pad, then silence from "it was quiet" to "several more"
    pad(T(A(191)), T(A(197)) - 0.3, [D2 + 12, A2 + 12, D3], 0.6, 420)
    pad(T(A(202)), T(A(211)) - 0.4, [D3, A3, E4], 0.55, 650)
    P(I.glock(m2f(A5), 0.3, R, 2.2), T(A(210)), 0.4)
    # chapter 9: Carpathia races (timpani pulse + brass ostinato), dawn in D major
    t = T(A(214)); k = 0
    while t < T(A(217)) - 0.2:
        P(I.timpani(m2f(A2 + 12), 0.55, R, 0.9), t, 0.55)
        P(I.brass(m2f([D3, D3, F3, A3][k % 4]), 0.25, 0.6, R, kind="horn"), t, 0.3)
        t += 60 / 132; k += 1
    pad(T(A(217)), T(A(223)) - 0.3, [D3, F3 + 1, A3, D4], 0.75, 900)
    for k, n in enumerate([A4, D5, F5 + 1, A5]): P(I.glock(m2f(n), 0.4, R, 1.6), T(A(217)) + k * 0.4, 0.4)
    # chapter 10: resolve. Horn chords on each new rule, a minor hit on the callback, silence on "on paper"
    for t in [A(225), A(226), A(227), A(228)]:
        for n in [D4, F4 + 1, A4]: P(I.brass(m2f(n), 0.7, 0.55, R, kind="horn"), T(t), 0.28)
    pizz(T(A(230)), T(A(231)) - 0.2, 0.7, mot=False)
    P(I.timpani(m2f(D2 + 12), 0.8, R, 2.0), T(A(233, 12)), 0.8)
    pad(T(A(233)), T(A(235, 6)), [D3, F3, A3], 0.5, 600)
    P(I.timpani(m2f(D2), 1.0, R, 3.0), T(A(235, 10)), 0.9)
    # teaser + end screen: playful pizz, soft outro
    pizz(T(A(236)), DUR - 0.5, 0.6)

def sfx():
    s = np.zeros((2, N))
    def S(x, t, g=1.0, p=0.0):
        x = np.asarray(x, float)
        if x.size < 20 or t >= DUR: return
        place(s, pan(x, p) if x.ndim == 1 else x, t, g)
    env = lambda d, a, r: np.minimum(1, np.minimum(np.arange(ns(d)) / max(1, ns(a)), (ns(d) - np.arange(ns(d))) / max(1, ns(r))))
    noise = lambda d, lo, hi, seed=0: bp(rng(seed).standard_normal(ns(d)), lo, hi)
    # ---- the North Atlantic: still water, a cold breath of wind under every outside shot
    for a, b in [(0, 445), (445, 579), (579, 766), (1049, 1135), (1307, 1474), (2198, 2438)]:
        d = F(b - a)
        S(safe(X.water_bed, d, R, 0.5, 0.4) * env(d, 0.3, 0.3), F(a), 0.45)
        S(safe(X.breeze, d, R, 0.35, 0.1, 700), F(a), 0.35)
    # davit blocks and ropes as boat 1 goes down (0 - 231)
    for t in np.arange(0.4, F(231), 0.55): S(safe(X.creak, 0.35, R, 120, 160), t + R.uniform(0, 0.1), 0.35, 0.3)
    for t in [F(150), F(178), F(205)]: S(safe(X.clink, R, 600, 0.12, 0.5), t, 0.35, 0.2)
    # boat 1 afloat (232 - 326): oars, seat ticks on the counters
    for t in np.arange(F(236), F(326), 1.1): S(safe(X.water_bed, 0.6, R, 1.0, 2.0) * env(0.6, 0.05, 0.3), t, 0.3, 0.2)
    S(safe(X.clink, R, 1400, 0.08, 0.6), F(240), 0.5); S(safe(X.clink, R, 1100, 0.08, 0.6), F(273), 0.5)
    # deck crowd (327 - 444): murmur
    S(safe(X.babble, F(117), R, 160, 1.0, 3.6, 0.6), F(327), 0.35)
    # Clipboard pops in on the flash (445), points (548)
    S(safe(X.whoosh, 0.4, R, 0.3, 600, 3000), F(441), 0.55); S(safe(I.pluck, m2f(84), 0.4, R, 0.3), F(447), 0.45, 0.3)
    # sea wide (579 - 765): oars in the distance
    for t in np.arange(F(590), F(760), 1.4): S(safe(X.water_bed, 0.5, R, 0.5, 2.0) * env(0.5, 0.05, 0.3), t, 0.2, -0.3)
    # title: stamps
    S(safe(X.whoosh, 0.5, R), F(762), 0.5)
    for t in [F(877), F(911)]: S(safe(X.push_thump, R), t, 0.9); S(safe(X.hammer_hit, R, 0.5), t, 0.35)
    # myth card flap (1058), newspapers spin and slam (1151, 1199, 1244)
    S(noise(0.3, 1200, 6000, 3) * env(0.3, 0.02, 0.15) * 0.4, F(1058), 0.5)
    for k, t in enumerate([F(1151), F(1199), F(1244)]):
        S(safe(X.whoosh, 0.45, R, 0.3, 700, 3500), t, 0.5, 0.2 * (k - 1)); S(safe(X.push_thump, R), t + 0.47, 0.6)
    # shrug blip (1317), thumbs-up pop (1391), dusty rulebook puff + cough-ish breath (1447)
    S(safe(I.pluck, m2f(72), 0.4, R, 0.4), F(1317), 0.4); S(safe(I.glock, m2f(88), 0.4, R, 0.6), F(1391), 0.35)
    S(hp(rng(4).standard_normal(ns(0.5)), 1500) * env(0.5, 0.01, 0.4) * 0.4, F(1447), 0.5)
    # London 1894: clock ticks, quill scratches
    for a, b in [(1474, 1900), (2111, 2198), (3214, 3301)]:
        for k, t in enumerate(np.arange(F(a), F(b), 0.5)): S(safe(X.clink, R, 2200 if k % 2 else 1800, 0.04, 0.5), t, 0.18, -0.4)
    for t in [F(1500), F(1560), F(1640), F(1760)]:
        for i in range(5): S(noise(0.06, 2500, 7000, 20 + i) * env(0.06, 0.005, 0.03) * 0.3, t + i * 0.08, 0.35, 0.1)
    # "That's it." ledger slam (1849); stamp "sixteen" (2169)
    S(safe(X.push_thump, R), F(1849), 1.0); S(safe(X.hammer_hit, R, 0.6), F(1849), 0.4)
    S(safe(X.push_thump, R), F(2169), 0.8)
    # size chart: Titanic slides in (1918)
    S(safe(X.whoosh, 1.2, R, 0.5, 200, 1600), F(1914), 0.6)
    # boats counters (2223, 2249, 2306, 2368)
    for t in [2223, 2249, 2306, 2368]: S(safe(X.clink, R, 1300, 0.08, 0.6), F(t), 0.45)
    # seats grid filling (2478 - 2530, 2572 - 2620): fast ticks
    for a, b in [(2478, 2530), (2572, 2620)]:
        for t in np.arange(F(a), F(b), 0.05): S(safe(X.clink, R, 2600, 0.03, 0.4), t, 0.12, R.uniform(-0.5, 0.5))
    # inquiry: gavel (2830), finger wags (2960), calendar flip (3062)
    S(safe(X.hammer_hit, R, 0.7), F(2832), 0.7)
    for t in [F(3062), F(3066), F(3070)]: S(noise(0.12, 1500, 6000, 7) * env(0.12, 0.01, 0.06) * 0.4, t, 0.5, 0.4)
    # verdict stamp (3126)
    S(safe(X.push_thump, R), F(3126), 1.0); S(safe(X.hammer_hit, R, 0.8), F(3126), 0.5)
    # rulebook cracks (3230), pages flutter
    S(safe(X.wood_crack, R), F(3230), 0.6)
    for i in range(6): S(noise(0.15, 1200, 5000, 30 + i) * env(0.15, 0.02, 0.08) * 0.35, F(3236) + i * 0.09, 0.4, R.uniform(-0.5, 0.5))
    # Belfast: pencil (3301 - 3390), soft turn (3388)
    for t in np.arange(F(3305), F(3385), 0.7): S(noise(0.35, 2000, 6000, 40) * env(0.35, 0.03, 0.1) * 0.25, t, 0.3, 0.2)
    S(safe(X.whoosh, 0.35, R, 0.2, 500, 2000), F(3386), 0.35)
    sfx2(S, env, noise)
    return s

def sfx2(S, env, noise):
    T = N2
    stamp = lambda t, g=1.0: (S(safe(X.push_thump, R), T(t), g), S(safe(X.hammer_hit, R, 0.6), T(t), 0.45 * g))
    pop = lambda t: S(safe(X.whoosh, 0.35, R, 0.25, 700, 3200), T(t) - 0.2, 0.4, R.uniform(-0.3, 0.3))
    amb_sea = lambda a, b, g=0.45: (S(safe(X.water_bed, T(b) - T(a), R, 0.5, 0.4) * env(T(b) - T(a), 0.3, 0.3), T(a), g), S(safe(X.breeze, T(b) - T(a), R, 0.35, 0.1, 700), T(a), 0.3))
    # chapter starts (myth cards): whoosh in
    for li in [47, 70, 92, 118, 141, 177]: pop(A(li))
    for k in [(65, 1), (88, 1), (114, 1), (139, 1), (178, 1)]: stamp(A(*k, lead=0))
    # board pops (counters, list items)
    for t in [A(54), A(55), A(63), A(64), A(85), A(86), A(87), A(113, 11), A(132), A(133), A(134), A(136, 6), A(187), A(188), A(189), A(190), A(225), A(226), A(227), A(228), A(230, 15)]:
        S(safe(X.clink, R, 1300, 0.08, 0.6), T(t), 0.45)
    # agenda clock ticks, calendar pen strike
    for t in [T(A(62)) + 0.5 * i for i in range(12)]: S(safe(X.clink, R, 2000, 0.04, 0.5), t, 0.18)
    S(noise(0.25, 1500, 6000, 9) * env(0.25, 0.01, 0.1) * 0.5, T(A(73, 9)), 0.6)
    # deck scenes: sea ambience + murmur; davits and falls creak
    for a, b in [(A(51), A(53)), (A(68), A(70)), (A(79), A(80)), (A(82), A(84)), (A(94), A(98)), (A(100), A(102)), (A(105), A(111)), (A(120), A(128))]: amb_sea(a, b, 0.35)
    S(safe(X.babble, T(A(98)) - T(A(94)), R, 160, 1.0, 3.6, 0.6), T(A(94)), 0.3)
    for t in [A(51, 4), A(52, 3), A(110, 3), A(110, 6)]: S(safe(X.creak, 0.6, R, 90, 140), T(t), 0.45, 0.3)
    for t in [T(A(102)) + 0.5 * i for i in range(10)]: S(safe(X.creak, 0.35, R, 120, 160), t, 0.3, 0.3)
    # Southampton (day): gulls, harbour, oars
    S(safe(X.bird_chirps, T(A(82)) - T(A(80)), R, 0.4, "sparrow"), T(A(80)), 0.25)
    amb_sea(A(80), A(82), 0.4)
    for t in [T(A(81, 2)) + 1.1 * i for i in range(4)]: S(safe(X.water_bed, 0.6, R, 1.0, 2.0) * env(0.6, 0.05, 0.3), t, 0.3)
    # sea at night after the sinking: still water, very quiet
    for a, b in [(A(162), A(170)), (A(180), A(186)), (A(191), A(209))]: amb_sea(a, b, 0.3)
    for t in [T(A(196)) + 1.3 * i for i in range(6)]: S(safe(X.water_bed, 0.5, R, 0.8, 2.0) * env(0.5, 0.05, 0.3), t, 0.25)
    # newspapers (chapter 7)
    for t in [A(170) + 6, A(171, 2), A(172, 4)]: S(safe(X.whoosh, 0.45, R, 0.3, 700, 3500), T(t) - 0.4, 0.45); S(safe(X.push_thump, R), T(t), 0.55)
    # inquiry: gavel; conference: papers
    for t in [A(58), A(147), A(173)]: S(safe(X.hammer_hit, R, 0.6), T(t) + 0.3, 0.55)
    # wireless: morse beeps on "calling for help"
    for i in range(14):
        on = 0.08 if i % 3 else 0.22
        beep = np.sin(2 * np.pi * 820 * np.arange(ns(on)) / SR) * env(on, 0.005, 0.01) * 0.4
        S(beep, T(A(212, 6)) + i * 0.17, 0.5, 0.2)
    # Carpathia: engines thrum + bow wash while racing; ice creaks
    d = T(A(217)) - T(A(214))
    S(lp(colored(ns(d), R, slope=-1.0), 160) * env(d, 0.5, 0.8) * 1.2, T(A(214)), 0.6)
    S(safe(X.water_bed, d, R, 1.0, 1.2), T(A(214)), 0.5)
    S(safe(X.creak, 1.0, R, 40, 60), T(A(216, 3)), 0.4, -0.3)
    # dawn rescue: soft water, rope creaks on the ladder
    amb_sea(A(217), A(221), 0.35)
    for t in [T(A(220)) + 0.8 * i for i in range(5)]: S(safe(X.creak, 0.4, R, 150, 200), t, 0.3, 0.2)
    # ferry muster: a ship's horn; end: pages
    horn = sum(np.sin(2 * np.pi * f0 * np.arange(ns(1.2)) / SR) for f0 in (110, 165)) * env(1.2, 0.08, 0.3) * 0.25
    S(lp(horn, 900), T(A(230)), 0.6)


def main(voice_path, words_path, outdir):
    os.makedirs(outdir, exist_ok=True)
    v, sr = read_wav(voice_path); v = v[0] if v.ndim > 1 else v
    if sr != SR: v = signal.resample_poly(v, SR, sr)
    vb = np.zeros(N); vb[: min(N, len(v))] = v[:N]; voice = st(vb)
    print("music..."); mu = music()
    print("sfx..."); fx = sfx()
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
    for nm, x in (("voice", voice), ("music", mu), ("sfx", fx)): np.save(os.path.join(outdir, nm + ".npy"), x.astype(np.float32))
    print("stems saved"); return
    g = dbg(-14.0 - integrated(mix)); mix *= g
    c = dbg(-2.0)
    mix = np.where(np.abs(mix) > c * 0.85, np.sign(mix) * (c * 0.85 + (c * 0.15) * np.tanh((np.abs(mix) - c * 0.85) / (c * 0.15))), mix)
    mix = fades(mix, 0.005, 0.25)
    write_wav(os.path.join(outdir, "mix.wav"), mix)
    print(f"mix: {integrated(mix):.1f} LUFS, true peak {true_peak(mix):.2f} dBTP, {mix.shape[1] / SR:.3f} s")

if __name__ == "__main__":
    main(*sys.argv[1:4])
