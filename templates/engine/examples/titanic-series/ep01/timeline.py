import json, numpy as np, soundfile as sf
FPS=30
def path(k): return f'voice/{k}/voice.wav' if k.startswith('N') else f'voice/{k}.wav'
def dur(k):
    a,sr=sf.read(path(k)); return len(a)/sr
seq=[('N01',.3,'cold'),('N02',.25,'cold'),('T1',.6,'cold'),('N03',.5,'flash'),('N04',.4,'browne'),('N05',.35,'film'),('N06',.3,'film'),
 (('P',2.2),0,'title'),
 ('N07',.3,'yard'),('N08',.3,'yard'),('N09',.15,'yard'),('A1',.3,'yard'),('N10',.5,'yard2'),('N11',.4,'launch'),('N12',.15,'fit'),('K1',.6,'fit'),
 ('N13',.3,'south'),('N14',.3,'south'),('N15',.3,'south2'),('N16',.2,'nearmiss'),('N17',.15,'nearmiss'),('G1',.3,'nearmiss'),('N18',.6,'nearmiss'),
 ('N19',.3,'classes'),('N20',.3,'classes1'),('N21',.3,'spedden'),('N22',.6,'spedden'),('N23',.3,'navratil'),('N24',.5,'navratil'),
 ('N25',.3,'classes3'),('N26',.4,'sage'),('N27',.6,'remember'),('N28',.3,'classes4'),('N29',.25,'boiler'),('N30',.15,'boiler'),('F1',.5,'boiler'),
 ('N31',.3,'radio'),('N32',.7,'radio2'),('N33',.3,'cherbourg'),('N34',.3,'cherbourg'),('N35',.15,'cherbourg'),('B1',.4,'cherbourg'),('N36',.6,'nomadic'),
 ('N37',.3,'dinner'),('N38',.15,'dinner'),('R1',.6,'dinner'),('N39',.3,'queens'),('N40',.3,'queens'),('N41',.2,'queens'),('T2',.7,'queens'),
 ('N42',.5,'leave'),('N43',.6,'leave2'),('N44',.6,'trunk'),('N45',.5,'west'),('N46',.6,'next'),('N47',2.2,'final')]
t=0.3; lines={}; scenes=[]
for item,gap,scene in seq:
    if isinstance(item,tuple): d=item[1]; key=None
    else: d=dur(item); key=item
    a=round(t*FPS)
    if key: lines[key]={'start':a,'dur':round(d*FPS)}
    if not scenes or scenes[-1]['name']!=scene: scenes.append({'name':scene,'a':a-(4 if scenes else 0)})
    t+=d+gap
total=round(t*FPS)+10
for i,s in enumerate(scenes): s['b']=scenes[i+1]['a'] if i+1<len(scenes) else total
scenes[0]['a']=0
words={k:json.load(open(f'voice/{k}/words.json')) for k in lines if k.startswith('N')}
# mouth envelopes for character lines
env={}
for k in lines:
    if k.startswith('N'): continue
    a,sr=sf.read(path(k)); a=a if a.ndim==1 else a.mean(1)
    hop=sr//FPS; e=[float(np.sqrt(np.mean(a[i*hop:(i+1)*hop]**2))) for i in range(len(a)//hop)]
    m=max(e) or 1; env[k]=[round(min(1,x/m*1.3),3) for x in e]
json.dump({'total':total,'lines':lines,'scenes':scenes,'words':{k:[{'w':x['word'],'s':x['start'],'e':x['end']} for x in v] for k,v in words.items()},'env':env},open('../src/ep1_timeline.json','w'))
json.dump(seq,open('seq.json','w'))
print(total, round(total/FPS,1))
for s in scenes: print(f"{s['name']:10} {s['a']:5} {s['b']:5} {round((s['b']-s['a'])/FPS,1)}")

# ---- captions with written numbers: align spoken words to shown text (difflib on normalised tokens)
import difflib, re
exec(open('lines.py').read())
def norm(x): return re.sub(r'[^a-z0-9]','',x.lower())
caps=[]
for k,ws in words.items():
    off=lines[k]['start']; sh=(N[k][1] or N[k][0]).split()
    sp=[x['word'] for x in ws]
    sm=difflib.SequenceMatcher(a=[norm(x) for x in sp], b=[norm(x) for x in sh], autojunk=False)
    toks=[]
    for op,a0,a1,b0,b1 in sm.get_opcodes():
        if op=='equal':
            for i in range(a1-a0): toks.append((sh[b0+i], ws[a0+i]['start'], ws[a0+i]['end']))
        elif a1>a0 and b1>b0:
            toks.append((' '.join(sh[b0:b1]), ws[a0]['start'], ws[a1-1]['end']))
        elif a1>a0:  # spoken only (rare)
            for i in range(a0,a1): toks.append((sp[i], ws[i]['start'], ws[i]['end']))
        else:        # shown only: attach to previous
            if toks: t0=toks[-1]; toks[-1]=(t0[0]+' '+' '.join(sh[b0:b1]), t0[1], t0[2])
    cur=[]
    def flush():
        global cur
        if cur: caps.append({'text':' '.join(x[0] for x in cur),'a':off+round(cur[0][1]*FPS)-1,'b':off+round(cur[-1][2]*FPS)+4}); cur=[]
    for t in toks:
        cur.append(t)
        if re.search(r"[.,:!?][\"”]?$", t[0]) or (len(cur)>=4 and not re.fullmatch(r"[0-9,]+", t[0])) or len(cur)>=6: flush()
    flush()
caps.sort(key=lambda c:c['a'])
for i in range(len(caps)-1):
    if caps[i+1]['a']<=caps[i]['b']: caps[i]['b']=caps[i+1]['a']-1
D=json.load(open('../src/ep1_timeline.json')); D['caps']=caps; json.dump(D,open('../src/ep1_timeline.json','w'))
print(len(caps), [c['text'] for c in caps if any(ch.isdigit() for ch in c['text'])][:30])
