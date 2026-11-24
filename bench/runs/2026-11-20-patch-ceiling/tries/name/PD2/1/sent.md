I'm working on a small app in /home/dev/eeaa58/app. It is plain TypeScript and uses no library. I need one change to one of its files.

# One bill line a day

A boat that fills up twice in one day gets two lines on its fuel bill, and each line is rounded up to the penny on its own. I want `boatBill` in `src/fuel.ts` changed so that the bill has one line for each day the boat drew. A day's line has the sum of that day's draws as its volume, and its pence is charged once, on that sum, at the day's price. The lines are in day order, earliest day first, whatever order the draws were entered in. The bill's volume and its total are the sums over its lines, as they are now. Nothing else about a bill changes: it covers the same days, it holds only that boat's draws, and a day with no price is refused as it is now.

Please keep every change inside /home/dev/eeaa58/app.

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
