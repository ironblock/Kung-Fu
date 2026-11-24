I'm working on a small app in /home/dev/3f184d/app. It is plain TypeScript and uses no library. I need one change to one of its files.

# Total the parts used across the log

I need a figure for reordering stock. Please add a method to the `WorkLog` class in `src/worklog.ts`:

```ts
partsBySku(): Map<string, number>
```

It gives one entry for each part number found on the jobs it counts. The key is the `sku` of the part lines, exactly as it is stored. The value is the sum of `qty` over every line with that sku, across those jobs, whatever the unit price of the line.

Leave out the jobs whose state is `dropped`: that work was never done, and a part number found only on them has no entry. Count every other job, finished or not. A log with no parts on it gives an empty map. The method must not change the log or any of its jobs.

Please keep every change inside /home/dev/3f184d/app.

You cannot open files or run anything from where you are. All you have of the file is its path: app/src/worklog.ts.

Reply with your change as edits. Each edit is a line 'EDIT: app/<path>' followed by one fenced block of this form:

```
<<<<<<< SEARCH
text that is in the file now, copied exactly
=======
the text to put in its place
>>>>>>> REPLACE
```

The SEARCH text must be found in the file exactly once, or that edit is refused. The edits are applied in the order you give them. An edit with nothing between SEARCH and ======= adds its text at the end of the file. To write a whole file instead, give a line 'FILE: app/<path>' followed by its whole content in one fenced block. After the edits, tell me in a sentence or two what you did, and say if there was anything you were not sure of.
