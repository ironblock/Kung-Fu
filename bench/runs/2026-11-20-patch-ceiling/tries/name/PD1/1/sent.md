I'm working on a small app in /home/dev/0a8074/app. It is plain TypeScript and uses no library. I need one change to one of its files.

# Fuel drawn by each boat

For the monthly meeting I need a table of which boats used the diesel over a run of days. Please add this function to `src/fuel.ts`:

```ts
export function usageByBoat(ledger: Ledger, fromDay: number, toDay: number): Array<[string, number]>
```

It gives one pair for each boat that has a draw on a day from `fromDay` up to but not including `toDay`: the boat's name, then the sum of the volumes of those draws. Only entries whose kind is `"draw"` count. The yard's own draws, the ones whose boat is `YARD`, are left out. The pairs are sorted by volume, largest first, and boats with the same volume are in name order, A before B. A boat with no draw in those days has no pair, and when there are none at all the result is an empty array. The function only reads the ledger and changes nothing in it.

Please keep every change inside /home/dev/0a8074/app.

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
