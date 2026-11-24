I'm working on a small app in /home/dev/1c9770/app. It is plain TypeScript and uses no library. I need one change to one of its files.

# Say on the board when a stoppage ends

Hirers at the counter ask when a stoppage ends, and the board line that `describe` in `src/stoppages.ts` writes only says when it starts. Please add the end to the line of every notice that has an end date.

The line should then read like this:

    S-104 Hollin Flight: closed from day 120, last day 131 (planned works)

That is, `, last day N` goes straight after the first day and before the cause in brackets, where N is the last day on which the notice is still in force. A restriction gets the same addition after its first day. A notice with no end date keeps the line it has now.

Please keep every change inside /home/dev/1c9770/app.
