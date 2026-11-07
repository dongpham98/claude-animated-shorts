# Kokoro voice samples for choosing a narrator. usage: python3 tts/say.py <script.txt> <voice> <speed> <out.wav>
import sys, numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
import os
KD = os.path.expanduser(os.environ.get('KOKORO_DIR', '~/tts'))
k = Kokoro(os.path.join(KD, 'kokoro-v1.0.onnx'), os.path.join(KD, 'voices-v1.0.bin'))
script, voice, speed, out = sys.argv[1], sys.argv[2], float(sys.argv[3]), sys.argv[4]
lines = [l.strip() for l in open(script) if l.strip()]
parts = []
for l in lines:
    a, sr = k.create(l, voice=voice, speed=speed, lang='en-us' if voice.startswith('a') else 'en-gb')
    # trim edge silence, then a short breath gap between sentences
    idx = np.where(np.abs(a) > 0.01)[0]; a = a[max(0, idx[0]-480): idx[-1]+960]
    parts += [a, np.zeros(int(sr*0.12), np.float32)]
y = np.concatenate(parts[:-1]); y = y / np.abs(y).max() * 0.89
sf.write(out, y, sr)
w = sum(len(l.split()) for l in lines); d = len(y)/sr
print(f"{voice} speed {speed}: {d:.1f}s, {w/d:.2f} words/s")
