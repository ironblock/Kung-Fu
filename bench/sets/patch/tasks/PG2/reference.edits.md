EDIT: app/src/bookings.ts
```
<<<<<<< SEARCH
        // a tenth off, rounded in the hirer's favour to the whole pound
        total -= Math.ceil(total / 10 / 100) * 100;
=======
        // a tenth off, or 15 per cent from a fortnight on, rounded in the hirer's favour to the whole pound
        const off = nights >= 14 ? (total * 15) / 100 : total / 10;
        total -= Math.ceil(off / 100) * 100;
>>>>>>> REPLACE
```
