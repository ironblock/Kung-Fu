I'm working on a small app in /home/dev/b16d59/app. It is plain TypeScript and uses no library. I need one change to one of its files.

# Say on the board when a stoppage ends

Hirers at the counter ask when a stoppage ends, and the board line that `describe` in `src/stoppages.ts` writes only says when it starts. Please add the end to the line of every notice that has an end date.

The line should then read like this:

    S-104 Hollin Flight: closed from day 120, last day 131 (planned works)

That is, `, last day N` goes straight after the first day and before the cause in brackets, where N is the last day on which the notice is still in force. A restriction gets the same addition after its first day. A notice with no end date keeps the line it has now.

Please keep every change inside /home/dev/b16d59/app.

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
