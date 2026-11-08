# Sound for "The Real Titanic in 3 Minutes": voices + original score per section + comic SFX.
# Mix (channel rules): voices unchanged; music about -10 dB under the voice measured per section (cards and title
# louder, the sinking section silent or a soft pad, played straight); SFX at or below the music; -14 LUFS, TP <= -1.
import sys, json, numpy as np, soundfile as sf
from scipy.signal import resample_poly
from scipy.ndimage import uniform_filter1d
import os
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "../../../../audio"))  # templates/audio
from dsp import SR, rng, lp, hp, bp, colored, fades, integrated
from instruments import pluck, glock, snare, brush, triangle, pad, m2f, timpani, cymbal, brass
from sfx_gen import whoosh, stroll_step, clink, creak, applause, breeze, water_bed

EP = os.environ.get("EP1_DIR", "../ep01")  # voice folder (repo layout: ../ep01)
TL = json.load(open("src/ep1_timeline.json"))
FPS = 30; N = int(TL["total"] / FPS * SR) + SR
r = rng(21)
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
    put(voice, load(f"{EP}/voice/{k}/voice.wav" if k.startswith("N") else f"{EP}/voice/{k}.wav"), t)
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


def sting(name, t, minor=False):
    m = sec(name); put(m, timpani(m2f(41 if not minor else 38), vel=0.8, r=r), t, 0.8); put(m, cymbal(vel=0.5, r=r, dur=1.6), t, 0.4)
    for i, n in enumerate([72, 76, 79, 84] if not minor else [72, 75, 79, 82]): put(m, glock(m2f(n), vel=0.6, r=r), t + 0.25 + i * 0.08, 0.4)
dark10 = TL["lines"]["N10"]["start"] / FPS + TL["words"]["N10"][12]["s"]
a, b = SC["cold"][0], SC["flash"][1]; tension(sec("cold"), a, b + 0.2, root=45, tick=False)
sting("sting_t1", L["T1"] - 0.1, minor=True)
a, b = SC["browne"][0], SC["film"][1]; bouncy(sec("intro"), a, b - 0.3, bpm=104, root=60, vel=0.85)
a, b = SC["title"]; sting("sting_title", a); put(sections["sting_title"], brass(m2f(48), 1.5, vel=0.7, r=r, kind="horn"), a + 0.05, 0.35)
a = SC["yard"][0]; bouncy(sec("yard"), a, dark10 - 0.2, bpm=116, root=62, vel=0.9)
softpad(sec("memorial"), dark10, SC["yard2"][1], [[50, 57, 62, 65], [48, 55, 60, 63]], 0.3)
a, b = SC["launch"][0], SC["fit"][1]; bouncy(sec("launch"), a, b, bpm=120, root=60)
sting("sting_name", L["K1"] - 0.05)
a, b = SC["south"][0], SC["nearmiss"][1]; bouncy(sec("south"), a, b, bpm=112, root=60, vel=0.9)
a, b = SC["classes"][0], SC["classes3"][1]; bouncy(sec("classes"), a, b, bpm=100, root=62, vel=0.8)
a, b = SC["sage"][0], SC["remember"][1]; softpad(sec("sage"), a, b, [[55, 59, 62, 67], [52, 55, 60, 64], [53, 57, 60, 65]], 0.28)
a, b = SC["classes4"][0], SC["boiler"][1]; bouncy(sec("boiler"), a, b, bpm=120, root=57, minor=True, vel=0.85)
a, b = SC["radio"]; bouncy(sec("radio"), a, b, bpm=104, root=60, vel=0.7, glk=False)
a, b = SC["radio2"]; tension(sec("radio2"), a, b + 0.3, root=43, tick=True)
a, b = SC["cherbourg"][0], SC["nomadic"][1]; bouncy(sec("cherb"), a, b, bpm=96, root=57, vel=0.8)
a, b = SC["dinner"]; bouncy(sec("dinner"), a, b, bpm=108, root=60, vel=0.85)
a = SC["queens"][0]; bouncy(sec("queens"), a, L["T2"] - 0.3, bpm=104, root=62, vel=0.85)
sting("sting_t2", L["T2"] - 0.1, minor=True)
a, b = SC["leave"][0], SC["leave2"][1]; softpad(sec("leave"), a + 1.0, b, [[48, 55, 60, 64], [53, 57, 60, 65], [55, 59, 62, 67]], 0.3)
a, b = SC["trunk"]; bouncy(sec("trunk"), a, b, bpm=96, root=57, minor=True, vel=0.7)
a, b = SC["west"]; softpad(sec("west"), a, b, [[48, 55, 60, 64], [45, 52, 57, 60], [53, 57, 60, 65], [55, 59, 62, 67]], 0.3)
a, b = SC["next"]; tension(sec("next"), a, b, root=40, tick=True)
a, b = SC["final"]; bouncy(sec("outro"), a, b - 0.3, bpm=104, root=60, vel=0.9)
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


