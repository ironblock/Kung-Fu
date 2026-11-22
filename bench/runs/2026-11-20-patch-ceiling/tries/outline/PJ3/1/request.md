I'm working on a small app in /home/dev/4aa231/app. It is plain TypeScript and uses no library. I need one change to one of its files.

# A return entered twice

At the desk a return is sometimes entered twice by mistake, and the second entry takes back gear that is still out with the party. Please change `takeBack` in `src/keys.ts` so that it ignores a repeat.

A call is a repeat when the entry most recently added to the loan's log is itself a return of the same kind, on the same day and at the same minute as the call. The counts do not have to match. A repeat takes nothing back: it gives 0 and changes nothing in the loan, its log included.

Only that one entry is looked at. If anything else has been logged since the matching return, the call is not a repeat. When the log is empty, no call is a repeat. A call that is not a repeat does exactly what it does now.

Please keep every change inside /home/dev/4aa231/app.
