I'm working on a small app in /home/dev/a348dc/app. It is plain TypeScript and uses no library. I need one change to one of its files.

# Give part of the deposit back when a hire is cancelled

In `src/bookings.ts`, `BookingBook.cancel` leaves the whole deposit with the yard when a confirmed hire is cancelled. The office has been working out by hand how much of the deposit to give back. The book should do it.

When a confirmed hire is cancelled, the party still gets back what it gets today. On top of that it now gets back the share of its deposit that our refund scale gives for the notice it gave. The notice is the number of days from the day of cancelling to the first day of the hire.

The sum the method returns is everything paid back, and whatever the method writes down about the refund uses that sum, as it does today. A hold still gets nothing back.

Please keep every change inside /home/dev/a348dc/app.

You cannot open files or run anything from where you are. All you have of the file is its path: app/src/bookings.ts.

Reply with your change as edits. Each edit is a line 'EDIT: app/<path>' followed by one fenced block of this form:

```
<<<<<<< SEARCH
text that is in the file now, copied exactly
=======
the text to put in its place
>>>>>>> REPLACE
```

The SEARCH text must be found in the file exactly once, or that edit is refused. The edits are applied in the order you give them. An edit with nothing between SEARCH and ======= adds its text at the end of the file. To write a whole file instead, give a line 'FILE: app/<path>' followed by its whole content in one fenced block. After the edits, tell me in a sentence or two what you did, and say if there was anything you were not sure of.
