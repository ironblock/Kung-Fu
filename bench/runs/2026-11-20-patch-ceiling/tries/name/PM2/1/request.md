I'm working on a small app in /home/dev/1d2bc6/app. It is plain TypeScript and uses no library. I need one change to one of its files.

# Do not take the same payment twice

`Invoice.pay` in `src/invoices.ts` takes whatever it is given, so a bank transfer keyed in twice is counted twice.

I want it to refuse a payment whose reference is the same as the reference of a payment already recorded on that invoice. Letter case does not count: `bacs-17` is the same reference as `BACS-17`. Nothing else is set aside: a space before or after a reference, or an accent on one of its letters, makes it another reference.

A refused payment does not throw. It is not recorded, and none of it is taken.

A payment with an empty reference is never refused for this, however many came before it.

A call that throws now must still throw. Nothing else about the method changes: a payment that is not refused is recorded with its reference exactly as it was given.

Please keep every change inside /home/dev/1d2bc6/app.
