# Sound for the vertical Shorts: voices + original score per scene + SFX. Music ~-10 dB under the voice, -14 LUFS, TP <= -1.
# Episode 2 mix (run from project/): python3 sound_ep2.py
import sys, json, numpy as np, soundfile as sf, os
from scipy.signal import resample_poly
from scipy.ndimage import uniform_filter1d
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "../../../../audio"))
from dsp import SR, rng, lp, hp, bp, colored, fades, integrated
from instruments import pluck, glock, snare, brush, triangle, pad, m2f, timpani, cymbal, brass
from sfx_gen import whoosh, clink, creak, applause, breeze, water_bed
WHO = "ep2"
TL = json.load(open("src/ep2_timeline.json")); VD = "../ep02/voice"
FPS = 30; N = int(TL["total"] / FPS * SR) + SR; r = rng(55)
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
for k, t in L.items(): put(voice, load(f"{VD}/{k}/voice.wav" if k.startswith("N") else f"{VD}/{k}.wav"), t)
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
REL = {"memorial": -12, "soft": -12, "end": -12, "sunday": -11}
def span(a, b): return SC[a][0], SC[b][1]
a, b = span("cold", "cold2"); tension(sec("cold"), a, b, root=45, tick=True, step=0.5)
a, b = SC["cold3"]; tension(sec("cold3"), a, b + 0.2, root=43, tick=False)
sting("st_title", SC["title"][0])
a, b = span("leave", "radio"); bouncy(sec("radio"), a, b, bpm=108, root=60, vel=0.85)
a, b = span("mech", "money2"); bouncy(sec("mech"), a, b, bpm=100, root=62, vel=0.75, glk=True)
sting("st_ch1", SC["ch_life"][0])
a, b = span("bear", "andrews"); bouncy(sec("life"), a, b, bpm=112, root=60, vel=0.9)
sting("st_ch2", SC["ch_fire"][0], minor=True)
a, b = span("fire", "fire2"); bouncy(sec("fire"), a, b, bpm=104, root=57, minor=True, vel=0.8)
a, b = span("cape", "runs2"); bouncy(sec("runs"), a, b, bpm=104, root=62, vel=0.8)
a, b = span("broke", "broke2"); tension(sec("broke"), a, b, root=41, tick=True, step=0.5)
sting("st_ch3", SC["ch_sunday"][0])
a, b = SC["sunday"]; softpad(sec("sunday"), a, b, [[48, 55, 60, 64], [53, 57, 60, 65], [55, 59, 62, 67]], 0.32)
a, b = span("w1", "w3"); tension(sec("warn1"), a, b, root=45, tick=True, step=0.6)
a, b = span("corner", "w4"); tension(sec("warn2"), a, b, root=43, tick=True, step=0.55)
a, b = span("dinner", "dinner2"); bouncy(sec("dinner"), a, b, bpm=96, root=60, vel=0.7, glk=True)
a, b = SC["hymn"]; softpad(sec("soft"), a, b, [[48, 55, 60, 64], [45, 52, 57, 60], [53, 57, 60, 65], [55, 59, 62, 67]], 0.32)
a, b = span("bridge", "nest"); tension(sec("night"), a, b, root=40, tick=False)
a, b = span("w5", "w5b"); tension(sec("warn3"), a, b, root=41, tick=True, step=0.45)
a, b = SC["hymnend"]; softpad(sec("memorial"), a, b, [[48, 55, 60, 64], [53, 57, 60, 65]], 0.3)
a, b = span("w6", "evans"); tension(sec("warn4"), a, b, root=40, tick=True, step=0.4)
a, b = SC["count"]; tension(sec("count"), a, b, root=38, tick=True, step=0.75)
a, b = span("end", "end3"); softpad(sec("end"), a, b, [[45, 52, 57, 60], [41, 48, 53, 57], [43, 50, 55, 59]], 0.3)
sting("st_next", SC["next"][0], minor=True)
a, b = SC["final"]; bouncy(sec("outro"), a, b - 0.3, bpm=104, root=60, vel=0.9)
# sfx
for s_ in ["cold", "cold2", "w2", "w2b", "astor", "nav", "bear", "bear2", "andrews"]:
    a, b = SC[s_]; put(fx, breeze(b - a, r, level=0.3), a, 0.1)
