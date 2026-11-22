I'm working on a small app in /home/dev/07349f/app. It is plain TypeScript and uses no library. I need one change to one of its files.

# List what a booking is still waiting for

When a customer rings to ask what we still have to send them, the office has to work it out by hand. Please add a method to the `Outbox` class in `src/notices.ts`:

```ts
waitingFor(ref: string): Notice[]
```

It gives the notices of the booking with that reference that have not gone yet: those whose `state` is `queued` or `failed`. Leave out the ones that are `sent` or `dropped`, and the notices of every other booking.

Order them by `dueAt`, soonest first. Where two have the same `dueAt`, the one with the lower `id` comes first.

A reference the outbox holds nothing for gives an empty array.

The method must not change the outbox: no notice is altered, and the order in which the outbox itself keeps its notices stays as it was. Each call gives a new array.

Please keep every change inside /home/dev/07349f/app.
