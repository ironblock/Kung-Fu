I'm working on a small app in /home/dev/42c2c4/app. It is plain TypeScript and uses no library. I need one change to one of its files.

# Total the parts used across the log

I need a figure for reordering stock. Please add a method to the `WorkLog` class in `src/worklog.ts`:

```ts
partsBySku(): Map<string, number>
```

It gives one entry for each part number found on the jobs it counts. The key is the `sku` of the part lines, exactly as it is stored. The value is the sum of `qty` over every line with that sku, across those jobs, whatever the unit price of the line.

Leave out the jobs whose state is `dropped`: that work was never done, and a part number found only on them has no entry. Count every other job, finished or not. A log with no parts on it gives an empty map. The method must not change the log or any of its jobs.

Please keep every change inside /home/dev/42c2c4/app.
