# Sound for the vertical Shorts: voices + original score per scene + SFX. Music ~-10 dB under the voice, -14 LUFS, TP <= -1.
# usage: python3 sound_short.py A|B   (run from project/)
import sys, json, numpy as np, soundfile as sf, os
from scipy.signal import resample_poly
from scipy.ndimage import uniform_filter1d
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "../../../../audio"))
from dsp import SR, rng, lp, hp, bp, colored, fades, integrated
from instruments import pluck, glock, snare, brush, triangle, pad, m2f, timpani, cymbal, brass
from sfx_gen import whoosh, clink, creak, applause, breeze, water_bed
WHO = sys.argv[1]
TL = json.load(open(f"src/sh{WHO}_timeline.json")); VD = "../shorts_ep1/voice" if WHO in "AB" else "../shorts_ep2/voice"
FPS = 30; N = int(TL["total"] / FPS * SR) + SR; r = rng({"A": 33, "B": 44, "C": 55, "D": 66}[WHO])
L = {k: v["start"] / FPS for k, v in TL["lines"].items()}
SC = {s["name"]: (s["a"] / FPS, s["b"] / FPS) for s in TL["scenes"]}
def Wt(k, i): return L[k] + TL["words"][k][min(i, len(TL["words"][k]) - 1)]["s"]
def mono(x):
    x = np.asarray(x, float); return x.mean(1) if x.ndim == 2 else x
def put(buf, x, t, g=1.0):
    x = mono(x); i = int(t * SR)
    if i >= len(buf) or i < 0: return
    x = x[: len(buf) - i]; buf[i:i + len(x)] += x * g
def load(p):
    a, sr = sf.read(p); a = mono(a); return resample_poly(a, SR, sr) if sr != SR else a
