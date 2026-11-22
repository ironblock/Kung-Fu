EDIT: app/src/moorings.ts
```
<<<<<<< SEARCH
    // the discount is rounded down, in the yard's favour
    return full - Math.floor((full * LONG_STAY_OFF) / 100);
=======
    // only the nights after the first week earn the discount, rounded down, in the yard's favour
    return full - Math.floor(((nights - LONG_STAY) * rate * LONG_STAY_OFF) / 100);
>>>>>>> REPLACE
```
