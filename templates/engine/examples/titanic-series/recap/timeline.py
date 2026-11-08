import json, soundfile as sf
FPS=30
def dur(k):
    p = f'voice/{k}/voice.wav' if k.startswith('N') else f'voice/{k}.wav'
    a,sr=sf.read(p); return len(a)/sr
w=json.load(open('voice/N15/words.json'))
if not any(x['word']=='sooner.' for x in w):
    i=[x['word'] for x in w].index('iceberg'); nxt=w[i+1]
    w.insert(i+1,{'word':'sooner.','start':w[i]['end']+0.03,'end':max(w[i]['end']+0.3,nxt['start']-0.2),'line':w[i].get('line',1)})
    json.dump(w,open('voice/N15/words.json','w'),indent=1)
seq = [
 ('N01',.3,'cold'),('N02',.4,'cold'),('N03',.3,'cold'),('N04',.5,'cold'),
 (('PAUSE',2.3),0,'title'),
 ('N05',.3,'depart'),('N06',.4,'depart'),('N07',.25,'who'),('N08',.25,'who'),('N09',.25,'who'),('N10',.4,'who'),('N11',.5,'map1'),
 ('N12',.5,'card1'),('N13',.3,'nest'),('N14',.3,'key'),('N15',.4,'quote1'),('N16',.6,'nest2'),
 ('N17',.5,'card2'),('N18',.2,'radio'),('N19',.3,'radio'),('N20',.3,'radio'),('N21',.1,'radio'),('P1',.3,'radio'),('N22',.6,'remember'),
 ('N23',.5,'card3'),('N24',.1,'nest3'),('F1',.2,'nest3'),('N25',.1,'bridge'),('M1',.2,'bridge'),('N26',.2,'turn'),('N27',.4,'hit'),('N28',.6,'andrews'),
 ('N29',.5,'card4'),('N30',.2,'law'),('N31',.3,'law'),('N32',.3,'seats'),('N33',.6,'boat7'),
 ('N34',.5,'card5'),('N35',.3,'bunk'),('N36',.2,'calls'),('N37',.3,'rockets'),('N38',.8,'map2'),
 ('N39',1.0,'sink'),('N40',.4,'band'),('N41',1.4,'empty'),('N42',.5,'dawn'),
 ('N43',.3,'rules'),('N44',.4,'rules'),('N45',.5,'final'),('N46',2.5,'final'),
]
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
json.dump({'total':total,'lines':lines,'scenes':scenes,'words':{k:[{'w':x['word'],'s':x['start'],'e':x['end']} for x in v] for k,v in words.items()}},open('../src/timeline.json','w'))
print(total, round(total/FPS,1))
for s in scenes: print(s['name'], s['a'], s['b'], round((s['b']-s['a'])/FPS,1))
