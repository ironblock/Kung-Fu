#!/usr/bin/env python3
"""Every comparison the three runs' notes give, asked again four ways.

    python3 allpairs.py > allpairs.txt

Written on 2026-11-20 by an agent that checked this folder's note, and kept as it wrote it but for the paths.
The four ways: the kept grades; the grades by the checks now; "carried" (now, with a try that fails only by
words its ask gained later kept as a pass); and "close" (carried, with the tries two judges of three called
wrong kept as passes too). Each pair is asked with box.py's rule from a fresh stream of the same seed, as
the effort ladder's ladder.py asks it, so an interval here can differ by 0.02 from regrade.py's, which draws
all pairs of a run from one stream as box.py compare does. Then the same for each kind of task with eight
tasks or more, as the ladder's note does.
"""
import sys, os, json, glob, random
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', '..'))
import box
R = os.path.join(HERE, '..') + os.sep
RG=R+'2026-11-19-camera-regrade/'
sorts=json.load(open(RG+'sorts.json'))['tries']
SEED=20261115
runs={'2026-11-16-small-screen':['names-27b','union-27b','names-flash','union-flash'],
      '2026-11-17-effort-ladder':['names-off','union-off','names-low','union-low','union-low-b'],
      '2026-11-18-mended-notes':['mended-low']}
arms={}
for run,al in runs.items():
    now=json.load(open(RG+'now/'+run+'.json'))
    for arm in al:
        t={}
        for p in glob.glob(R+run+'/tries/'+arm+'/*/*/grade.json'):
            d=os.path.dirname(p); task,n=d.split('/')[-2:]
            rec=json.load(open(d+'/record.json'))
            cut=bool(rec.get('cut off by its length limit'))
            kept=bool(json.load(open(p))['passed']) and not cut
            key=f'{arm}/{task}/{n}'
            nw=bool(now[key]['now']) and not cut if key in now else kept
            s=sorts.get(f'{run}/{key}',{}).get('sort','')
            carried = nw or s=='only by the new words'
            close = carried or 'two judges' in s
            t.setdefault(task,[]).append((int(n),kept,nw,carried,close))
        arms[arm]={k:sorted(v) for k,v in t.items()}
judged=json.load(open(R+'2026-11-15-camera-notes/coverage/judged.json'))
kinds={}
for task in sorted(arms['union-low']): kinds.setdefault(judged[task]['kind'],[]).append(task)
pairs=[('union-low','union-low-b'),('union-low','union-27b'),('union-off','union-27b'),('union-low','names-low'),('union-off','names-off'),('union-27b','names-27b'),('names-low','names-27b'),('names-off','names-27b'),('union-flash','names-flash'),('union-27b','names-flash'),('mended-low','union-low'),('mended-low','union-low-b')]
ways=['kept','now','carried','close']
def ask(x,y,w,only=None):
    side=lambda a:{t:[r[w+1] for r in v] for t,v in arms[a].items() if only is None or t in only}
    m,lo,hi,ans,up,dn=box.passes_rule(side(x),side(y),random.Random(SEED),0.25)
    return f'{m:+.2f} ({lo:+.2f} to {hi:+.2f}) {up}/{dn}: {ans}'
for x,y in pairs:
    print(x,'against',y)
    for w,name in enumerate(ways): print('   ',name,ask(x,y,w))
for kind,names in kinds.items():
    print('KIND',kind,len(names),names)
    if len(names)<8: 
        for a in ['union-low','union-27b','names-low','union-off','names-off','names-27b']:
            print('    ',a,[sum(r[w+1] for t in names for r in arms[a][t]) for w in range(4)])
        continue
    for x,y in [('union-low','union-27b'),('union-off','union-27b'),('union-low','names-low'),('union-off','names-off'),('union-27b','names-27b')]:
        print('  ',x,'against',y)
        for w,name in enumerate(ways): print('      ',name,ask(x,y,w,set(names)))
for a in arms: print(a,[sum(r[w+1] for v in arms[a].values() for r in v) for w in range(4)], sum(len(v) for v in arms[a].values()))
