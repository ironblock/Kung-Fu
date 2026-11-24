I'm working on a small app in /home/dev/37ba8b/app. It is plain TypeScript and uses no library. I need one change to one of its files.

# Charge the first week of a long stay in full

`stayFee` in `src/moorings.ts` takes the long-stay discount off the whole bill as soon as a stay is long enough. That gives too much away.

From now on I want the first seven nights of every stay charged in full, and the discount taken off the later nights only. Take the total for the nights after the seventh, work the discount out once on that total, at the rate it has now and rounded the way it is rounded now, and take it off the bill. So a stay of seven nights or fewer gets no discount at all.

Everything else about the fee stays as it is.

Please keep every change inside /home/dev/37ba8b/app.
