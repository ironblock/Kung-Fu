EDIT: app/src/invoices.ts
```
<<<<<<< SEARCH
        if (this.payments.length > 0) out.push(`  Paid ${formatPence(this.paidPence())}`);
=======
        for (let i = this.payments.length - 1; i >= 0; i--) {
            const payment = this.payments[i];
            out.push(`  Payment  ${isoDay(payment.day)}  ${formatPence(payment.pence)}  ${payment.method}`);
        }
        if (this.payments.length > 0) out.push(`  Paid ${formatPence(this.paidPence())}`);
>>>>>>> REPLACE
```
