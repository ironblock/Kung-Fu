I'm working on a small app in /home/dev/b50f55/app. It is plain TypeScript and uses no library. I need one change to one of its files.

# No plan when the lock is done for the day

`planDeparture` in `src/tides.ts` always hands back a plan. When there is no time left that day at which the boat could go into the lock, the plan it hands back is nonsense: its times mean nothing, and the hire desk has printed one of them on a customer's sheet.

Please make it return `null` in that case, and change its return type to say so. Whenever the boat can still go into the lock that day, the plan must be exactly what it is now.

Please keep every change inside /home/dev/b50f55/app.
