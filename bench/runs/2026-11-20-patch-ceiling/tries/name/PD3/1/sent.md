I'm working on a small app in /home/dev/b93b4d/app. It is plain TypeScript and uses no library. I need one change to one of its files.

# Join a split draw

When the pump cuts out half way through a fill, the boat's fuel gets entered as two draws, and the ledger shows two entries for one visit. I want `recordDraw` in `src/fuel.ts` changed so that it joins them. Look at the entry that was posted last in the ledger, whatever its kind. If it is a draw by the same boat on the same day, add the new volume to that entry and return that entry; do not post a second one. The joined entry keeps the minute it had. In every other case, and when the ledger has no entries yet, post a new entry as now. A volume that is refused now is still refused, and then nothing in the ledger changes.

Please keep every change inside /home/dev/b93b4d/app.

You cannot open files or run anything from where you are. All you have of the file is its path: app/src/fuel.ts.

Reply with your change as edits. Each edit is a line 'EDIT: app/<path>' followed by one fenced block of this form:

```
<<<<<<< SEARCH
text that is in the file now, copied exactly
=======
the text to put in its place
>>>>>>> REPLACE
```

The SEARCH text must be found in the file exactly once, or that edit is refused. The edits are applied in the order you give them. An edit with nothing between SEARCH and ======= adds its text at the end of the file. To write a whole file instead, give a line 'FILE: app/<path>' followed by its whole content in one fenced block. After the edits, tell me in a sentence or two what you did, and say if there was anything you were not sure of.
