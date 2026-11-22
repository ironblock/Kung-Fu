I'm working on a small app in /home/dev/51cae9/app. It is plain TypeScript and uses no library. I need one change to one of its files.

# List what a booking is still waiting for

When a customer rings to ask what we still have to send them, the office has to work it out by hand. Please add a method to the `Outbox` class in `src/notices.ts`:

```ts
waitingFor(ref: string): Notice[]
```

It gives the notices of the booking with that reference that have not gone yet: those whose `state` is `queued` or `failed`. Leave out the ones that are `sent` or `dropped`, and the notices of every other booking.

Order them by `dueAt`, soonest first. Where two have the same `dueAt`, the one with the lower `id` comes first.

A reference the outbox holds nothing for gives an empty array.

The method must not change the outbox: no notice is altered, and the order in which the outbox itself keeps its notices stays as it was. Each call gives a new array.

Please keep every change inside /home/dev/51cae9/app.

You cannot open files or run anything from where you are. All you have of the file is its path: app/src/notices.ts.

Reply with your change as edits. Each edit is a line 'EDIT: app/<path>' followed by one fenced block of this form:

```
<<<<<<< SEARCH
text that is in the file now, copied exactly
=======
the text to put in its place
>>>>>>> REPLACE
```

The SEARCH text must be found in the file exactly once, or that edit is refused. The edits are applied in the order you give them. An edit with nothing between SEARCH and ======= adds its text at the end of the file. To write a whole file instead, give a line 'FILE: app/<path>' followed by its whole content in one fenced block. After the edits, tell me in a sentence or two what you did, and say if there was anything you were not sure of.
