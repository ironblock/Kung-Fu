I'm working on a small app in /home/dev/ec14b2/app. It is plain TypeScript and uses no library. I need one change to one of its files.

# List the days a route is shut

Before the office takes a booking it wants to tell the hirer which days of the hire the route is shut. I need a function for that in `src/stoppages.ts`. Please add it, exported, with this signature:

```ts
export function closedDays(register: Register, route: Route, fromDay: number, toDay: number): number[]
```

It returns the day numbers on which the route is not open, in rising order. The span it looks at starts at `fromDay` and stops before `toDay`: `fromDay` is looked at and `toDay` is not. Whether the route is open on a day is what `routeOpen` says for that day.

If no day of the span is shut, or `toDay` is not after `fromDay`, it returns an empty list. It must not change the register or the route, and each call gives back a new list of its own.

Please keep every change inside /home/dev/ec14b2/app.
