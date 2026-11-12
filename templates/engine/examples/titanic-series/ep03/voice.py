import os, subprocess, sys, soundfile as sf
exec(open('lines.py').read())
TT='/home/claude/work/templates/engine/project/tts/tts_timed.py'; os.environ['KOKORO_DIR']='/root/tts'
SPEED=os.environ.get('SPEED','0.92'); only=sys.argv[1:]
for k,(sp,sh) in N.items():
    if only and k not in only: continue
    d=f'voice/{k}'; os.makedirs(d,exist_ok=True)
    open(f'{d}/s.txt','w').write(sp+'\n'); open(f'{d}/c.txt','w').write((sh or sp)+'\n')
    subprocess.run(['python3',TT,f'{d}/s.txt',f'{d}/c.txt','am_puck',SPEED,d],check=True,capture_output=True)
from kokoro_onnx import Kokoro
k=Kokoro('/root/tts/kokoro-v1.0.onnx','/root/tts/voices-v1.0.bin')
for key,(sp,v,lab) in C.items():
    if only and key not in only: continue
    a,sr=k.create(sp,voice=v,speed=1.0,lang='en-us' if v.startswith('a') else 'en-gb'); sf.write(f'voice/{key}.wav',a,sr)
print('done')
