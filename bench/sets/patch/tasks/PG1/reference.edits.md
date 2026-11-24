EDIT: app/src/bookings.ts
```
<<<<<<< SEARCH
addNote(id: string, text: string): boolean {
=======
/** What is still owed on a boat's live bookings. A booking paid in full or over adds nothing. */
    outstanding(boatId: string): Pence {
        let owed = 0;
        for (const b of this.bookings) {
            if (b.boatId === boatId && isLive(b)) {
                owed += Math.max(0, b.chargePence - b.paidPence);
            }
        }
        return owed;
    }

    addNote(id: string, text: string): boolean {
>>>>>>> REPLACE
```
