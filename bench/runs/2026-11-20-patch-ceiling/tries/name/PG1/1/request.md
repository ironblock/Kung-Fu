I'm working on a small app in /home/dev/3b8020/app. It is plain TypeScript and uses no library. I need one change to one of its files.

# What is still owed on a boat

In `src/bookings.ts`, add a method to the BookingBook class:

```ts
outstanding(boatId: string): Pence
```

It returns how much money is still owed on one boat. Go over every booking in the book that is for that boat and whose state is "held" or "confirmed". Each one adds its charge less what has been paid on it. A booking that is paid in full adds nothing, and one that is overpaid adds nothing either: it must not bring the sum down. Bookings in any other state are left out.

A boat with no such bookings gives 0, and so does a boat id the book does not know. The method changes nothing in the book.

Please keep every change inside /home/dev/3b8020/app.
