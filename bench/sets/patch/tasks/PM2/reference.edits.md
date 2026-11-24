EDIT: app/src/invoices.ts
```
<<<<<<< SEARCH
        const taken = Math.min(pence, this.owedPence());
=======
        const wanted = ref.toLowerCase();
        if (wanted !== "" && this.payments.some((payment) => payment.ref.toLowerCase() === wanted)) return pence;
        const taken = Math.min(pence, this.owedPence());
>>>>>>> REPLACE
```
