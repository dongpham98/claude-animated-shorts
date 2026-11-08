import os, subprocess, sys, shutil
exec(open('lines.py').read())
TT='/home/claude/work/templates/engine/project/tts/tts_timed.py'; os.environ['KOKORO_DIR']='/root/tts'
SPEED=sys.argv[1] if len(sys.argv)>1 else '1.12'
for k,(sp,sh) in {**A,**B}.items():
    d=f'voice/{k}'; os.makedirs(d,exist_ok=True)
    open(f'{d}/s.txt','w').write(sp+'\n'); open(f'{d}/c.txt','w').write((sh or sp)+'\n')
    subprocess.run(['python3',TT,f'{d}/s.txt',f'{d}/c.txt','am_puck',SPEED,d],check=True,capture_output=True)
for k in C: shutil.copy(f'../ep01/voice/{k}.wav', f'voice/{k}.wav')
print('done')
