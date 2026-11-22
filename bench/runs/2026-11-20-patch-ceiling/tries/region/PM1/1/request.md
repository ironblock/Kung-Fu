I'm working on a small app in /home/dev/37fdfe/app. It is plain TypeScript and uses no library. I need one change to one of its files.

# Write off what is left on an invoice

Now and then we give up on the last of a bill, and I have nothing to do it with. Please add a method to the Invoice class in `src/invoices.ts`:

```ts
writeOff(day: Day): Pence
```

It raises one credit note for everything the invoice still owes, dated `day`, with the reason `written off`. The note must come from the class's own `Invoice.credit`, so that it is numbered and kept like any other note. The method returns the pence written off.

When the invoice owes nothing, the method raises no note and returns 0. A draft, a void invoice and a paid invoice all owe nothing: `Invoice.owedPence` gives 0 for each of them.

Please keep every change inside /home/dev/37fdfe/app.
