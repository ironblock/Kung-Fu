I'm working on a small app in /home/dev/97ffaa/app. It is plain TypeScript and uses no library. I need one change to one of its files.

# Write off what is left on an invoice

Now and then we give up on the last of a bill, and I have nothing to do it with. Please add a method to the Invoice class in `src/invoices.ts`:

```ts
writeOff(day: Day): Pence
```

It raises one credit note for everything the invoice still owes, dated `day`, with the reason `written off`. The note must come from the class's own `Invoice.credit`, so that it is numbered and kept like any other note. The method returns the pence written off.

When the invoice owes nothing, the method raises no note and returns 0. A draft, a void invoice and a paid invoice all owe nothing: `Invoice.owedPence` gives 0 for each of them.

Please keep every change inside /home/dev/97ffaa/app.

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
