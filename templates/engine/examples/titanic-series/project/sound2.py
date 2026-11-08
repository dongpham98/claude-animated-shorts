# Sound for Test 2: narrator + character lines, bouncy original music bed, comic SFX.
# Mix rule (Titanic lesson): voices unchanged, music about -10 dB under the voice (measured over speech),
# louder only in the cold open and the tail; SFX at or below the music; -14 LUFS, true peak <= -1 dBTP.
import sys, json, numpy as np, soundfile as sf
from scipy.signal import resample_poly
sys.path.insert(0, "/home/claude/repo/templates/audio")
from dsp import SR, rng, lp, hp, bp, colored, fades, integrated, true_peak
from instruments import pluck, glock, snare, brush, triangle, pad, m2f
from sfx_gen import whoosh, stroll_step, clink

C = json.load(open("cues2.json"))
FPS = 30
DUR = C["OUT"] / FPS
N = int(DUR * SR)
t_ = lambda fr: fr / FPS
r = rng(7)

def load(path):
    a, sr = sf.read(path)
    if a.ndim > 1: a = a.mean(1)
    if sr != SR: a = resample_poly(a, SR, sr)
    return a

def put(buf, x, t, g=1.0):
    x = np.asarray(x, float)
    if x.ndim == 2: x = x.mean(0) if x.shape[0] == 2 else x.mean(1)
    i = int(t * SR)
    if i >= len(buf): return
    x = x[: len(buf) - i]
    buf[i:i + len(x)] += x * g

voice = np.zeros(N)
V = "voice/"
for key, fr in [("out_n1/voice.wav", "n1"), ("out_n2/voice.wav", "n2"), ("out_n3/voice.wav", "n3"),
                ("a1.wav", "a1"), ("s1.wav", "s1"), ("a2.wav", "a2")]:
    put(voice, load(V + key), t_(C[fr]))

