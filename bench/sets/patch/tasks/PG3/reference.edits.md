EDIT: app/src/bookings.ts
```
<<<<<<< SEARCH
        // a hold has paid nothing; a confirmed party gets back what it paid beyond the deposit
        const refund = b.state === "confirmed" ? Math.max(0, b.paidPence - b.depositPence) : 0;
=======
        // a hold has paid nothing; a confirmed party gets back what it paid beyond the deposit,
        // and the share of the deposit that its notice earns: whole pounds times whole per cent, so whole pence
        const share = (b.depositPence * refundShare(b.fromDay - dayOf(at))) / 100;
        const refund = b.state === "confirmed" ? Math.max(0, b.paidPence - b.depositPence) + share : 0;
>>>>>>> REPLACE
```
