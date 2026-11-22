# PJ3: where the change is, and how it goes wrong

**The right change.** Inside `takeBack` (lines 123 to 135 of `src/keys.ts`, with its comment), before anything is taken back. The function looks at the newest entry of `loan.log`. If that entry has the action `"back"` and the call's kind, day and minute, the function returns 0 and does no more. The reference puts this after `if (!line) return 0;`.

**The other declaration.** `record` (lines 103 to 107), which is not exported. `takeBack` and `issue` both add to the log by calling it.

**The fact.** The log is kept newest first. The newest entry is `loan.log[0]`.

**The lines that show it.** Line 103, the comment directly above `record`: "The log is kept newest first, because the desk screen shows its top few entries. Old entries fall off the end." Line 105, in its body: `loan.log.unshift(entry);`. Line 106 cuts the log to its first 40 entries, which says the same.

**What the first line leaves open.** `function record(loan: Loan, entry: LogEntry): void` says that an entry goes into a loan's log. It does not say at which end. `Loan` shows `log: LogEntry[]` and no more. The lines of `takeBack` show the call `record(loan, { action: "back", kind, count: accepted, day, minute })`, so a reader sees what an entry holds and that `record` is where the order is decided, but not the order.

**The natural wrong guess.** That a log grows at its end, so the newest entry is the last: `loan.log[loan.log.length - 1]` or `loan.log.at(-1)`. `hollow-guess.ts` is the reference with that. In the module the last entry is the oldest, which is nearly always an issue, so this answer finds no repeat and takes the gear back twice. The check fails it in every case of "a repeat". It also refuses a return it should take, when the matching return is the oldest entry the log holds and something was logged after it, and the check has two cases for that.

**Other wrong answers.**

- Any entry of the log that matches makes a repeat, and not only the newest. `hollow-any.ts` does this. The check fails it where something was logged after the matching return.
- The count must match too. `hollow-count.ts` does this. The ask says the counts do not have to match.
- The newest entry found by the largest day and minute, which needs no order. `hollow-time.ts` does this. Two entries of one minute then cannot be told apart, and an entry added later for an earlier time is missed. The ask says "most recently added", and the check has a case for it.
- The repeat is refused but still logged, or the test is made after `line.back` has been changed.
- The order settled by the times at the two ends of the log, by a reader who does not know it: the newest entry is taken to be whichever end has the later day and minute. `hollow-laterend.ts` takes the last entry on a tie, and `hollow-earlierend.ts` the first. The check fails both where a return is entered for a time before the issue's, and where the matching return is the oldest entry and an issue for an earlier time was logged after it. It fails the first also where the return and the issue before it have the same day and minute.
- The log sorted by time, later first. `hollow-bytime.ts` does this. It is `hollow-time.ts` in another form.
- A repeat when either end of the log matches. `hollow-eitherend.ts` does this. The check fails it where the matching return is the oldest entry and something was logged after it: two cases.
- A repeat only when the call's count is at least the logged count. `hollow-atleast.ts` does this. The ask says the counts do not have to match.

`hollow-lost.ts` has the right `takeBack` and a `gearCharge` that rounds the half charge for a line and not for each item. The cases of `unchanged` fail it.

**Files with the right rule for a repeat, and `takeBack` changed for a call that is not one.** The ask says such a call "does exactly what it does now". Each is failed by one case of `unchanged`.

- `hollow-uncut.ts`: `takeBack` adds its log entry itself, and the log grows past 40 entries.
- `hollow-closed.ts`: `takeBack` gives 0 for a loan that has been settled.

**More files with the right `takeBack` and one other function changed.** Each is failed by one case of `unchanged`.

- `hollow-twice.ts`: `issue` ignores an issue entered twice for one kind, day and minute.
- `hollow-latefee.ts`: `settle` charges the late fee only while gear is still out.
- `hollow-keysclosed.ts`: `issueKeys` refuses a loan that has been settled.
- `hollow-holder.ts`: `keyHolder` gives the last open loan with the tag, not the first.
