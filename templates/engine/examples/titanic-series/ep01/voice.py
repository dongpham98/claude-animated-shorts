import os, subprocess, json, numpy as np, soundfile as sf, sys
exec(open('lines.py').read())
TT='/home/claude/claude-animated-shorts/templates/engine/project/tts/tts_timed.py'
os.environ['KOKORO_DIR']='/root/tts'
only=sys.argv[1:]
for k,(sp,sh) in N.items():
    if only and k not in only: continue
    d=f'voice/{k}'; os.makedirs(d,exist_ok=True)
    open(f'{d}/s.txt','w').write(sp+'\n'); open(f'{d}/c.txt','w').write((sh or sp)+'\n')
    subprocess.run(['python3',TT,f'{d}/s.txt',f'{d}/c.txt','am_puck','1.0',d],check=True,capture_output=True)
from kokoro_onnx import Kokoro
k=Kokoro('/root/tts/kokoro-v1.0.onnx','/root/tts/voices-v1.0.bin')
env={}
for key,(sp,v,lab) in C.items():
    if only and key not in only: continue
    a,sr=k.create(sp,voice=v,speed=1.0,lang='en-us' if v.startswith('a') else 'en-gb')
    sf.write(f'voice/{key}.wav',a,sr)
print('done')