voice = np.zeros(N)
for k, t in L.items(): put(voice, load(f"{VD}/{k}/voice.wav" if len(k) == 3 and k[0] in "ABCD" and k[1:].isdigit() else f"{VD}/{k}.wav"), t)
sections = {}
def sec(n): sections[n] = np.zeros(N); return sections[n]
def bouncy(buf, t0, t1, bpm=112, root=60, minor=False, glk=True, vel=1.0):
    beat = 60 / bpm; prog = [0, 9, 5, 7] if not minor else [0, 8, 3, 7]
    scale = [0, 2, 4, 7, 9, 12, 14, 16] if not minor else [0, 3, 5, 7, 10, 12, 15]; b = 0; t = t0
    while t < t1 - 0.05:
        ch = root - 24 + prog[(b // 4) % 4]
        put(buf, pluck(m2f(ch + (12 if b % 2 else 0)), vel=0.7, r=r, dur=0.45, bright=0.35), t, 0.55 * vel)
        if b % 2: put(buf, brush(vel=0.4, r=r, dur=0.22), t, 0.3 * vel)
        if glk:
            for e in range(2):
                if (b * 2 + e) % 5 != 3: put(buf, glock(m2f(root + 12 + scale[(b * 3 + e * 2 + (b // 4)) % len(scale)]), vel=0.4, r=r, dur=0.5), t + e * beat / 2, 0.2 * vel)
        if b % 4 == 0:
            third = 3 if minor else 4
            put(buf, pad([m2f(ch + 24), m2f(ch + 24 + third), m2f(ch + 31)], min(beat * 4.1, t1 - t), vel=0.3, r=r, att=0.15, rel=0.5), t, 0.16 * vel)
        b += 1; t += beat
def tension(buf, t0, t1, root=45, tick=True, step=0.5):
    put(buf, pad([m2f(root), m2f(root + 7), m2f(root + 12), m2f(root + 15)], t1 - t0, vel=0.35, r=r, att=0.6, rel=1.0, warm=600), t0, 0.35)
    if tick:
        t = t0
        while t < t1 - 0.1: put(buf, clink(r, f0=1800, dur=0.05, bright=0.6), t, 0.12); t += step
        for k in np.arange(t0, t1 - 0.5, 2.0): put(buf, timpani(m2f(root - 12), vel=0.5, r=r, dur=1.4), k, 0.4)
def softpad(buf, t0, t1, chords, vel=0.3):
    seg = (t1 - t0) / len(chords)
    for i, c in enumerate(chords): put(buf, pad([m2f(x) for x in c], seg + 0.6, vel=vel, r=r, att=0.8, rel=1.0, warm=800), t0 + i * seg, 0.4)
def sting(n, t, minor=False):
    m = sec(n); put(m, timpani(m2f(41 if not minor else 38), vel=0.8, r=r), t, 0.8); put(m, cymbal(vel=0.5, r=r, dur=1.6), t, 0.4)
    for i, x in enumerate([72, 76, 79, 84] if not minor else [72, 75, 79, 82]): put(m, glock(m2f(x), vel=0.6, r=r), t + 0.25 + i * 0.08, 0.4)
fx = np.zeros(N)
def pop(t, f0=520, g=0.5):
    n = int(0.12 * SR); tt = np.arange(n) / SR; put(fx, np.sin(2 * np.pi * (f0 + 900 * tt / 0.12) * tt) * np.exp(-tt * 30), t, g)
def scribble(t0, dur, g=0.18):
    n = int(dur * SR); x = colored(n, r, slope=-0.5); tt = np.arange(n) / SR
    put(fx, fades(bp(x, 2500, 7000) * (0.5 + 0.5 * np.abs(np.sin(2 * np.pi * 7 * tt))) ** 2, 0.02, 0.05), t0, g)
def sparkle(t, g=0.16):
    for i, m in enumerate([96, 100, 103, 108]): put(fx, glock(m2f(m), vel=0.4, r=r, dur=0.5), t + i * 0.05, g)
def shutter(t, g=0.45):
    put(fx, clink(r, f0=3200, dur=0.04, bright=0.7), t, g); put(fx, clink(r, f0=1800, dur=0.05, bright=0.5), t + 0.06, g * 0.8); pop(t + 0.02, 1400, 0.15)
def keys(t0, dur, g=0.2):
    t = t0
    while t < t0 + dur: put(fx, clink(r, f0=2400 + 400 * r.random(), dur=0.03, bright=0.8), t, g); t += 0.09 + 0.05 * r.random()
def bang(t, g=0.8):
    n = int(0.5 * SR); x = colored(n, r, slope=-0.8); env = np.exp(-np.arange(n) / (0.06 * SR))
    put(fx, x / (np.abs(x).max() + 1e-9) * env, t, g); put(fx, timpani(m2f(38), vel=0.9, r=r, dur=0.6), t, 0.6)
def horn(t, d=1.6, g=0.4): put(fx, brass(m2f(38), d, vel=0.8, r=r, kind="horn"), t, g)
def rumble(t, dur, g=0.6):
    n = int(dur * SR); x = lp(colored(n, r, slope=-1.5), 180)
    env = np.minimum(1, np.arange(n) / (0.05 * SR)) * np.exp(-np.arange(n) / (dur * 0.5 * SR)); put(fx, x / (np.abs(x).max() + 1e-9) * env, t, g)
REL = {}
if WHO == "A":
    a, b = SC["hook"]; tension(sec("hook"), a, b + 0.2, root=45, tick=True)
    for i in range(5): pop((3 + i * 5) / FPS, 600 + i * 80, 0.35)
    a, b = SC["ticket"][0], SC["photos"][1]; bouncy(sec("light"), a, b, bpm=108, root=60, vel=0.9)
    a, b = SC["dinner"][0], SC["dinner2"][1]; bouncy(sec("dinner"), a, b, bpm=100, root=62, vel=0.8)
    a, b = SC["queens"]; tension(sec("queens"), a, b, root=43, tick=True, step=0.5)
    sting("sting_t1", L["T1"] - 0.1, minor=True)
    a, b = SC["leave"][0], SC["berg"][1]; softpad(sec("leave"), a + 0.3, b, [[48, 55, 60, 64], [53, 57, 60, 65], [45, 52, 57, 60]], 0.3)
    a, b = SC["trunk"]; bouncy(sec("trunk"), a, b, bpm=96, root=57, minor=True, vel=0.7)
    a, b = SC["end"]; softpad(sec("end"), a, b, [[48, 55, 60, 64], [53, 57, 60, 65], [55, 59, 62, 67], [48, 55, 60, 64]], 0.32)
    REL = {"leave": -12, "end": -11}
    for s in ["hook", "queens", "leave"]:
        a, b = SC[s]; put(fx, water_bed(b - a + 0.3, r, close=0.4), a, 0.2)
    put(fx, applause(3.0, r, people=40), SC["ticket"][0] + 0.3, 0.12)
    sparkle(Wt("A02", 12)); pop(L["A03"] + 0.2, 300, 0.3)
    for k in [2, 9, 16]: shutter(Wt("A04", k))
    pop(Wt("A05", 12), 700, 0.3); sparkle(Wt("A05", 12))
    keys(Wt("A06", 9), 2.0, 0.12); scribble(Wt("A06", 9), 1.5, 0.08)
    put(fx, timpani(m2f(45), vel=0.7, r=r, dur=0.8), L["T1"], 0.6)
    shutter(Wt("A08", 14))
    rumble(L["A09"] + 0.9, 1.4, 0.5)
    put(fx, creak(1.4, r, rate0=40, rate1=80, scale=1.0), Wt("A10", 6), 0.3)
    pop(Wt("A11", 11), 520, 0.35); sparkle(L["A11"] + TL["lines"]["A11"]["dur"] / FPS + 0.2)
elif WHO == "C":
    a, b = SC["hook"]; tension(sec("hook"), a, b + 0.2, root=45, tick=True, step=0.4)
    a, b = SC["baltic"]; tension(sec("baltic"), a, b, root=43, tick=True, step=0.5)
    a, b = SC["hand"][0], SC["pocket"][1]; bouncy(sec("deck"), a, b, bpm=100, root=60, minor=True, vel=0.75)
    a, b = SC["chart"][0], SC["deck"][1]; bouncy(sec("chart"), a, b, bpm=104, root=57, minor=True, vel=0.75)
    a, b = SC["back"][0], SC["count"][1]; tension(sec("count"), a, b, root=41, tick=True, step=0.55)
    a, b = SC["end"]; softpad(sec("end"), a, b, [[45, 52, 57, 60], [41, 48, 53, 57], [43, 50, 55, 59]], 0.32)
    REL = {"end": -11}
    for s_ in ["hand", "pocket", "deck"]:
        a, b = SC[s_]; put(fx, breeze(b - a, r, level=0.3), a, 0.1)
    for i in range(6): put(fx, clink(r, f0=1600, dur=0.05, bright=0.6), 0.2 + i * 0.4, 0.2)
    pop(Wt("C02", 4), 700, 0.3); put(fx, timpani(m2f(45), vel=0.6, r=r, dur=0.8), Wt("C04", 8), 0.5)
    pop(Wt("C05", 23), 500, 0.35); pop(Wt("C07", 9), 600, 0.3)
    for i in range(6): pop(Wt("C08", 4) + i * 0.13, 500 + i * 60, 0.3)
    put(fx, water_bed(SC["end"][1] - SC["end"][0], r, close=0.3), SC["end"][0], 0.18)
elif WHO == "D":
    a, b = SC["hook"]; tension(sec("hook"), a, b + 0.2, root=45, tick=True, step=0.35)
    a, b = SC["cali"]; tension(sec("cali"), a, b, root=43, tick=False)
    a, b = SC["pile"][0], SC["cape"][1]; bouncy(sec("pile"), a, b, bpm=112, root=57, minor=True, vel=0.8)
    a, b = SC["mech"]; bouncy(sec("mech"), a, b, bpm=100, root=60, vel=0.7)
    a, b = SC["reply"][0], SC["evans"][1]; tension(sec("evans"), a, b, root=41, tick=True, step=0.5)
    sting("sting_berg", SC["berg"][0] + 0.1, minor=True)
    a, b = SC["off"][0], SC["end"][1]; softpad(sec("end"), a, b, [[45, 52, 57, 60], [41, 48, 53, 57], [43, 50, 55, 59]], 0.32)
    REL = {"end": -12}
    for s_ in ["hook", "pile", "mech", "reply"]:
        a, b = SC[s_]; t = a + 0.2
        while t < b - 0.3:
            for ch in ".-..-.--":
                d = 0.07 if ch == "." else 0.2; n = int(d * SR); tt = np.arange(n) / SR
                put(fx, fades(np.sin(2 * np.pi * 760 * tt), 0.004, 0.004), t, 0.08); t += d + 0.07
            t += 1.2
    bang(Wt("D01", 18), 0.35)
    put(fx, whoosh(0.5, r, peak=0.2), Wt("D05", 32), 0.3); bang(Wt("D05", 34), 0.3)
    put(fx, creak(1.4, r, rate0=40, rate1=80, scale=1.0), Wt("D06", 16), 0.25)
    rumble(L["D07"] + 0.3, 1.6, 0.55)
    for i in range(4): pop(Wt("D08", 2) + i * 0.4, 400, 0.15)
    put(fx, water_bed(SC["end"][1] - SC["cali"][0], r, close=0.2), SC["cali"][0], 0.1)
else:
    a, b = SC["hook"]; tension(sec("hook"), a, b + 0.2, root=45, tick=True, step=0.4)
    a, b = SC["dock"]; bouncy(sec("dock"), a, b, bpm=112, root=60, vel=0.85)
    a, b = SC["snap"][0], SC["swing"][1]; tension(sec("snap"), a, b + 0.2, root=41, tick=True, step=0.25)
    a, b = SC["question"][0], SC["mech"][1]; bouncy(sec("mech"), a, b, bpm=100, root=57, minor=True, vel=0.75, glk=True)
    a, b = SC["tug"][0], SC["close"][1]; tension(sec("tug"), a, b + 0.2, root=43, tick=True, step=0.3)
    a, b = SC["geddes"]; bouncy(sec("geddes"), a, b, bpm=108, root=60, vel=0.7, glk=False)
    sting("sting_smith", L["B09"] - 0.1, minor=True)
    a, b = SC["hawke"][0], SC["delay"][1]; bouncy(sec("hawke"), a, b, bpm=96, root=55, minor=True, vel=0.75)
    a, b = SC["end"]; softpad(sec("end"), a, b, [[45, 52, 57, 60], [41, 48, 53, 57], [43, 50, 55, 59]], 0.32)
    REL = {"end": -11}
    for s in ["dock", "snap", "swing", "tug", "close"]:
        a, b = SC[s]; put(fx, water_bed(b - a + 0.3, r, close=0.5), a, 0.2)
    horn(SC["dock"][0] + 0.4, 1.8, 0.35)
    for k in [1, 2, 3]: bang(Wt("B03", k), 0.7)
    for k in [9, 11, 12]: bang(Wt("B03", k) + 0.1, 0.45)
    put(fx, creak(2.0, r, rate0=50, rate1=100, scale=1.2), L["B04"], 0.35)
    put(fx, whoosh(0.6, r, peak=0.3), Wt("B06", 7), 0.3); put(fx, whoosh(0.5, r, peak=0.2), Wt("B06", 18), 0.25); bang(Wt("B06", 23), 0.35)
    put(fx, brass(m2f(50), 0.25, vel=0.7, r=r, kind="horn"), Wt("B07", 2), 0.0)
    for t in [Wt("B07", 2), Wt("B07", 2) + 0.15]: put(fx, clink(r, f0=1300, dur=0.12, bright=0.5), t, 0.5)
    put(fx, whoosh(0.4, r, peak=0.2), Wt("B07", 9), 0.3); bang(Wt("B07", 13), 0.5); pop(Wt("B07", 17), 400, 0.35)
    put(fx, creak(1.5, r, rate0=40, rate1=70, scale=1.0), L["B08"], 0.3); pop(Wt("B08", 5), 700, 0.3)
    rumble(Wt("B10", 18), 1.2, 0.55); bang(Wt("B10", 18), 0.4)
    pop(Wt("B11", 14), 400, 0.3); pop(Wt("B11", 16), 700, 0.35)
    rumble(Wt("B12", 7), 1.4, 0.4)
def rms(x): return float(np.sqrt(np.mean(x ** 2) + 1e-12))
sp = np.abs(uniform_filter1d(np.abs(voice), int(0.05 * SR))) > 1e-3; v_rms = rms(voice[sp])
music = np.zeros(N)
for k, buf in sections.items():
    nz = np.abs(buf) > 1e-5
    if not nz.any(): continue
    rel = -3 if k.startswith("sting") else REL.get(k, -10)
    music += buf * (v_rms / rms(buf[nz]) * 10 ** (rel / 20))
g_fx = v_rms / rms(fx[np.abs(fx) > 1e-5]) * 10 ** (-12 / 20)
mix = voice + music + fx * g_fx
fo = int(0.8 * SR); mix = mix[: int(TL["total"] / FPS * SR)]; mix[-fo:] *= np.linspace(1, 0, fo)
st = np.stack([mix, mix], 0); Lm = integrated(st); st *= 10 ** ((-14 - Lm) / 20)
lim = 10 ** (-1.6 / 20); st = np.tanh(st / lim) * lim
L2 = integrated(st); st *= 10 ** ((-14 - L2) / 20); st = np.clip(st, -lim, lim)
sf.write(f"public/sh{WHO}_mix.wav", st.T.astype(np.float32), SR)
# music-vs-voice check per 30 s window
for w0 in range(0, int(len(mix) / SR), 30):
    s0, s1 = w0 * SR, min(len(mix), (w0 + 30) * SR); vm = voice[s0:s1]; mm = music[s0:s1]
    print(f"  {w0:3d}s music vs voice {20*np.log10(rms(mm)/rms(vm[np.abs(vm)>1e-3])):.1f} dB")
print(f"LUFS {integrated(st):.1f}, len {st.shape[1] / SR:.2f}s")
