I'm working on a small app in /home/dev/96fcc8/app. It is plain TypeScript and uses no library. I need one change to one of its files.

# Charge the first week of a long stay in full

`stayFee` in `src/moorings.ts` takes the long-stay discount off the whole bill as soon as a stay is long enough. That gives too much away.

From now on I want the first seven nights of every stay charged in full, and the discount taken off the later nights only. Take the total for the nights after the seventh, work the discount out once on that total, at the rate it has now and rounded the way it is rounded now, and take it off the bill. So a stay of seven nights or fewer gets no discount at all.

Everything else about the fee stays as it is.

Please keep every change inside /home/dev/96fcc8/app.

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
