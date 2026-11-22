EDIT: app/src/moorings.ts
```
<<<<<<< SEARCH
=======

// The free berths the boat could be given now, shortest first.
export function berthsFor(boat: Boat, berths: Berth[], needPower: boolean): BerthId[] {
    return berths
        .filter((berth) => isFree(berth) && fits(boat, berth) && (!needPower || berth.power))
        .sort((a, b) => a.length - b.length)
        .map((berth) => berth.id);
}
>>>>>>> REPLACE
```
