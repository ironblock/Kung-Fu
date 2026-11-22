I'm working on a small app in /home/dev/da4b10/app. It is plain TypeScript and uses no library. I need one change to one of its files.

# Keep gear of different weights apart

When the same thing is put in the same place twice, the manifest folds the two into one row and keeps the first unit weight. That hides weight: a 13.5 kg gas bottle and a 15 kg one come out as two bottles at 13.5 kg.

Please change `Manifest.addLoad` in `src/manifest.ts`. A new item is folded into a row only when that row has the same unit weight as well as the same thing in the same place. When no row matches in all three, the item becomes a row of its own, after the rows already there.

Everything else about adding load stays as it is: what is refused, how a label is tidied and matched, and what is given back.

Please keep every change inside /home/dev/da4b10/app.

You cannot open files or run anything from where you are. All you have of the file is its path: app/src/manifest.ts.

Reply with your change as edits. Each edit is a line 'EDIT: app/<path>' followed by one fenced block of this form:

```
<<<<<<< SEARCH
text that is in the file now, copied exactly
=======
the text to put in its place
>>>>>>> REPLACE
```

The SEARCH text must be found in the file exactly once, or that edit is refused. The edits are applied in the order you give them. An edit with nothing between SEARCH and ======= adds its text at the end of the file. To write a whole file instead, give a line 'FILE: app/<path>' followed by its whole content in one fenced block. After the edits, tell me in a sentence or two what you did, and say if there was anything you were not sure of.
