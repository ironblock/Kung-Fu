I'm working on a small app in /home/dev/0a7ad0/app. It is plain TypeScript and uses no library. I need one change to one of its files.

# Show each payment on an invoice's statement

`Invoice.statementLines` in `src/invoices.ts` shows only the sum that has been paid. Hirers ring me to ask which of their payments have reached us.

Please make it show one line for each payment, directly above the "Paid" line. The lines go in the order in which the payments were recorded: the payment recorded first is the top one, whatever days the payments carry.

A payment's line is two spaces, then the word Payment, the day, the amount and the method, with two spaces between each of those four. The day and the amount are printed as the statement prints its other days and amounts. For example:

```
  Payment  2026-03-09  £250.00  card
```

An invoice with no payment gets no such line. Nothing else about the statement changes.

Please keep every change inside /home/dev/0a7ad0/app.