for s_ in ["cold3", "leave", "end", "end3", "next", "count", "w6"]:
    a, b = SC[s_]; put(fx, water_bed(b - a + 0.3, r, close=0.3), a, 0.18)
for s_ in ["radio", "mech", "money", "money2", "w3", "w4", "w5", "w5b", "w6b"]:
    a, b = SC[s_]; t = a + 0.3
    while t < b - 0.3:
        pat = ".-..-.--" if int(t) % 2 else "-.-.--.-"; t0 = t
        for ch in pat:
            d = 0.07 if ch == "." else 0.2; n = int(d * SR); tt = np.arange(n) / SR
            put(fx, fades(np.sin(2 * np.pi * 760 * tt), 0.004, 0.004), t, 0.08); t += d + 0.07
        t = t0 + 2.6
for k in ["N02", "N34", "N35", "N37", "N40", "N46", "N48"]: pop(L[k] + 0.4, 700, 0.3)
put(fx, timpani(m2f(45), vel=0.6, r=r, dur=0.8), Wt("N03", 5), 0.5)
sparkle(Wt("N08", 9)); pop(L["P1"], 600, 0.25)
put(fx, whoosh(0.5, r, peak=0.2), Wt("N12", 14), 0.3)
for k in [10, 15]: pop(Wt("N14", k), 520, 0.3)
sparkle(Wt("N17", 12)); pop(L["D1"], 700, 0.2)
a, b = span("fire", "fire2"); rumble(a, b - a, 0.22)
t = SC["fire"][0] + 0.3
while t < SC["fire"][1]: put(fx, clink(r, f0=700, dur=0.08, bright=0.3), t, 0.18); t += 0.75
pop(Wt("N28", 3), 600, 0.35); pop(Wt("N28", 11), 700, 0.35)
a, b = SC["broke"]
t = a + 0.5
while t < b: put(fx, clink(r, f0=3000, dur=0.03, bright=0.9), t, 0.15); t += 0.9 + 0.5 * r.random()
pop(Wt("N31", 21), 900, 0.35)
put(fx, applause(0.1, r, people=1), SC["sunday"][0], 0.0)
for t in WT_ if False else []: pass
for k, i in [("N34", 2), ("N35", 3), ("N37", 2), ("N40", 2), ("N46", 3), ("N48", 3)]:
    put(fx, glock(m2f(84), vel=0.6, r=r, dur=0.6), Wt(k, i), 0.3); put(fx, timpani(m2f(41), vel=0.5, r=r, dur=0.6), Wt(k, i), 0.35)
for i, k in enumerate([6, 11, 19, 23, 35, 42]): pop(Wt("N51", k) + 0.2, 500 + i * 60, 0.35)
put(fx, creak(1.4, r, rate0=40, rate1=80, scale=1.0), Wt("N50", 21), 0.25)
for i in range(6): put(fx, clink(r, f0=1600, dur=0.05, bright=0.6), L["N55"] + i * 0.5, 0.3)
rumble(SC["next"][0] + 0.2, 1.6, 0.4)
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
sf.write("public/ep2_mix.wav", st.T.astype(np.float32), SR)
# music-vs-voice check per 30 s window
for w0 in range(0, int(len(mix) / SR), 30):
    s0, s1 = w0 * SR, min(len(mix), (w0 + 30) * SR); vm = voice[s0:s1]; mm = music[s0:s1]
    print(f"  {w0:3d}s music vs voice {20*np.log10(rms(mm)/rms(vm[np.abs(vm)>1e-3])):.1f} dB")
print(f"LUFS {integrated(st):.1f}, len {st.shape[1] / SR:.2f}s")
