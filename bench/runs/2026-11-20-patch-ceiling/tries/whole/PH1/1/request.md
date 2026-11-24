I'm working on a small app in /home/dev/4aa29c/app. It is plain TypeScript and uses no library. I need one change to one of its files.

# Who gets on and off before a leg

Before each leg the yard hand needs to know who comes aboard and who goes ashore. Please add a method to the Manifest class in `src/manifest.ts`:

```ts
changesAt(legIndex: number): { on: Person[]; off: Person[] }
```

`on` is the people aboard for that leg who were not aboard for the leg before it. `off` is the people aboard for the leg before it who are not aboard for this one. For the first leg, `on` is everyone aboard for it and `off` is empty.

Two entries are the same person when their ids are equal. Go by what the class already answers about who is aboard for a leg, not by the people's own fields, and keep both lists in the order it gives them. I will only pass the index of a leg the manifest has. The method must not change the manifest.

Please keep every change inside /home/dev/4aa29c/app.
