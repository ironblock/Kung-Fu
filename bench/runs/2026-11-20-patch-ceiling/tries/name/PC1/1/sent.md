I'm working on a small app in /home/dev/5b6c8b/app. It is plain TypeScript and uses no library. I need one change to one of its files.

# Find the cheapest day to start a hire

Customers with loose dates ask me which day to start on to pay the least. I want a function for that in `src/tariff.ts`:

```ts
export function cheapestStart(boatClass: BoatClass, nights: number, fromDay: number, toDay: number): number
```

It tries each start day from `fromDay` to `toDay`, both of them included. It returns the start day on which a hire of that boat class and that many nights, with no pets, has the lowest quoted total. When several start days share the lowest total, it returns the earliest of them.

`nights` is a whole number, one or more, and `fromDay` is never after `toDay`. The days may run past the end of the year, as a hire's start day may. Return the day as it was given, not brought back into the year.

Please keep every change inside /home/dev/5b6c8b/app.

You cannot open files or run anything from where you are. All you have of the file is its path: app/src/tariff.ts.

Reply with your change as edits. Each edit is a line 'EDIT: app/<path>' followed by one fenced block of this form:

```
<<<<<<< SEARCH
text that is in the file now, copied exactly
=======
the text to put in its place
>>>>>>> REPLACE
```

The SEARCH text must be found in the file exactly once, or that edit is refused. The edits are applied in the order you give them. An edit with nothing between SEARCH and ======= adds its text at the end of the file. To write a whole file instead, give a line 'FILE: app/<path>' followed by its whole content in one fenced block. After the edits, tell me in a sentence or two what you did, and say if there was anything you were not sure of.
