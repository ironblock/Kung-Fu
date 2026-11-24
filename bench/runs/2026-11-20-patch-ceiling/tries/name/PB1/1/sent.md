I'm working on a small app in /home/dev/6beeec/app. It is plain TypeScript and uses no library. I need one change to one of its files.

# Minutes the lock is open in a stretch of the day

I am working out how much of a keeper's shift the lock can be used. Please add this function to `src/tides.ts`:

```ts
export function openMinutes(windows: LockWindow[], from: number, to: number): number
```

It returns how many minutes of the stretch from `from` to `to` fall inside the windows. All times are minutes from midnight. A window runs from its `opens` to its `closes`, so one that opens at 480 and closes at 690 is 210 minutes long.

Only the part of a window that lies within the stretch counts. A window that opens before `from` or closes after `to` is cut down to fit, and one wholly outside the stretch adds nothing.

The windows never overlap, but they may come in any order. When `to` is not after `from` the answer is 0. The list and its windows must be left as they are.

Please keep every change inside /home/dev/6beeec/app.

You cannot open files or run anything from where you are. All you have of the file is its path: app/src/tides.ts.

Reply with your change as edits. Each edit is a line 'EDIT: app/<path>' followed by one fenced block of this form:

```
<<<<<<< SEARCH
text that is in the file now, copied exactly
=======
the text to put in its place
>>>>>>> REPLACE
```

The SEARCH text must be found in the file exactly once, or that edit is refused. The edits are applied in the order you give them. An edit with nothing between SEARCH and ======= adds its text at the end of the file. To write a whole file instead, give a line 'FILE: app/<path>' followed by its whole content in one fenced block. After the edits, tell me in a sentence or two what you did, and say if there was anything you were not sure of.
