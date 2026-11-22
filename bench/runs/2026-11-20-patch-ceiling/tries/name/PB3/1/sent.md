I'm working on a small app in /home/dev/81bfcf/app. It is plain TypeScript and uses no library. I need one change to one of its files.

# No plan when the lock is done for the day

`planDeparture` in `src/tides.ts` always hands back a plan. When there is no time left that day at which the boat could go into the lock, the plan it hands back is nonsense: its times mean nothing, and the hire desk has printed one of them on a customer's sheet.

Please make it return `null` in that case, and change its return type to say so. Whenever the boat can still go into the lock that day, the plan must be exactly what it is now.

Please keep every change inside /home/dev/81bfcf/app.

You cannot open files or run anything from where you are. All you have of the file is its path: app/src/tides.ts.

Reply with your change as edits. Each edit is a line 'EDIT: app/<path>' followed by one fenced block of this form:

```
<<<<<<< SEARCH
text that is in the file now, copied exactly
=======
the text to put in its place
>>>>>>> REPLACE
```

The SEARCH text must be found in the file exactly once, or that edit is refused. The edits are applied in the order you give them. An edit with nothing between SEARCH and ======= adds its text at the end of the file. To write a whole file instead, give a line 'FILE: app/<path>' followed by its whole content in one fenced block. After the edits, tell me in a sentence or two what you did, and say if there was anything you were not sure of.
