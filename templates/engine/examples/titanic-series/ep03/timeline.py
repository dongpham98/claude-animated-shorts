# builds ../project/src/ep3_timeline.json (scenes, lines, words, mouth envelopes, 2-4 word captions)
import json, re, difflib, numpy as np, soundfile as sf
exec(open('lines.py').read())
FPS=30
seq=[('N01',.25,'bell'),('N02',.15,'phone'),('F1',.25,'phone'),('O1',.6,'thanks'),('N03',.5,'hook'),('N04',.5,'hook2'),
 (('P',2.6),0,'title'),
 (('P',1.8),0,'ch1'),('N05',.3,'rewind'),('N06',.4,'rewind2'),('N07',.3,'nest'),('N08',.4,'nest2'),('N09',.4,'moody'),
 ('N10',.6,'film1'),('N11',.15,'order'),('M1',.4,'order'),('N12',.5,'tiller'),('N13',.4,'wheel'),('N14',.5,'clock37'),
 ('N15',.3,'turn'),('N16',.4,'hit'),('N17',.4,'rowe'),('N18',.2,'doors'),('S1',.2,'doors2'),('M2',.6,'doors2'),
 (('P',1.8),0,'ch2'),('N19',.4,'beesley'),('N20',.4,'steam'),('N21',.2,'smoke'),('G1',.4,'smoke'),('N22',.5,'icedeck'),
 ('N23',.3,'mail'),('N24',.5,'mail2'),
 (('P',1.8),0,'ch3'),('N25',.2,'boxhall'),('K1',.3,'boxhall'),('N26',.2,'mailhold'),('J1',.4,'mailhold'),('N27',.5,'boiler6'),
 ('N28',.3,'andrews'),('N29',.5,'andrews2'),('N30',.5,'damage'),('N31',.3,'compart'),('N32',.6,'compart2'),('N33',.4,'tray'),('N34',.7,'tray2'),
 ('N35',.6,'film2'),('N36',.7,'midnight'),
 (('P',1.8),0,'ch4'),('N37',.4,'wireless'),('N38',.4,'cqd'),('N39',.3,'position'),('N40',.6,'position2'),
 ('N41',.2,'sos'),('B1',.4,'sos'),('N42',.6,'sos2'),('N43',.2,'carpathia'),('T1',.4,'carpathia2'),('N44',.6,'carpathia3'),
 (('P',1.8),0,'ch5'),('N45',.4,'boatdeck'),('N46',.5,'boatdeck2'),('N47',.7,'boat7'),('N48',.8,'quiet'),('N49',.6,'half'),('N50',2.0,'final')]
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
json.dump({'total':total,'lines':lines,'scenes':scenes,'words':{k:[{'w':x['word'],'s':x['start'],'e':x['end']} for x in v] for k,v in words.items()},'env':env,'caps':caps},open('../project/src/ep3_timeline.json','w'))
json.dump(seq,open('seq.json','w'))
print(total, round(total/FPS,1), 'min', round(total/FPS/60,2))
for s in scenes: print(f"{s['name']:10} {s['a']:6} {s['b']:6} {round((s['b']-s['a'])/FPS,1)}")
