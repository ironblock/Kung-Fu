I'm working on a small app in /home/dev/cf7a9d/app. It is plain TypeScript and uses no library. I need one change to one of its files.

# Give part of the deposit back when a hire is cancelled

In `src/bookings.ts`, `BookingBook.cancel` leaves the whole deposit with the yard when a confirmed hire is cancelled. The office has been working out by hand how much of the deposit to give back. The book should do it.

When a confirmed hire is cancelled, the party still gets back what it gets today. On top of that it now gets back the share of its deposit that our refund scale gives for the notice it gave. The notice is the number of days from the day of cancelling to the first day of the hire.

The sum the method returns is everything paid back, and whatever the method writes down about the refund uses that sum, as it does today. A hold still gets nothing back.

Please keep every change inside /home/dev/cf7a9d/app.
