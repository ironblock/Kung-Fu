I'm working on a small app in /home/dev/f4bd6d/app. It is plain TypeScript and uses no library. I need one change to one of its files.

# A bigger discount for a fortnight or more

In `src/bookings.ts`, `hireCharge` gives a long hire a discount. I want that discount to come in two steps.

A hire of 14 nights or more gets 15 per cent off where it gets a tenth off today. Hires shorter than 14 nights are charged exactly as they are today: those that get a tenth off keep it, and those that get no discount still get none.

The 15 per cent is worked out on the same sum as today's tenth, and it is rounded in the same way. Nothing else about the charge changes.

Please keep every change inside /home/dev/f4bd6d/app.

You cannot open files or run anything from where you are. All you have of the file is its path: app/src/bookings.ts.

Reply with your change as edits. Each edit is a line 'EDIT: app/<path>' followed by one fenced block of this form:

```
<<<<<<< SEARCH
text that is in the file now, copied exactly
=======
the text to put in its place
>>>>>>> REPLACE
```

The SEARCH text must be found in the file exactly once, or that edit is refused. The edits are applied in the order you give them. An edit with nothing between SEARCH and ======= adds its text at the end of the file. To write a whole file instead, give a line 'FILE: app/<path>' followed by its whole content in one fenced block. After the edits, tell me in a sentence or two what you did, and say if there was anything you were not sure of.
