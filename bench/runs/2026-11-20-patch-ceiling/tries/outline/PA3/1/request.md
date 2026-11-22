I'm working on a small app in /home/dev/73531f/app. It is plain TypeScript and uses no library. I need one change to one of its files.

# Log a shift along the quay as one move

`shift` in `src/moorings.ts` moves a boat from its berth to another one. It leaves two entries in the log: one that takes the boat off the quay, and one that puts it back on. Anyone reading the log thinks the boat left the yard.

I want it to leave a single entry instead: one move for the day given, with `from` the berth the boat left and `to` the berth it went to. That entry must be logged in the same way as every other move, so that the log reads as it always has.

When the shift is refused, the log stays untouched, as now. What `shift` returns, and what it does to the berths, stay as they are.

Please keep every change inside /home/dev/73531f/app.
