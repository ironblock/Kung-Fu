EDIT: app/src/tariff.ts
```
<<<<<<< SEARCH
=======

/** The start day from fromDay to toDay, both included, that makes the hire cheapest. The earliest when several do. */
export function cheapestStart(boatClass: BoatClass, nights: number, fromDay: number, toDay: number): number {
    let best = fromDay;
    let bestPence = quoteHire({ boatClass, startDay: fromDay, nights, pets: 0 }).totalPence;
    for (let day = fromDay + 1; day <= toDay; day++) {
        const pence = quoteHire({ boatClass, startDay: day, nights, pets: 0 }).totalPence;
        if (pence < bestPence) {
            best = day;
            bestPence = pence;
        }
    }
    return best;
}
>>>>>>> REPLACE
```
