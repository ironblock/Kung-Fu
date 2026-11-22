EDIT: app/src/pumpout.ts
```
<<<<<<< SEARCH
        // A visit holds the point from its start up to, not including, its end.
        if (!taken.some((v) => v.start < end && start < endOf(v))) {
=======
        // Shut for lunch from 12:30 up to, not including, 13:10.
        const lunch = start < 790 && end > 750;
        // A visit holds the point from its start up to, not including, its end.
        if (!lunch && !taken.some((v) => v.start < end && start < endOf(v))) {
>>>>>>> REPLACE
```
