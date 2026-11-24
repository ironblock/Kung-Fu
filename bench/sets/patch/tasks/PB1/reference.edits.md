EDIT: app/src/tides.ts
```
<<<<<<< SEARCH
=======

/** The minutes of the stretch from `from` to `to` in which the lock is open. */
export function openMinutes(windows: LockWindow[], from: number, to: number): number {
    let total = 0;
    for (const w of windows) {
        total += Math.max(0, Math.min(to, w.closes) - Math.max(from, w.opens));
    }
    return total;
}
>>>>>>> REPLACE
```
