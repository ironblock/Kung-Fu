EDIT: app/src/fuel.ts
```
<<<<<<< SEARCH
=======

export function usageByBoat(ledger: Ledger, fromDay: number, toDay: number): Array<[string, number]> {
    const totals = new Map<string, number>();
    for (const entry of ledger.entries) {
        if (entry.kind !== "draw" || entry.boat === YARD || entry.day < fromDay || entry.day >= toDay) {
            continue;
        }
        totals.set(entry.boat, (totals.get(entry.boat) ?? 0) + entry.volume);
    }
    return [...totals.entries()].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1));
}
>>>>>>> REPLACE
```
