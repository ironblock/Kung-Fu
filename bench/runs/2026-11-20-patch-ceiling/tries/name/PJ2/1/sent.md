I'm working on a small app in /home/dev/c076b3/app. It is plain TypeScript and uses no library. I need one change to one of its files.

# Lost keys and damaged lifejackets

Two rules at the desk have changed, and `gearCharge` in `src/keys.ts` must follow them.

When boat keys are lost we change the lock, and one change of lock covers every key. So a loan with any boat keys missing is charged the cost of one boat key for them, however many are missing. A loan with no boat key missing is charged nothing for missing keys, as now.

A damaged lifejacket cannot be lent again. So each damaged lifejacket is charged the full cost of a lifejacket, in place of the charge it gets now.

Everything else is charged as it is now: missing gear of the other kinds, each missing lifejacket, damaged gear of the other kinds, and each damaged boat key. The function still changes nothing in the loan.

Please keep every change inside /home/dev/c076b3/app.

You cannot open files or run anything from where you are. All you have of the file is its path: app/src/keys.ts.

Reply with your change as edits. Each edit is a line 'EDIT: app/<path>' followed by one fenced block of this form:

```
<<<<<<< SEARCH
text that is in the file now, copied exactly
=======
the text to put in its place
>>>>>>> REPLACE
```

The SEARCH text must be found in the file exactly once, or that edit is refused. The edits are applied in the order you give them. An edit with nothing between SEARCH and ======= adds its text at the end of the file. To write a whole file instead, give a line 'FILE: app/<path>' followed by its whole content in one fenced block. After the edits, tell me in a sentence or two what you did, and say if there was anything you were not sure of.
