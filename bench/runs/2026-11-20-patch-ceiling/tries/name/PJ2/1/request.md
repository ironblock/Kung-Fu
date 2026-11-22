I'm working on a small app in /home/dev/c076b3/app. It is plain TypeScript and uses no library. I need one change to one of its files.

# Lost keys and damaged lifejackets

Two rules at the desk have changed, and `gearCharge` in `src/keys.ts` must follow them.

When boat keys are lost we change the lock, and one change of lock covers every key. So a loan with any boat keys missing is charged the cost of one boat key for them, however many are missing. A loan with no boat key missing is charged nothing for missing keys, as now.

A damaged lifejacket cannot be lent again. So each damaged lifejacket is charged the full cost of a lifejacket, in place of the charge it gets now.

Everything else is charged as it is now: missing gear of the other kinds, each missing lifejacket, damaged gear of the other kinds, and each damaged boat key. The function still changes nothing in the loan.

Please keep every change inside /home/dev/c076b3/app.
