I'm working on a small app in /home/dev/447347/app. It is plain TypeScript and uses no library. I need one change to one of its files.

# A Sunday allowance on a shift's pay

I want to change `shiftPayPence` in `src/rota.ts`. We now pay an allowance of 1,250 pence for a shift that starts on a Sunday, on top of what the shift pays today. The allowance is the same whatever the shift's length and whatever the rate, and I want it added after the pay has been rounded. A night shift that starts on a Saturday and ends on the Sunday morning gets no allowance. One that starts on a Sunday and ends on the Monday morning gets it. A shift that starts on any other day must pay exactly what it pays today.

Please keep every change inside /home/dev/447347/app.

You cannot open files or run anything from where you are. All you have of the file is its path: app/src/rota.ts.

Reply with your change as edits. Each edit is a line 'EDIT: app/<path>' followed by one fenced block of this form:

```
<<<<<<< SEARCH
text that is in the file now, copied exactly
=======
the text to put in its place
>>>>>>> REPLACE
```

The SEARCH text must be found in the file exactly once, or that edit is refused. The edits are applied in the order you give them. An edit with nothing between SEARCH and ======= adds its text at the end of the file. To write a whole file instead, give a line 'FILE: app/<path>' followed by its whole content in one fenced block. After the edits, tell me in a sentence or two what you did, and say if there was anything you were not sure of.
