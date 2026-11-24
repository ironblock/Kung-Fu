EDIT: app/src/manifest.ts
```
<<<<<<< SEARCH
        const same = this.load.find((l) => l.stowed === item.stowed && l.label.toLowerCase() === label.toLowerCase());
        if (same !== undefined) {
            // the same thing in the same place is one row, and the unit weight first given stands
=======
        const same = this.load.find(
            (l) =>
                l.stowed === item.stowed &&
                l.unitKg === item.unitKg &&
                l.label.toLowerCase() === label.toLowerCase(),
        );
        if (same !== undefined) {
            // the same thing at the same weight in the same place is one row
>>>>>>> REPLACE
```
