I'm working on a small app in /home/dev/1d2bc6/app. It is plain TypeScript and uses no library. I need one change to one of its files.

# Do not take the same payment twice

`Invoice.pay` in `src/invoices.ts` takes whatever it is given, so a bank transfer keyed in twice is counted twice.

I want it to refuse a payment whose reference is the same as the reference of a payment already recorded on that invoice. Letter case does not count: `bacs-17` is the same reference as `BACS-17`. Nothing else is set aside: a space before or after a reference, or an accent on one of its letters, makes it another reference.

A refused payment does not throw. It is not recorded, and none of it is taken.

A payment with an empty reference is never refused for this, however many came before it.

A call that throws now must still throw. Nothing else about the method changes: a payment that is not refused is recorded with its reference exactly as it was given.

Please keep every change inside /home/dev/1d2bc6/app.

You cannot open files or run anything from where you are. All you have of the file is its path: app/src/invoices.ts.

Reply with your change as edits. Each edit is a line 'EDIT: app/<path>' followed by one fenced block of this form:

```
<<<<<<< SEARCH
text that is in the file now, copied exactly
=======
the text to put in its place
>>>>>>> REPLACE
```

The SEARCH text must be found in the file exactly once, or that edit is refused. The edits are applied in the order you give them. An edit with nothing between SEARCH and ======= adds its text at the end of the file. To write a whole file instead, give a line 'FILE: app/<path>' followed by its whole content in one fenced block. After the edits, tell me in a sentence or two what you did, and say if there was anything you were not sure of.
