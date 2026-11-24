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

You cannot open files or run anything from where you are. All you have of the file is its path: app/src/handover.ts.

Reply with your change as edits. Each edit is a line 'EDIT: app/<path>' followed by one fenced block of this form:

```
<<<<<<< SEARCH
text that is in the file now, copied exactly
=======
the text to put in its place
>>>>>>> REPLACE
```

The SEARCH text must be found in the file exactly once, or that edit is refused. The edits are applied in the order you give them. An edit with nothing between SEARCH and ======= adds its text at the end of the file. To write a whole file instead, give a line 'FILE: app/<path>' followed by its whole content in one fenced block. After the edits, tell me in a sentence or two what you did, and say if there was anything you were not sure of.
