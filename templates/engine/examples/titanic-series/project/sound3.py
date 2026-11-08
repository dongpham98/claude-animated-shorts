# Sound for "The Real Titanic in 3 Minutes": voices + original score per section + comic SFX.
# Mix (channel rules): voices unchanged; music about -10 dB under the voice measured per section (cards and title
# louder, the sinking section silent or a soft pad, played straight); SFX at or below the music; -14 LUFS, TP <= -1.
import sys, json, numpy as np, soundfile as sf
from scipy.signal import resample_poly
from scipy.ndimage import uniform_filter1d
sys.path.insert(0, "/home/claude/repo/templates/audio")
from dsp import SR, rng, lp, hp, bp, colored, fades, integrated
from instruments import pluck, glock, snare, brush, triangle, pad, m2f, timpani, cymbal, brass
from sfx_gen import whoosh, stroll_step, clink, creak, applause, breeze, water_bed

TL = json.load(open("src/timeline.json"))
FPS = 30; N = int(TL["total"] / FPS * SR) + SR
r = rng(11)
L = {k: v["start"] / FPS for k, v in TL["lines"].items()}
SC = {s["name"]: (s["a"] / FPS, s["b"] / FPS) for s in TL["scenes"]}
def Wt(k, i): return L[k] + TL["words"][k][min(i, len(TL["words"][k]) - 1)]["s"]

def mono(x):
    x = np.asarray(x, float)
    return x.mean(0) if x.ndim == 2 and x.shape[0] == 2 else (x.mean(1) if x.ndim == 2 else x)
def put(buf, x, t, g=1.0):
    x = mono(x); i = int(t * SR)
    if i >= len(buf) or i < 0: return
    x = x[: len(buf) - i]; buf[i:i + len(x)] += x * g
def load(p):
    a, sr = sf.read(p); a = mono(a)
    return resample_poly(a, SR, sr) if sr != SR else a

# ---------------- voices
voice = np.zeros(N)
for k, t in L.items():
    put(voice, load(f"recap/voice/{k}/voice.wav" if k.startswith("N") else f"recap/voice/{k}.wav"), t)

# ---------------- music sections (each its own buffer, levelled separately)
sections = {}
def sec(name): sections[name] = np.zeros(N); return sections[name]