def W_(k, i): return L[k] + TL["words"][k][min(i, len(TL["words"][k]) - 1)]["s"]
def shutter(t, g=0.45):
    put(fx, clink(r, f0=3200, dur=0.04, bright=0.7), t, g); put(fx, clink(r, f0=1800, dur=0.05, bright=0.5), t + 0.06, g * 0.8); pop(t + 0.02, 1400, 0.15)
for s in ["cold", "queens", "leave", "cherbourg", "nomadic"]:
    a, b = SC[s]; put(fx, water_bed(b - a + 0.3, r, close=0.4), a, 0.22)
a, b = SC["flash"]; put(fx, water_bed(b - a, r, close=0.3), a, 0.2)
put(fx, timpani(m2f(45), vel=0.7, r=r, dur=0.8), L["T1"], 0.6); put(fx, timpani(m2f(45), vel=0.7, r=r, dur=0.8), L["T2"], 0.6)
for k in [5, 10, 14]: shutter(W_("N04", k))
shutter(W_("N21", 4)); shutter(W_("N31", 10)); shutter(W_("N42", 18))
for k in [0, 1, 2, 3, 4]: pop(W_("N05", 9) + k * 0.07, 600 + k * 60, 0.2)
a, b = SC["yard"]
t = a + 0.2
while t < b: put(fx, clink(r, f0=1500 + 300 * (int(t * 3) % 3), dur=0.06, bright=0.6), t, 0.16); t += 0.42
t = SC["yard2"][0]
while t < dark10: put(fx, clink(r, f0=2100, dur=0.07, bright=0.8), t, 0.3); t += 0.7
a, b = SC["launch"]; put(fx, creak(2.0, r, rate0=40, rate1=90, scale=1.3), a + 0.3, 0.3); put(fx, applause(3.5, r, people=60), a + 1.5, 0.25); put(fx, water_bed(2.5, r, close=1.0), b - 1.8, 0.4)
for k in [5, 6, 8]: pop(W_("N12", k), 620, 0.3)
sparkle(L["K1"])
a, b = SC["south"]; put(fx, applause(4.0, r, people=40), a + 0.4, 0.15)
put(fx, brass(m2f(38), 1.6, vel=0.8, r=r, kind="horn"), SC["south2"][0] + 0.2, 0.4)
pop(W_("N15", 10), 300, 0.35)
sn = W_("N16", 14); put(fx, whoosh(0.3, r, peak=0.2), sn - 0.1, 0.4); pop(sn, 250, 0.5); put(fx, timpani(m2f(40), vel=0.6, r=r, dur=0.6), sn, 0.5)
put(fx, creak(1.6, r, rate0=50, rate1=100, scale=1.2), sn + 0.3, 0.3)
pop(W_("N19", 5), 600, 0.3)
for i in range(11): pop(W_("N26", 4) + (i * 6 + 20) / FPS, 560 + i * 30, 0.18)
put(fx, timpani(m2f(45), vel=0.5, r=r, dur=0.6), W_("N26", 22), 0.4)
a, b = SC["boiler"]; rumble(a, b - a, 0.25); put(fx, breeze(b - a, r, level=0.4), a, 0.12)
t = a + 0.3
while t < b: put(fx, clink(r, f0=700, dur=0.08, bright=0.3), t, 0.18); t += 0.75
a, b = SC["radio"]; beeps(a + 0.3, "... .. ..  .-.  .-", 0.1, 820)
pop(W_("N24", 4), 300, 0.4); put(fx, timpani(m2f(45), vel=0.5, r=r, dur=0.6), W_("N24", 4), 0.4)
pop(W_("N37", 16), 700, 0.3); sparkle(W_("N37", 16))
scribble(W_("N38", 14), 2.0, 0.1); beeps(L["R1"] + 3.0, ".-.. ..", 0.08, 760)
put(fx, applause(2.5, r, people=20), SC["queens"][0] + 3.0, 0.1)
put(fx, creak(1.4, r, rate0=40, rate1=80, scale=1.0), SC["trunk"][0] + 3.0, 0.3)
sparkle(SC["final"][0] + 0.2)
# ---------------- level + mix
def rms(x): return float(np.sqrt(np.mean(x ** 2) + 1e-12))
sp = np.abs(uniform_filter1d(np.abs(voice), int(0.05 * SR))) > 1e-3
v_rms = rms(voice[sp])
REL = {k: (-3 if k.startswith("sting") else -12 if k in ("memorial", "sage", "leave", "west") else -10) for k in sections}
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
sf.write("public/ep1_mix.wav", st.T.astype(np.float32), SR)
print(f"LUFS {integrated(st):.1f}, len {st.shape[1] / SR:.2f}s, music sections: {len(sections)}")
