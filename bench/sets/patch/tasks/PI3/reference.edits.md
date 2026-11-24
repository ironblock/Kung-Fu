EDIT: app/src/pumpout.ts
```
<<<<<<< SEARCH
export function visitsOf(log: Visit[], boat: string): Visit[] {
    return log.filter((v) => v.boat === boat);
=======
export function visitsOf(log: Visit[], boat: string, latest?: number): Visit[] {
    const visits = log.filter((v) => v.boat === boat);
    // The log is newest first, so the latest are at its top.
    return latest === undefined ? visits : visits.slice(0, latest);
>>>>>>> REPLACE
```