def bouncy(buf, t0, t1, bpm=112, root=60, minor=False, glk=True, vel=1.0):
    beat = 60 / bpm; prog = [0, 9, 5, 7] if not minor else [0, 8, 3, 7]
    scale = [0, 2, 4, 7, 9, 12, 14, 16] if not minor else [0, 3, 5, 7, 10, 12, 15]
    b = 0; t = t0
    while t < t1 - 0.05:
        ch = root - 24 + prog[(b // 4) % 4]
        put(buf, pluck(m2f(ch + (12 if b % 2 else 0)), vel=0.7, r=r, dur=0.45, bright=0.35), t, 0.55 * vel)
        if b % 2: put(buf, brush(vel=0.4, r=r, dur=0.22), t, 0.3 * vel)
        if glk:
            for e in range(2):
                if (b * 2 + e) % 5 != 3:
                    n = root + 12 + scale[(b * 3 + e * 2 + (b // 4)) % len(scale)]
                    put(buf, glock(m2f(n), vel=0.4, r=r, dur=0.5), t + e * beat / 2, 0.2 * vel)
        if b % 4 == 0:
            third = 3 if minor else 4
            put(buf, pad([m2f(ch + 24), m2f(ch + 24 + third), m2f(ch + 31)], min(beat * 4.1, t1 - t), vel=0.3, r=r, att=0.15, rel=0.5), t, 0.16 * vel)
        b += 1; t += beat

def tension(buf, t0, t1, root=45, tick=True):
    dur = t1 - t0
    put(buf, pad([m2f(root), m2f(root + 7), m2f(root + 12), m2f(root + 15)], dur, vel=0.35, r=r, att=1.0, rel=1.0, warm=600), t0, 0.35)
    if tick:
        t = t0
        while t < t1 - 0.1:
            put(buf, clink(r, f0=1800, dur=0.05, bright=0.6), t, 0.12); t += 0.5
        for k in np.arange(t0, t1 - 0.5, 2.0): put(buf, timpani(m2f(root - 12), vel=0.5, r=r, dur=1.4), k, 0.4)

def softpad(buf, t0, t1, chords, vel=0.3):
    seg = (t1 - t0) / len(chords)
    for i, c in enumerate(chords): put(buf, pad([m2f(x) for x in c], seg + 0.6, vel=vel, r=r, att=0.8, rel=1.0, warm=800), t0 + i * seg, 0.4)

a, b = SC["cold"]; tension(sec("cold"), a, b + 0.3)
a, b = SC["title"]; m = sec("title"); put(m, timpani(m2f(41), vel=0.9, r=r), a, 0.9); put(m, cymbal(vel=0.6, r=r, dur=2.0), a, 0.5)
for i, n in enumerate([72, 76, 79, 84]): put(m, glock(m2f(n), vel=0.6, r=r), a + 0.3 + i * 0.09, 0.4)
put(m, brass(m2f(48), 1.5, vel=0.7, r=r, kind="horn"), a + 0.05, 0.35)
a = SC["depart"][0]; b = SC["map1"][1]; bouncy(sec("intro"), a, b, bpm=112, root=60)
a = SC["nest"][0]; b = SC["remember"][0]; bouncy(sec("comic"), a, b, bpm=124, root=62, vel=0.9)
a, b = SC["remember"]; m = sec("remember"); put(m, pad([m2f(50), m2f(53), m2f(57)], b - a + 0.4, vel=0.35, r=r, att=0.3, rel=0.8), a, 0.4); put(m, timpani(m2f(38), vel=0.6, r=r), a + 0.2, 0.5)
a = SC["nest3"][0]; b = SC["hit"][1]; tension(sec("tense"), a, b, root=43)
a, b = SC["andrews"]; softpad(sec("andrews"), a, b, [[43, 50, 55, 58], [41, 48, 53, 56]], 0.3)
a = SC["law"][0]; b = SC["boat7"][1]; bouncy(sec("law"), a, b, bpm=96, root=57, minor=True, vel=0.8)
a = SC["bunk"][0]; b = SC["map2"][1]; tension(sec("five"), a, b, root=40, tick=False)
a, b = SC["band"]; softpad(sec("band"), a, b, [[55, 59, 62, 67], [52, 55, 60, 64], [50, 57, 60, 66]], 0.28)
a, b = SC["dawn"]; softpad(sec("dawn"), a, b, [[48, 55, 60, 64], [53, 57, 60, 65]], 0.28)
a = SC["rules"][0]; b = SC["final"][1]; bouncy(sec("outro"), a, b - 0.3, bpm=104, root=60, vel=0.9)
# card stingers
for n in range(1, 6):
    a, b = SC[f"card{n}"]; m = sec(f"card{n}")
    put(m, whoosh(0.5, r, peak=0.2), a - 0.15, 0.6)
    notes = [72, 76, 79, 84] if n < 5 else [72, 75, 79, 82]
    for i, x in enumerate(notes): put(m, glock(m2f(x), vel=0.6, r=r), a + 0.1 + i * 0.07, 0.5)
    put(m, timpani(m2f(45 if n < 5 else 40), vel=0.6, r=r, dur=1.2), a + 0.05, 0.5)

# ---------------- SFX
fx = np.zeros(N)
def pop(t, f0=520, g=0.5):
    n = int(0.12 * SR); tt = np.arange(n) / SR
    put(fx, np.sin(2 * np.pi * (f0 + 900 * tt / 0.12) * tt) * np.exp(-tt * 30), t, g)
def bloop(t, g=0.35):
    n = int(0.35 * SR); tt = np.arange(n) / SR
    put(fx, np.sin(2 * np.pi * (900 - 600 * tt / 0.35) * tt) * np.exp(-tt * 9), t, g)
def scribble(t0, dur, g=0.18):
    n = int(dur * SR); x = colored(n, r, slope=-0.5); tt = np.arange(n) / SR
    put(fx, fades(bp(x, 2500, 7000) * (0.5 + 0.5 * np.abs(np.sin(2 * np.pi * 7 * tt))) ** 2, 0.02, 0.05), t0, g)
def sparkle(t, g=0.16):
    for i, m in enumerate([96, 100, 103, 108]): put(fx, glock(m2f(m), vel=0.4, r=r, dur=0.5), t + i * 0.05, g)
def bell(t, g=0.5):
    n = int(1.6 * SR); tt = np.arange(n) / SR
    x = sum(a * np.sin(2 * np.pi * f * tt) * np.exp(-tt * d) for f, a, d in [(880, 1, 2.2), (1760 * 1.19, 0.5, 3.5), (2640 * 1.07, 0.3, 5)])
    put(fx, x, t, g)
def beeps(t0, pattern, g=0.25, f0=700):
    t = t0
    for ch in pattern:
        if ch in ".-":
            d = 0.07 if ch == "." else 0.21; n = int(d * SR); tt = np.arange(n) / SR
            put(fx, fades(np.sin(2 * np.pi * f0 * tt), 0.004, 0.004), t, g); t += d + 0.07
        else: t += 0.21
def rumble(t, dur, g=0.6):
    n = int(dur * SR); x = lp(colored(n, r, slope=-1.5), 180)
    env = np.minimum(1, np.arange(n) / (0.05 * SR)) * np.exp(-np.arange(n) / (dur * 0.5 * SR))
    put(fx, x / (np.abs(x).max() + 1e-9) * env, t, g)
def scrape(t, dur, g=0.3):
    n = int(dur * SR); x = bp(colored(n, r, slope=0.0), 900, 4000); tt = np.arange(n) / SR
    put(fx, fades(x / (np.abs(x).max() + 1e-9) * (0.6 + 0.4 * np.sin(2 * np.pi * 11 * tt)), 0.05, 0.3), t, g)
def snore(t0, dur, g=0.25):
    t = t0
    while t < t0 + dur - 1.2:
        n = int(1.0 * SR); tt = np.arange(n) / SR
        x = lp(colored(n, r, slope=-1.0), 600) * np.sin(np.pi * tt / 1.0) ** 2 * (1 + 0.5 * np.sin(2 * np.pi * 32 * tt))
        put(fx, x / (np.abs(x).max() + 1e-9), t, g); t += 1.8

# cold open: sea + five icon pops
put(fx, water_bed(SC["cold"][1], r, close=0.3), 0, 0.25)
for i in range(5): pop(Wt("N03", 8) - 4 / FPS + i * 5 / FPS, 500 + i * 80, 0.35)
put(fx, triangle(vel=0.5, r=r, dur=1.0), L["N04"] + 0.8, 0.2)
# departure: horn, crowd
a, b = SC["depart"]
put(fx, brass(m2f(38), 1.6, vel=0.8, r=r, kind="horn"), a + 0.3, 0.45); put(fx, brass(m2f(45), 1.6, vel=0.7, r=r, kind="horn"), a + 0.3, 0.3)
put(fx, applause(4.0, r, people=40), a + 0.8, 0.18)
put(fx, timpani(m2f(45), vel=0.6, r=r, dur=0.8), Wt("N06", 7) - 0.05, 0.5)  # UNSINKABLE? stamp
for k in ["N07", "N08", "N09", "N10"]: put(fx, whoosh(0.3, r, peak=0.1), L[k] - 0.1, 0.3); pop(L[k] + 0.15, 620, 0.35)
scribble(L["N11"] + 0.2, 3.0, 0.08)
# crow's nest: wind
for s in ["nest", "quote1", "nest2", "nest3"]:
    a, b = SC[s]; put(fx, breeze(b - a, r, level=0.6), a, 0.2)
pop(Wt("N13", 6) + 0.1, 640, 0.3); pop(Wt("N13", 9) + 0.1, 600, 0.3)
put(fx, clink(r, f0=2400, dur=0.2), SC["key"][0] + 0.3, 0.3); put(fx, clink(r, f0=3100, dur=0.2), SC["key"][0] + 0.45, 0.25)
put(fx, timpani(m2f(45), vel=0.5, r=r, dur=0.8), Wt("N14", 15), 0.4); sparkle(Wt("N14", 22))
pop(Wt("N15", 16) - 0.1, 300, 0.3)
# radio room: telegraph clicks + paper
a, b = SC["radio"]
t = a
while t < L["P1"]:
    put(fx, clink(r, f0=1200, dur=0.04, bright=0.4), t, 0.1); t += 0.11 + 0.18 * (int(t * 7) % 3 == 0)
scribble(a + 0.3, 3.0, 0.08)
for k in range(10): put(fx, whoosh(0.25, r, peak=0.1, f_lo=1500, f_hi=6000), a + 0.5 + k * 1.1, 0.12)
pop(Wt("N20", 5), 400, 0.3); put(fx, whoosh(0.5, r, peak=0.2), Wt("N20", 18), 0.3)
beeps(L["N21"] + 0.1, "...  .-.. ---", 0.12, 820)
put(fx, cymbal(vel=0.4, r=r, dur=0.6), L["P1"] - 0.05, 0.25); put(fx, timpani(m2f(50), vel=0.6, r=r, dur=0.6), L["P1"] - 0.05, 0.4)
# collision
bt = [Wt("N24", 10), Wt("N24", 10) + 0.4, Wt("N24", 10) + 0.8]
for t in bt: bell(t, 0.35)
put(fx, clink(r, f0=900, dur=0.1), Wt("N24", 16), 0.3)
put(fx, creak(1.2, r, rate0=60, rate1=140, scale=1.2), L["M1"] + 0.3, 0.3)
a, b = SC["hit"]; rumble(a + 0.05, 3.0, 0.7); scrape(a + 0.1, 2.2, 0.35); put(fx, creak(2.0, r, rate0=50, rate1=90, scale=1.5), a + 0.3, 0.35)
put(fx, water_bed(4.0, r, close=1.0), Wt("N27", 9), 0.35)
# law board
a = SC["law"][0]; put(fx, whoosh(0.4, r, peak=0.12), a + 0.1, 0.2)
for k in range(12): pop(SC["seats"][0] + k * 0.03 * 6, 700 + k * 20, 0.08)
for k in range(28): put(fx, clink(r, f0=1500 + k * 15, dur=0.05), SC["boat7"][0] + (10 + k * 1.2) / FPS, 0.1)
# five: snore, CQD morse, rockets
a, b = SC["bunk"]; snore(a + 0.3, b - a, 0.3)
a, b = SC["calls"]; beeps(a + 0.2, "-.-. --.- -..   -.-. --.- -..", 0.16, 760)
a, b = SC["rockets"]
for k in [0.4, 1.9, 3.4]: put(fx, whoosh(0.6, r, peak=0.3, f_lo=600, f_hi=4000), a + k, 0.2); pop(a + k + 0.7, 200, 0.18)
# sinking + after: sea only, no jokes
for s in ["sink", "empty"]:
    a, b = SC[s]; put(fx, water_bed(b - a + 0.5, r, close=0.5), a, 0.3)
a, b = SC["dawn"]; put(fx, water_bed(b - a, r, close=0.6, slosh_rate=0.5), a, 0.3)
# outro
for k in range(3): pop(L["N44"] + [0.3, 3.5, 5.1][k], 660, 0.3)
pop(L["N46"] - 0.1, 600, 0.35); sparkle(L["N46"] + 0.2)

# ---------------- level + mix
def rms(x): return float(np.sqrt(np.mean(x ** 2) + 1e-12))
sp = np.abs(uniform_filter1d(np.abs(voice), int(0.05 * SR))) > 1e-3
v_rms = rms(voice[sp])
REL = {"cold": -9, "title": -2, "intro": -10, "comic": -10, "remember": -9, "tense": -9, "andrews": -12, "law": -11,
       "five": -10, "band": -11, "dawn": -11, "outro": -10, "card1": -4, "card2": -4, "card3": -4, "card4": -4, "card5": -4}
music = np.zeros(N)
for k, buf in sections.items():
    nz = np.abs(buf) > 1e-5
    if not nz.any(): continue
    music += buf * (v_rms / rms(buf[nz]) * 10 ** (REL[k] / 20))
g_fx = v_rms / rms(fx[np.abs(fx) > 1e-5]) * 10 ** (-13 / 20)
mix = voice + music + fx * g_fx
fo = int(1.0 * SR); mix[-fo:] *= np.linspace(1, 0, fo)
mix = mix[: int(TL["total"] / FPS * SR)]
st = np.stack([mix, mix], 0)
Lm = integrated(st); st *= 10 ** ((-14 - Lm) / 20)
lim = 10 ** (-1.6 / 20); st = np.tanh(st / lim) * lim
L2 = integrated(st); st *= 10 ** ((-14 - L2) / 20); st = np.clip(st, -lim, lim)
sf.write("public/recap_mix.wav", st.T.astype(np.float32), SR)
print(f"LUFS {integrated(st):.1f}, len {st.shape[1] / SR:.2f}s, music sections: {len(sections)}")
