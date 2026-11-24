I'm working on a small app in /home/dev/067720/app. It is plain TypeScript and uses no library. I need one change to one of its files.

# Who gets on and off before a leg

Before each leg the yard hand needs to know who comes aboard and who goes ashore. Please add a method to the Manifest class in `src/manifest.ts`:

```ts
changesAt(legIndex: number): { on: Person[]; off: Person[] }
```

`on` is the people aboard for that leg who were not aboard for the leg before it. `off` is the people aboard for the leg before it who are not aboard for this one. For the first leg, `on` is everyone aboard for it and `off` is empty.

Two entries are the same person when their ids are equal. Go by what the class already answers about who is aboard for a leg, not by the people's own fields, and keep both lists in the order it gives them. I will only pass the index of a leg the manifest has. The method must not change the manifest.

Please keep every change inside /home/dev/067720/app.

You cannot open files or run anything from where you are. All you have of the file is its path: app/src/manifest.ts.

Reply with your change as edits. Each edit is a line 'EDIT: app/<path>' followed by one fenced block of this form:

```
<<<<<<< SEARCH
text that is in the file now, copied exactly
=======
the text to put in its place
>>>>>>> REPLACE
```

The SEARCH text must be found in the file exactly once, or that edit is refused. The edits are applied in the order you give them. An edit with nothing between SEARCH and ======= adds its text at the end of the file. To write a whole file instead, give a line 'FILE: app/<path>' followed by its whole content in one fenced block. After the edits, tell me in a sentence or two what you did, and say if there was anything you were not sure of.
