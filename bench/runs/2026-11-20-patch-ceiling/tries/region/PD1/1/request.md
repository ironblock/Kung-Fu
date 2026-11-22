I'm working on a small app in /home/dev/351999/app. It is plain TypeScript and uses no library. I need one change to one of its files.

# Fuel drawn by each boat

For the monthly meeting I need a table of which boats used the diesel over a run of days. Please add this function to `src/fuel.ts`:

```ts
export function usageByBoat(ledger: Ledger, fromDay: number, toDay: number): Array<[string, number]>
```

It gives one pair for each boat that has a draw on a day from `fromDay` up to but not including `toDay`: the boat's name, then the sum of the volumes of those draws. Only entries whose kind is `"draw"` count. The yard's own draws, the ones whose boat is `YARD`, are left out. The pairs are sorted by volume, largest first, and boats with the same volume are in name order, A before B. A boat with no draw in those days has no pair, and when there are none at all the result is an empty array. The function only reads the ledger and changes nothing in it.

Please keep every change inside /home/dev/351999/app.
