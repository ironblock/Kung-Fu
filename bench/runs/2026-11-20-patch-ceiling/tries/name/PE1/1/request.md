I'm working on a small app in /home/dev/a5aae5/app. It is plain TypeScript and uses no library. I need one change to one of its files.

# Open shifts in a run of days

I need one more method on the `Rota` class in `src/rota.ts`:

```ts
openShifts(fromDay: number, toDay: number, role?: Role): Shift[]
```

I want it to return the shifts that nobody holds and that are on a day from `fromDay` up to `toDay`. `fromDay` itself counts and `toDay` does not. A shift that nobody holds has `OPEN` as its `staffId`, and the day a shift is on is its `day`. When I give a `role`, I want only the shifts of that role. The result should be in order of `day`, and within one day in order of `start`.

The method must change nothing in the rota. Please leave the rest of the file as it is.

Please keep every change inside /home/dev/a5aae5/app.