# ---------- music: 112 bpm, I-vi-IV-V in C, pluck bass + glock tune + brushes ----------
bpm = 112; beat = 60 / bpm
mus = np.zeros(N)
prog_ = [48, 45, 41, 43]  # C2 A1 F1 G1 (midi)
tune = [72, 76, 79, 76, 77, 76, 74, 72, 71, 74, 79, 77, 76, 74, 72, 74]
nb = int(DUR / beat) + 1
for b in range(nb):
    t = b * beat; root = prog_[(b // 4) % 4]
    put(mus, pluck(m2f(root + (12 if b % 2 else 0)), vel=0.7, r=r, dur=0.5, bright=0.35), t, 0.55)
    if b % 2 == 1: put(mus, brush(vel=0.45, r=r, dur=0.25), t, 0.35)
    for e in range(2):
        n = tune[(b * 2 + e) % len(tune)]
        if (b * 2 + e) % 5 != 4:
            put(mus, glock(m2f(n), vel=0.45, r=r, dur=0.6), t + e * beat / 2, 0.22)
    if b % 4 == 0:
        ch = [root + 24, root + 28, root + 31] if root in (48, 41, 43) else [root + 24, root + 27, root + 31]
        put(mus, pad([m2f(x) for x in ch], beat * 4.1, vel=0.35, r=r, att=0.2, rel=0.6), t, 0.18)
mus = lp(mus, 7000)

# ---------- SFX ----------
fx = np.zeros(N)
def pop(t, f0=520, g=0.5):
    n = int(0.12 * SR); tt = np.arange(n) / SR
    s = np.sin(2 * np.pi * (f0 + 900 * tt / 0.12) * tt) * np.exp(-tt * 30)
    put(fx, s, t, g)
def bloop(t, g=0.35):
    n = int(0.35 * SR); tt = np.arange(n) / SR
    s = np.sin(2 * np.pi * (900 - 600 * tt / 0.35) * tt) * np.exp(-tt * 9)
    put(fx, s, t, g)
def scribble(t0, dur, g=0.18):
    n = int(dur * SR); x = colored(n, r, slope=-0.5)
    tt = np.arange(n) / SR; env = (0.5 + 0.5 * np.abs(np.sin(2 * np.pi * 7 * tt))) ** 2
    put(fx, fades(bp(x, 2500, 7000) * env, 0.02, 0.05), t0, g)
def sparkle(t, g=0.18):
    for i, m in enumerate([96, 100, 103, 108]):
        put(fx, glock(m2f(m), vel=0.4, r=r, dur=0.5), t + i * 0.05, g)

put(fx, whoosh(0.5, r, peak=0.15), 0.0, 0.5); pop(t_(4), 380, 0.6); sparkle(t_(10))
scribble(t_(8), 1.6)
for fr in [C["WIDE"], C["MED"], C["CU1"], C["QUOTE"], C["TWO"], C["CU2"], C["END"]]:
    put(fx, whoosh(0.35, r, peak=0.12), t_(fr) - 0.12, 0.28)
for k in range(10):  # Andrews' footsteps walking in
    put(fx, stroll_step(r, scuff=0.4), t_(C["WIDE"] + 4 + k * 10), 0.25)
pop(t_(C["tagA"]), 660, 0.35); pop(t_(C["tagS"]), 600, 0.35)
scribble(t_(C["MED"] + 4), 2.2)
for k in ["a1", "s1", "a2"]: pop(t_(C[k] - 2), 760, 0.22)
for k in range(4): put(fx, whoosh(0.45, r, peak=0.2, f_lo=500, f_hi=3000), t_(C["QUOTE"] + k * 26), 0.4)
scribble(t_(C["QUOTE"]), 3.4, 0.14)
pop(t_(C["card"]), 300, 0.3)
for k in range(5): put(fx, stroll_step(r, scuff=0.3), t_(C["TWO"] + 3 + k * 9), 0.3)
put(fx, triangle(vel=0.4, r=r, dur=0.8), t_(C["a1"] + 30), 0.25)  # "too big!" ding
sparkle(t_(C["CU2"] + 2), 0.22); sparkle(t_(C["a2"] + 30), 0.16)
bloop(t_(C["sweat"])); scribble(t_(C["END"] + 2), 1.8, 0.15)

# ---------- mix ----------
def rms(x): return np.sqrt(np.mean(x ** 2) + 1e-12)
sp = np.abs(voice) > 1e-4
v_rms = rms(voice[sp]); m_rms = rms(mus[sp] if sp.any() else mus)
g_m = v_rms / m_rms * 10 ** (-10 / 20)
# music envelope: full in cold open and tail, -10 dB under speech elsewhere (smooth)
env = np.ones(N) * g_m
k = int(t_(C["WIDE"]) * SR); env[:k] = g_m * 10 ** (5 / 20)
kt = int(t_(C["END"] + 30) * SR); env[kt:] = g_m * 10 ** (4 / 20)
from scipy.ndimage import uniform_filter1d
env = uniform_filter1d(env, int(0.3 * SR))
fade_out = np.ones(N); fo = int(0.8 * SR); fade_out[-fo:] = np.linspace(1, 0, fo)
mix_m = mus * env * fade_out
g_fx = v_rms / (rms(fx[np.abs(fx) > 1e-4]) + 1e-9) * 10 ** (-12 / 20)
mix = voice + mix_m + fx * g_fx
st = np.stack([mix, mix], 0)
L = integrated(st); st *= 10 ** ((-14 - L) / 20)
pk = np.max(np.abs(st)); lim = 10 ** (-1.6 / 20)
if pk > lim: st = np.tanh(st / lim) * lim
L2 = integrated(st); st *= 10 ** ((-14 - L2) / 20); st = np.clip(st, -lim, lim)
sf.write("public/test2_mix.wav", st.T.astype(np.float32), SR)
print(f"music vs voice {20*np.log10(rms(mix_m[sp])/v_rms):.1f} dB, LUFS {integrated(st):.1f}")
