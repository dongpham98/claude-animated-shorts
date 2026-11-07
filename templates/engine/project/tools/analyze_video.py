# QA + pacing analysis of a rendered video: hard picture changes, near-still spans, frame-difference stats.
# usage: python3 tools/analyze_video.py <video.mp4>   (needs ffmpeg + numpy). Also run final/finish.sh-style checks:
#   ffmpeg -vf freezedetect=n=0.002:d=0.4 ; -vf blackdetect=d=0.05:pix_th=0.08 ; -af ebur128=peak=true
import subprocess, sys, numpy as np
v = sys.argv[1]
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", v, "-vf", "scale=90:160,format=gray", "-f", "rawvideo", "-"], capture_output=True).stdout
a = np.frombuffer(raw, np.uint8).reshape(-1, 160, 90).astype(float)
d = np.abs(np.diff(a, axis=0)).mean(axis=(1, 2))
print("frames", len(a))
print("hard picture changes (diff>18):", int((d > 18).sum()))
runs, s = [], None
for i, x in enumerate(d < 0.35):
    if x and s is None: s = i
    if not x and s is not None:
        if i - s >= 4: runs.append((s, i - s))
        s = None
print("near-still spans >= 4 frames (start, length):", runs)
print("frame diff median %.2f  p10 %.2f  p90 %.2f" % (np.median(d), np.percentile(d, 10), np.percentile(d, 90)))
