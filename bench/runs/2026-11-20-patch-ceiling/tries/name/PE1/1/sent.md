I'm working on a small app in /home/dev/a5aae5/app. It is plain TypeScript and uses no library. I need one change to one of its files.

# Open shifts in a run of days

I need one more method on the `Rota` class in `src/rota.ts`:

```ts
openShifts(fromDay: number, toDay: number, role?: Role): Shift[]
```

I want it to return the shifts that nobody holds and that are on a day from `fromDay` up to `toDay`. `fromDay` itself counts and `toDay` does not. A shift that nobody holds has `OPEN` as its `staffId`, and the day a shift is on is its `day`. When I give a `role`, I want only the shifts of that role. The result should be in order of `day`, and within one day in order of `start`.

The method must change nothing in the rota. Please leave the rest of the file as it is.

Please keep every change inside /home/dev/a5aae5/app.

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
