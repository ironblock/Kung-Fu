I'm working on a small app in /home/dev/eeaa58/app. It is plain TypeScript and uses no library. I need one change to one of its files.

# One bill line a day

A boat that fills up twice in one day gets two lines on its fuel bill, and each line is rounded up to the penny on its own. I want `boatBill` in `src/fuel.ts` changed so that the bill has one line for each day the boat drew. A day's line has the sum of that day's draws as its volume, and its pence is charged once, on that sum, at the day's price. The lines are in day order, earliest day first, whatever order the draws were entered in. The bill's volume and its total are the sums over its lines, as they are now. Nothing else about a bill changes: it covers the same days, it holds only that boat's draws, and a day with no price is refused as it is now.

Please keep every change inside /home/dev/eeaa58/app.
