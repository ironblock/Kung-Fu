EDIT: app/src/keys.ts
```
<<<<<<< SEARCH
=======

// What is out with hire parties, kind by kind, over the loans that are still open.
export function stillOut(loans: Loan[]): Record<GearKind, number> {
    const counts = {} as Record<GearKind, number>;
    for (const kind of ALL_KINDS) counts[kind] = 0;
    for (const loan of loans) {
        if (!isOpen(loan)) continue;
        for (const kind of ALL_KINDS) counts[kind] += outstanding(loan, kind);
    }
    return counts;
}
>>>>>>> REPLACE
```
