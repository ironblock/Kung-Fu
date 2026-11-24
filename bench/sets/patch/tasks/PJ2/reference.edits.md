EDIT: app/src/keys.ts
```
<<<<<<< SEARCH
        pence += (line.issued - line.back) * each;
        // Damaged gear is charged at half its cost, each item rounded up to a whole penny.
        pence += line.damaged * Math.ceil(each / 2);
=======
        const missing = line.issued - line.back;
        // One change of lock covers every lost key.
        pence += (line.kind === "boatKey" ? Math.min(missing, 1) : missing) * each;
        // Damaged gear is charged at half its cost, each item rounded up to a whole penny.
        // A damaged lifejacket cannot be lent again, and is charged in full.
        pence += line.damaged * (line.kind === "lifejacket" ? each : Math.ceil(each / 2));
>>>>>>> REPLACE
```
