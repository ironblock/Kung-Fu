EDIT: app/src/tariff.ts
```
<<<<<<< SEARCH
    const gross = share(paid, refundRate(daysUntil(cancelDay, startDay)));
    // The admin fee is a tenth of what was paid, up to the flat fee. It comes out of every refund.
    const fee = Math.min(ADMIN_FEE_PENCE, share(paid, 100));
    // What is left is not sent when it is under the minimum.
    const net = gross - fee;
=======
    // The admin fee is a tenth of what was paid, up to the flat fee. It comes off before the rate.
    const fee = Math.min(ADMIN_FEE_PENCE, share(paid, 100));
    // What the rate gives is not sent when it is under the minimum.
    const net = share(paid - fee, refundRate(daysUntil(cancelDay, startDay)));
>>>>>>> REPLACE
```
