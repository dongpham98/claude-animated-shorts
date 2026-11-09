import os, subprocess, shutil
exec(open('lines.py').read())
TT='/home/claude/claude-animated-shorts/templates/engine/project/tts/tts_timed.py'; os.environ['KOKORO_DIR']='/root/tts'
for k,(sp,sh) in E.items():
    d=f'voice/{k}'; os.makedirs(d,exist_ok=True)
    open(f'{d}/s.txt','w').write(sp+'\n'); open(f'{d}/c.txt','w').write((sh or sp)+'\n')
    subprocess.run(['python3',TT,f'{d}/s.txt',f'{d}/c.txt','am_puck','1.22',d],check=True,capture_output=True)
for k,(t,v,s) in C.items():
    d=f'voice/{k}'; os.makedirs(d,exist_ok=True); open(f'{d}/s.txt','w').write(t+'\n')
    subprocess.run(['python3',TT,f'{d}/s.txt',f'{d}/s.txt',v,s,d],check=True,capture_output=True)
    shutil.copy(f'{d}/voice.wav', f'voice/{k}.wav')
print('done')
