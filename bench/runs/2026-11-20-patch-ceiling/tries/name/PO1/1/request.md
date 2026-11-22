I'm working on a small app in /home/dev/8db790/app. It is plain TypeScript and uses no library. I need one change to one of its files.

# Say what is holding a handover up

The desk screen should show why a boat cannot go out yet, or why its return cannot be closed. Please add this method to the `Handover` class in `src/handover.ts`:

```ts
blockers(): string[]
```

It gives the codes of the checklist items that hold up the handover's next step, in the order they have in the checklist.

While the phase is `checking`, it looks at the `out` checklist. While the phase is `returned`, it looks at the `back` checklist. In every other phase it gives an empty list.

An item holds the step up when its `must` is true and its state is `todo` or `fault`. An item that is `ok` or `na` does not, and neither does an item whose `must` is false, whatever its state.

The method changes nothing in the handover.

Please keep every change inside /home/dev/8db790/app.
