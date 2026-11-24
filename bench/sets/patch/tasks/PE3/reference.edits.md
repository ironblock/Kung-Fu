EDIT: app/src/rota.ts
```
<<<<<<< SEARCH
    return Math.round((paidMinutes(shift) * ratePence) / 60);
=======
    const pay = Math.round((paidMinutes(shift) * ratePence) / 60);
    // weekdayOf gives 6 for a Sunday
    return weekdayOf(shift.day) === 6 ? pay + 1250 : pay;
>>>>>>> REPLACE
```
