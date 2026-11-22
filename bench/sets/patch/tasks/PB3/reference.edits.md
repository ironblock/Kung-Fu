EDIT: app/src/tides.ts
```
<<<<<<< SEARCH
cruise: number): Departure {
=======
cruise: number): Departure | null {
>>>>>>> REPLACE
```

EDIT: app/src/tides.ts
```
<<<<<<< SEARCH
    const entry = nextEntry(windows, ready + cruise);
=======
    const entry = nextEntry(windows, ready + cruise);
    if (entry === DAY) return null;
>>>>>>> REPLACE
```
