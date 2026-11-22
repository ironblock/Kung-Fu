I'm working on a small app in /home/dev/e1dadc/app. It is plain TypeScript and uses no library. I need one change to one of its files.

# Count the gear that is out

Each morning the yard counts its stock, and I need to know how much gear is out with hire parties. Please add this function to `src/keys.ts`:

```ts
export function stillOut(loans: Loan[]): Record<GearKind, number>
```

It gives, for each kind of gear, how many items are out over all the loans in the list.

An item is out when it was issued and has not come back. A line's `back` counts every item that came back, the damaged ones too, so a damaged item is not out.

Only open loans count. A loan that has been settled adds nothing, whatever it still holds.

Every one of the six kinds is a key of the result, with 0 when none of that kind is out. So an empty list gives 0 for all six.

The function changes neither the loans nor the list.

Please keep every change inside /home/dev/e1dadc/app.
