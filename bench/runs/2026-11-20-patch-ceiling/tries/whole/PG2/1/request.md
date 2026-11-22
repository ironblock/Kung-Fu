I'm working on a small app in /home/dev/ea8eba/app. It is plain TypeScript and uses no library. I need one change to one of its files.

# A bigger discount for a fortnight or more

In `src/bookings.ts`, `hireCharge` gives a long hire a discount. I want that discount to come in two steps.

A hire of 14 nights or more gets 15 per cent off where it gets a tenth off today. Hires shorter than 14 nights are charged exactly as they are today: those that get a tenth off keep it, and those that get no discount still get none.

The 15 per cent is worked out on the same sum as today's tenth, and it is rounded in the same way. Nothing else about the charge changes.

Please keep every change inside /home/dev/ea8eba/app.
