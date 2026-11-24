EDIT: app/src/notices.ts
```
<<<<<<< SEARCH
forBooking(ref: string): Notice[] {
=======
waitingFor(ref: string): Notice[] {
        return sortDue(this.notices.filter((n) => n.ref === ref && isWaiting(n.state)));
    }

    forBooking(ref: string): Notice[] {
>>>>>>> REPLACE
```
