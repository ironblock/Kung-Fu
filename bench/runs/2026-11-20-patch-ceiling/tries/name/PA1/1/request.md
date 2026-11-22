I'm working on a small app in /home/dev/4bdfd3/app. It is plain TypeScript and uses no library. I need one change to one of its files.

# List the berths a boat could take

In `src/moorings.ts` I want a new exported function, beside the ones that are there:

```ts
export function berthsFor(boat: Boat, berths: Berth[], needPower: boolean): BerthId[]
```

It returns the ids of the berths the boat could be given right now. Those are the berths that are free, that the boat fits by the same rule `fits` uses, and, when `needPower` is true, that have power. When `needPower` is false, power makes no difference: berths with and without it both count. A berth is free while its `boatId` is `""`. Whether the boat already lies at a berth makes no difference: the berth it lies at is not free, and the others count as they would for any boat.

Put the shortest berth first. Berths of the same length keep the order they have in `berths`. Return `[]` when no berth will do.

It must not change `berths`, nor any berth in it.

Please keep every change inside /home/dev/4bdfd3/app.
