I'm working on a small app in /home/dev/f87ed2/app. It is plain TypeScript and uses no library. I need one change to one of its files.

# Only a boat's last few visits

On the desk screen I want to show only a boat's last few visits. Please change `visitsOf` in `src/pumpout.ts` so that it takes an optional third parameter:

```ts
export function visitsOf(log: Visit[], boat: string, latest?: number): Visit[]
```

When `latest` is given, the result holds no more than that many visits: the ones of that boat that were recorded most recently, in the order the log holds them. "Most recently" goes by when a visit was put in the log, not by its day or its start time, because the desk sometimes enters a visit late. Every visit gets into the log through this module's own function for recording one, and nothing moves it afterwards.

When the boat has fewer visits than `latest`, return them all. A `latest` of 0 gives an empty list. When `latest` is left out, the function does what it does now. The log must not be changed.

Please keep every change inside /home/dev/f87ed2/app.

You cannot open files or run anything from where you are. All you have of the file is its path: app/src/pumpout.ts.

Reply with your change as edits. Each edit is a line 'EDIT: app/<path>' followed by one fenced block of this form:

```
<<<<<<< SEARCH
text that is in the file now, copied exactly
=======
the text to put in its place
>>>>>>> REPLACE
```

The SEARCH text must be found in the file exactly once, or that edit is refused. The edits are applied in the order you give them. An edit with nothing between SEARCH and ======= adds its text at the end of the file. To write a whole file instead, give a line 'FILE: app/<path>' followed by its whole content in one fenced block. After the edits, tell me in a sentence or two what you did, and say if there was anything you were not sure of.
