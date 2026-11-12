exec(open('lines.py').read())
order=['N01','N02','F1','O1','N03','N04','N05','N06','N07','N08','N09','N10','N11','M1','N12','N13','N14','N15','N16','N17','N18','S1','M2',
'N19','N20','N21','G1','N22','N23','N24','N25','K1','N26','J1','N27','N28','N29','N30','N31','N32','N33','N34','N35','N36',
'N37','N38','N39','N40','N41','B1','N42','N43','T1','N44','N45','N46','N47','N48','N49','N50']
out=["# Episode 3 \"The Iceberg\": SCRIPT v2 (12 Nov 2026, after independent fact check — see FACTCHECK.md)\n","Narrator am_puck 0.92. Character lines in their own voices (speech bubbles, labelled on screen).\n"]
heads={'N01':'Cold open','N05':'Part 1: Less than a minute','N19':'Part 2: Ice for this','N25':'Part 3: Six compartments','N37':'Part 4: CQD','N45':'Part 5: The first boat'}
wc=0
for k in order:
    if k in heads: out.append(f"\n## {heads[k]}\n")
    if k in N: out.append(f"- **{k}** {N[k][0]}"); wc+=len(N[k][0].split())
    else: out.append(f"- **{k}** [{C[k][1]}] \"{C[k][0]}\" — *{C[k][2]}*"); wc+=len(C[k][0].split())
out.append(f"\nWord count: {wc}\n")
open('SCRIPT.md','w').write('\n'.join(out)); print(wc)
