I'm working on a small app in /home/dev/d616d9/app. It is plain TypeScript and uses no library. I need one change to one of its files.

# Keep a reissued notice in its place on the register

In `src/stoppages.ts`, `issue` treats a notice issued again under a reference that is already on the register as a new notice, and puts it on top. The office reissues a notice when it corrects one, and a corrected notice should not start to overrule the notices that were issued after it.

Please change `issue` so that a reissued notice takes the place of the old notice with its reference: the notice it is given stands where the old one stood, and the old one is gone. Every other notice keeps its place. This holds whatever stretch the new notice is for.

A notice whose reference is not on the register still goes on top, as now. Nothing else about `issue` should change: a notice it refuses now, it still refuses in the same way, and then the register is left as it was.

Please keep every change inside /home/dev/d616d9/app.
