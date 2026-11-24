I'm working on a small app in /home/dev/825227/app. It is plain TypeScript and uses no library. I need one change to one of its files.

# List the days a route is shut

Before the office takes a booking it wants to tell the hirer which days of the hire the route is shut. I need a function for that in `src/stoppages.ts`. Please add it, exported, with this signature:

```ts
export function closedDays(register: Register, route: Route, fromDay: number, toDay: number): number[]
```

It returns the day numbers on which the route is not open, in rising order. The span it looks at starts at `fromDay` and stops before `toDay`: `fromDay` is looked at and `toDay` is not. Whether the route is open on a day is what `routeOpen` says for that day.

If no day of the span is shut, or `toDay` is not after `fromDay`, it returns an empty list. It must not change the register or the route, and each call gives back a new list of its own.

Please keep every change inside /home/dev/825227/app.

You cannot open files or run anything from where you are. All you have of the file is its path: app/src/stoppages.ts.

Reply with your change as edits. Each edit is a line 'EDIT: app/<path>' followed by one fenced block of this form:

```
<<<<<<< SEARCH
text that is in the file now, copied exactly
=======
the text to put in its place
>>>>>>> REPLACE
```

The SEARCH text must be found in the file exactly once, or that edit is refused. The edits are applied in the order you give them. An edit with nothing between SEARCH and ======= adds its text at the end of the file. To write a whole file instead, give a line 'FILE: app/<path>' followed by its whole content in one fenced block. After the edits, tell me in a sentence or two what you did, and say if there was anything you were not sure of.
