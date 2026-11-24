I'm working on a small app in /home/dev/b2459d/app. It is plain TypeScript and uses no library. I need one change to one of its files.

# Keep a reissued notice in its place on the register

In `src/stoppages.ts`, `issue` treats a notice issued again under a reference that is already on the register as a new notice, and puts it on top. The office reissues a notice when it corrects one, and a corrected notice should not start to overrule the notices that were issued after it.

Please change `issue` so that a reissued notice takes the place of the old notice with its reference: the notice it is given stands where the old one stood, and the old one is gone. Every other notice keeps its place. This holds whatever stretch the new notice is for.

A notice whose reference is not on the register still goes on top, as now. Nothing else about `issue` should change: a notice it refuses now, it still refuses in the same way, and then the register is left as it was.

Please keep every change inside /home/dev/b2459d/app.

You cannot open files or run anything from where you are. All you have of the file is its path: app/src/stoppages.ts.

Reply with your change as edits. Each edit is a line 'EDIT: app/<path>' followed by one fenced block of this form:

```
<<<<<<< SEARCH
text that is in the file now, copied exactly
=======
the text to put in its place
>>>>>>> REPLACE
```

The SEARCH text must be found in the file exactly once, or that edit is refused. The edits are applied in the order you give them. An edit with nothing between SEARCH and ======= adds its text at the end of the file. To write a whole file instead, give a line 'FILE: app/<path>' followed by its whole content in one fenced block. After the edits, tell me in a sentence or two what you did, and say if there was anything you were not sure of.
