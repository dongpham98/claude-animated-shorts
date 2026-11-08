# builds ../project/src/ep2_timeline.json (scenes, lines, words, mouth envelopes, 2-4 word captions)
import json, re, difflib, numpy as np, soundfile as sf
exec(open('lines.py').read())
FPS=30
seq=[('N01',.3,'cold'),('N02',.3,'cold'),('N03',.5,'cold2'),('N04',.6,'cold2'),('N05',.4,'cold3'),
 (('P',2.6),0,'title'),
 ('N06',.3,'leave'),('N07',.2,'radio'),('N08',.15,'radio'),('P1',.3,'radio'),('N09',.4,'radio'),
 ('N10',.3,'mech'),('N11',.3,'mech'),('N12',.4,'mech2'),('N13',.2,'money'),('N14',.4,'money'),('N15',.5,'money2'),
 (('P',1.8),0,'ch_life'),('N16',.2,'bear'),('N17',.2,'bear'),('D1',.3,'bear'),('N18',.4,'bear2'),('N19',.3,'gym'),('N19b',.4,'astor'),
 ('N20',.4,'nav'),('N21',.4,'third'),('N22',.2,'andrews'),('N22b',.5,'andrews'),
 (('P',1.8),0,'ch_fire'),('N23',.25,'fire'),('N24',.3,'fire'),('F1',.3,'fire'),('N25',.3,'fire2'),('N26',.5,'fire2'),
 ('N26b',.3,'cape'),('N26c',.5,'cape'),('N27',.3,'runs'),('N28',.3,'runs'),('N29',.5,'runs2'),
 ('N30',.3,'broke'),('N31',.2,'broke'),('B1',.3,'broke'),('N32',.6,'broke2'),
 (('P',1.8),0,'ch_sunday'),('N33',.4,'sunday'),('N34',.15,'w1'),('S1',.5,'w1'),('N35',.3,'w2'),('N36',.5,'w2b'),('N37',.5,'w3'),
 ('N38',.4,'corner'),('N39',.4,'w2c'),('N40',.4,'w4'),('N41',.3,'dinner'),('N41b',.5,'dinner2'),('N45b',.4,'hymn'),
 ('N42',.2,'bridge'),('L1',.5,'bridge'),('N43',.4,'calm'),('N44',.15,'bridge2'),('S2',.4,'bridge2'),('N45',.5,'nest'),
 ('N46',.3,'w5'),('N47',.5,'w5b'),('N45c',.4,'hymnend'),('N48',.2,'w6'),('N49',.2,'w6b'),('P2',.4,'w6b'),('N50',.6,'evans'),
 ('N51',.5,'count'),('N52',.4,'count'),('N53',.3,'end'),('N54',.4,'end2'),('N55',1.2,'end3'),('N56',.4,'next'),('N57',2.0,'final')]
def path(k): return f'voice/{k}/voice.wav' if k in N else f'voice/{k}.wav'
def dur(k): a,sr=sf.read(path(k)); return len(a)/sr
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
words={k:json.load(open(f'voice/{k}/words.json')) for k in lines if k in N}
env={}
for k in lines:
    if k in N: continue
    a,sr=sf.read(path(k)); a=a if a.ndim==1 else a.mean(1); hop=sr//FPS
    e=[float(np.sqrt(np.mean(a[i*hop:(i+1)*hop]**2))) for i in range(len(a)//hop)]; m=max(e) or 1; env[k]=[round(min(1,x/m*1.3),3) for x in e]
def norm(x): return re.sub(r'[^a-z0-9]','',x.lower())
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
        if cur: caps.append({'text':' '.join(x[0] for x in cur),'a':off+round(cur[0][1]*FPS)-1,'b':off+round(cur[-1][2]*FPS)+4}); cur=[]
    for tk in toks:
        cur.append(tk)
        if re.search(r"[.,:!?][\"”]?$", tk[0]) or len(cur)>=4: flush()
    flush()
caps.sort(key=lambda c:c['a'])
for i in range(len(caps)-1):
    if caps[i+1]['a']<=caps[i]['b']: caps[i]['b']=caps[i+1]['a']-1
json.dump({'total':total,'lines':lines,'scenes':scenes,'words':{k:[{'w':x['word'],'s':x['start'],'e':x['end']} for x in v] for k,v in words.items()},'env':env,'caps':caps},open('../project/src/ep2_timeline.json','w'))
json.dump(seq,open('seq.json','w'))
print(total, round(total/FPS,1), 'min', round(total/FPS/60,2))
for s in scenes: print(f"{s['name']:10} {s['a']:6} {s['b']:6} {round((s['b']-s['a'])/FPS,1)}")
