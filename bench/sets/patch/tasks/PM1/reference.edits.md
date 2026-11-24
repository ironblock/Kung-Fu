EDIT: app/src/invoices.ts
```
<<<<<<< SEARCH
paidPence(): Pence {
=======
writeOff(day: Day): Pence {
        const owed = this.owedPence();
        if (owed === 0) return 0;
        this.credit(day, owed, "written off");
        return owed;
    }

    paidPence(): Pence {
>>>>>>> REPLACE
```
