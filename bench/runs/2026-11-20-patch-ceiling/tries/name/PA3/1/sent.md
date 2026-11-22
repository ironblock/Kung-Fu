I'm working on a small app in /home/dev/cf1344/app. It is plain TypeScript and uses no library. I need one change to one of its files.

# Log a shift along the quay as one move

`shift` in `src/moorings.ts` moves a boat from its berth to another one. It leaves two entries in the log: one that takes the boat off the quay, and one that puts it back on. Anyone reading the log thinks the boat left the yard.

I want it to leave a single entry instead: one move for the day given, with `from` the berth the boat left and `to` the berth it went to. That entry must be logged in the same way as every other move, so that the log reads as it always has.

When the shift is refused, the log stays untouched, as now. What `shift` returns, and what it does to the berths, stay as they are.

Please keep every change inside /home/dev/cf1344/app.

You cannot open files or run anything from where you are. All you have of the file is its path: app/src/moorings.ts.

Reply with your change as edits. Each edit is a line 'EDIT: app/<path>' followed by one fenced block of this form:

```
<<<<<<< SEARCH
text that is in the file now, copied exactly
=======
the text to put in its place
>>>>>>> REPLACE
```

The SEARCH text must be found in the file exactly once, or that edit is refused. The edits are applied in the order you give them. An edit with nothing between SEARCH and ======= adds its text at the end of the file. To write a whole file instead, give a line 'FILE: app/<path>' followed by its whole content in one fenced block. After the edits, tell me in a sentence or two what you did, and say if there was anything you were not sure of.
