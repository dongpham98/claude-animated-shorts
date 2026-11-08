# Mix the three vertical Shorts from the long video's stems: music capped at -10 dB vs the voice (gated RMS over the
# segment; the long video's -6 dB was too loud in its first half), SFX as in the long mix, -14 LUFS, true peak <= -1 dBTP.
import sys, os, subprocess, numpy as np
sys.path.insert(0, "/home/claude/channel/02-titanic/titanic-pilot/audio/lib")
from dsp import integrated, true_peak, write_wav, dbg, fades
SR = 48000
v, m, x = (np.load(f"stems/{k}.npy").astype(np.float64) for k in ("voice", "music", "sfx"))
def grms(a):
    y = a.mean(axis=0); blk = SR // 10; n = len(y) // blk
    r = np.sqrt((y[: n * blk].reshape(n, blk) ** 2).mean(1)); keep = r[r > r.max() * 10 ** (-30 / 20)]
    return float(np.sqrt((keep ** 2).mean())) if keep.size else 1e-9
SH = {"rules": (8742, 10520), "oneback": (14702, 16348), "law": (1049, 3328)}
out = "/home/claude/rem/public"
for k, (a, b) in SH.items():
    s = slice(a * SR // 30, b * SR // 30)
    vv, mm, xx = v[:, s], m[:, s], x[:, s]
    mr = np.sqrt((mm.mean(0) ** 2).mean()) / grms(vv)
    g = min(1.0, dbg(-10.0) / max(mr, 1e-9))
    mix = vv + mm * g + xx
    mix *= dbg(-14.0 - integrated(mix))
    c = dbg(-2.0)
    mix = np.where(np.abs(mix) > c * 0.85, np.sign(mix) * (c * 0.85 + (c * 0.15) * np.tanh((np.abs(mix) - c * 0.85) / (c * 0.15))), mix)
    mix = fades(mix, 0.01, 0.35)
    wav = f"/tmp/short_{k}.wav"; write_wav(wav, mix)
    print(f"{k}: {(b-a)/30:.2f} s, music was {20*np.log10(mr):+.1f} dB -> {20*np.log10(mr*g):+.1f} dB, {integrated(mix):.1f} LUFS, TP {true_peak(mix):.2f}")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", wav, "-af", "volume=0.5dB,alimiter=limit=0.63:level=false", "-c:a", "aac", "-b:a", "256k", f"{out}/titanic_short_{k}.m4a"], check=True)
    r = subprocess.run(["ffmpeg", "-nostats", "-i", f"{out}/titanic_short_{k}.m4a", "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr
    print("   m4a:", " ".join(l.strip() for l in r.splitlines()[-12:] if "I:" in l or "Peak:" in l))
