I'm working on a small app in /home/dev/066cac/app. It is plain TypeScript and uses no library. I need one change to one of its files.

# Find the cheapest day to start a hire

Customers with loose dates ask me which day to start on to pay the least. I want a function for that in `src/tariff.ts`:

```ts
export function cheapestStart(boatClass: BoatClass, nights: number, fromDay: number, toDay: number): number
```

It tries each start day from `fromDay` to `toDay`, both of them included. It returns the start day on which a hire of that boat class and that many nights, with no pets, has the lowest quoted total. When several start days share the lowest total, it returns the earliest of them.

`nights` is a whole number, one or more, and `fromDay` is never after `toDay`. The days may run past the end of the year, as a hire's start day may. Return the day as it was given, not brought back into the year.

Please keep every change inside /home/dev/066cac/app.
