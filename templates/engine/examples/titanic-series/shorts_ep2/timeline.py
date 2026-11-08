# builds ../project/src/sh{A,B}_timeline.json: line starts, scenes, word timings, mouth envelopes, 1-3 word captions
import json, re, difflib, numpy as np, soundfile as sf, sys
exec(open('lines.py').read())
FPS=30
SEQ={'C':[('C01',.4,'hook'),('C02',.3,'baltic'),('C03',.3,'hand'),('C04',.45,'pocket'),('C05',.4,'chart'),('C06',.35,'deck'),('C07',.4,'back'),('C08',.45,'count'),('C09',1.8,'end')],
     'D':[('D01',.45,'hook'),('D02',.3,'cali'),('D03',.3,'pile'),('D04',.35,'cape'),('D05',.25,'mech'),('P2',.5,'reply'),('D06',.4,'evans'),('D07',.6,'berg'),('D08',.5,'off'),('D09',1.6,'end')]}
def path(k): return f'voice/{k}/voice.wav' if k[0] in 'CD' and k[1:].isdigit() else f'voice/{k}.wav'
def dur(k): a,sr=sf.read(path(k)); return len(a)/sr
def norm(x): return re.sub(r'[^a-z0-9]','',x.lower())
for name,seq in SEQ.items():
    N={**A,**B}
    t=0.25; lines={}; scenes=[]
    for key,gap,sc in seq:
        d=dur(key); a=round(t*FPS); lines[key]={'start':a,'dur':round(d*FPS)}
        if not scenes or scenes[-1]['name']!=sc: scenes.append({'name':sc,'a':a-(3 if scenes else 0)})
        t+=d+gap
    total=round(t*FPS)
    for i,s in enumerate(scenes): s['b']=scenes[i+1]['a'] if i+1<len(scenes) else total
    scenes[0]['a']=0
    words={k:json.load(open(f'voice/{k}/words.json')) for k in lines if k in N}
    env={}
    for k in lines:
        if k in N: continue
        a,sr=sf.read(path(k)); a=a if a.ndim==1 else a.mean(1); hop=sr//FPS
        e=[float(np.sqrt(np.mean(a[i*hop:(i+1)*hop]**2))) for i in range(len(a)//hop)]; m=max(e) or 1
        env[k]=[round(min(1,x/m*1.3),3) for x in e]
    caps=[]
    for k,ws in words.items():
        off=lines[k]['start']; sh=(N[k][1] or N[k][0]).split(); sp=[x['word'] for x in ws]
        sm=difflib.SequenceMatcher(a=[norm(x) for x in sp], b=[norm(x) for x in sh], autojunk=False); toks=[]
        for op,a0,a1,b0,b1 in sm.get_opcodes():
            if op=='equal':
                for i in range(a1-a0): toks.append((sh[b0+i], ws[a0+i]['start'], ws[a0+i]['end']))
            elif a1>a0 and b1>b0: toks.append((' '.join(sh[b0:b1]), ws[a0]['start'], ws[a1-1]['end']))
            elif a1>a0:
                for i in range(a0,a1): toks.append((sp[i], ws[i]['start'], ws[i]['end']))
            elif toks: t0=toks[-1]; toks[-1]=(t0[0]+' '+' '.join(sh[b0:b1]), t0[1], t0[2])
        cur=[]
        def flush():
            global cur
            if cur: caps.append({'text':' '.join(x[0] for x in cur),'a':off+round(cur[0][1]*FPS)-1,'b':off+round(cur[-1][2]*FPS)+3}); cur=[]
        for tk in toks:
            cur.append(tk)
            short=len(re.sub(r'\W','',tk[0]))<=3
            if re.search(r"[.,:!?][\"”]?$", tk[0]) or (len(cur)>=3) or (len(cur)>=2 and not short): flush()
        flush()
    caps.sort(key=lambda c:c['a'])
    for i in range(len(caps)-1):
        if caps[i+1]['a']<=caps[i]['b']: caps[i]['b']=caps[i+1]['a']-1
    json.dump({'total':total,'lines':lines,'scenes':scenes,'words':{k:[{'w':x['word'],'s':x['start'],'e':x['end']} for x in v] for k,v in words.items()},'env':env,'caps':caps},open(f'../project/src/sh{name}_timeline.json','w'))
    print(name,total,round(total/FPS,1),'caps',len(caps))
    for s in scenes: print(f"  {s['name']:9} {s['a']:5} {s['b']:5} {round((s['b']-s['a'])/FPS,1)}")
    print('  ', ' | '.join(c['text'] for c in caps[:18]))
