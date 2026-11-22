Module `notices`, written in W = /home/build/patch/notices/set. Every command in the brief ends as it must. Nothing was committed and nothing under /home/user/Kung-Fu was edited.

## The module: /home/build/patch/notices/set/files/notices.ts

992 lines by `wc -l`. No import, no clock, no random number. No line over 120 columns. The outline shows no first line cut.

**Exports**
- Types: `Channel`, `NoticeKind`, `NoticeState`, `Anchor`, `Booking`, `QuietHours`, `Rule`, `Template`, `Filled`, `Notice`, `Attempt`, `DateParts`.
- Constants: `DAY_MIN`, `NO_STAMP`, `NO_MIN`, `GIVE_UP`, `SMS_SINGLE`, `SMS_MULTI`, `SMS_MAX_PARTS`, `HANDOVER_MIN`, `RETURN_BY_MIN`, `BALANCE_DAYS`, `DEFAULT_QUIET`, `RULES`.
- Functions: `stampOf`, `dayOf`, `minOf`, `weekdayOf`, `dateOf`, `formatDay`, `formatMin`, `formatStamp`, `parseClock`, `formatPence`, `isQuiet`, `quietMinutes`, `clearOfQuiet`, `parseQuiet`, `mobileOf`, `reach`, `pickChannel`, `ruleFor`, `whenDue`, `timeline`, `nightsOf`, `greetingName`, `fieldsOf`, `fill`, `smsParts`, `clipSms`, `render`, `checkTemplates`, `retryDelay`, `isPermanent`, `tidyError`, `sortDue`, `costPence`, `spend`, `byDay`, `describe`.
- Class `Outbox`, with four private fields of state and the members `size`, `plan`, `move`, `cancel`, `get`, `forBooking`, `due`, `nextWake`, `sent`, `failed`, `requeue`, `attemptsFor`, `lastError`, `problems`, `counts`, `prune`.
- Not exported: `Slot`, the `TEMPLATES` table, the retry ladders, `isLeap`, `yearLength`, `monthLength`, `looksLikeEmail`, `anchorDay`, `slotFor`, `isWaiting`.

**Conventions a guess would get wrong, and where each shows**

Only in a body or a comment:
1. `isQuiet(q, at)` takes a time of day, not a stamp, and takes no remainder (comment on line 397, body 399 to 408).
2. Quiet hours include `fromMin` and not `toMin`, may run over midnight, and the same time twice means none (lines 398 to 408).
3. The attempt log is kept newest first: `unshift` in `Outbox.sent` and `Outbox.failed`, and the comment on the `log` field.
4. `sortDue` sorts the list it is given and hands the same list back (line 731).
5. `whenDue` gives `NO_STAMP` when a rule is not for the booking: nothing owed, or no deposit held.
6. `retryDelay` counts tries from 1 and gives `GIVE_UP` past the ladder. A letter has its own ladder of one step.
7. `fill` leaves a field with no value in the text and lists it once. A doubled brace is one brace. An empty string is a value (`Object.hasOwn`).
8. `Outbox.due`: a limit of 0 or less is no limit, and a notice due exactly now is due.
9. `Outbox.prune(beforeDay)` keeps the day itself, and goes by `sentAt` for what was sent and by `dueAt` for what was dropped.
10. A late notice goes now or is skipped by its rule's `late`. A notice due exactly now is not late.
11. `formatPence` writes whole pounds with no pence. `formatMin` writes `9am`, `2.30pm`, `noon`, `midnight`.
12. `smsParts`: 160 characters alone, 153 a part when joined. `spend` counts only what was sent.
13. `nightsOf`: `endDay` is the day the boat comes back, not a night.

Visible in a first line: money in pence (`balancePence`), times in minutes (`fromMin`, `atMin`), `NO_STAMP = -1`, and month and weekday as numbers. That month counts from 1 and Monday is 0 is only in the bodies.

## The regression helper: /home/build/patch/notices/set/checks/helpers-notices.ts

- 165 named cases, at least two for each function and method. A repeated name throws.
- I tried it on 158 small changes to the module, one at a time: an end of a range moved, an order turned, a rounding or a default changed. The first run let 3 through (the sort in `timeline`, `dueAt` on giving up, `prune` going by due time). I added cases, and the second run failed all 158.

## The three tasks

**PP1, beside: "List what a booking is still waiting for".**
- It adds `waitingFor(ref: string): Notice[]` to `Outbox`: the booking's `queued` and `failed` notices, by `dueAt` then `id`, a new array, the outbox unchanged.
- It turns on what the outline shows: the field `private notices: Notice[] = []` and the fields of `Notice`.
- The reference edit quotes `forBooking(ref: string): Notice[] {`, as the outline prints it.
- Hollows: `lost` (`smsParts` counts 160 characters as two parts), `queued`, `inplace`, `unsorted`.
- `unchanged` skips nothing.

**PP2, inside: "Let a template give a fallback for a field".**
- `fill` takes `{boat|your boat}`: the name is before the first bar, the fallback after it is kept as written, and a name with a fallback is not listed as missing.
- It turns on the body of `fill`, lines 623 to 626, and on keeping the rest of that body as it is.
- Hollows: `lost` (`formatPence` always writes pence), `empty`, `listed`, `trimmed`, `lastbar`.
- `unchanged` skips "fill: a bar inside the braces is part of the name".

**PP3, leans: "Give the sender nothing in quiet hours".**
- `Outbox.due` gives an empty array while `now` is in the outbox's quiet hours.
- It turns on `isQuiet` taking a time of day: the right call is `isQuiet(this.quiet, minOf(now))`.
- The ask does not name `isQuiet` or say the fact. The region shows only the five lines of `due` and its comment.
- `hollow-guess.ts` is `isQuiet(this.quiet, now)`. It fails the daytime cases and many cases of `unchanged`.
- Other hollows: `lost` (`attemptsFor` oldest first), `ends` (`toMin` counted as quiet), `allday` (the same time twice taken as a whole quiet day).
- `unchanged` skips "Outbox.due: hands out what is overdue whatever the time of day".

Each `where.md` gives the line numbers, the likely wrong answers and the skipped cases.

## The last line of each command

- `tsc --strict` on the module, and on each `reference.ts` copied to a temporary `.ts` file: no output, exit 0. Every hollow file also passes it.
- `holds.py make`: `3 tasks: name, outline, region, whole written for each`
- `holds.py check`: `all as they must be`
- `box.py check-tasks W --window none`: `window: none; all as they must be`. Three references pass; three plain and thirteen hollow answers fail, none because it would not load.
- `holds.py sizes`: `PP3   leans          992       116      6707      7078     32238   Outbox.due`

Sizes in bytes for all three tasks: name 116, outline 6,707, whole 32,238. The region text is 14,458 for PP1 (the whole class, not sent), 7,980 for PP2 and 7,078 for PP3.

## Checks of my own beyond the brief

Six right answers written other ways all pass their checks:
- PP1: copies with a hand-written sort at the end of the class; a sort by `dueAt` alone.
- PP2: `split("|")` and `join`.
- PP3: `clearOfQuiet(this.quiet, now) !== now`; `now % DAY_MIN`; `isQuiet` itself changed to take a remainder.

No rule of the brief was left unkept, as far as I can tell.

## Unsure

1. PP3 can be passed without the fact. `clearOfQuiet(this.quiet, now) !== now` is right, and that function's first line names its parameter `stamp`. A reader of the outline may also set `at` beside `stamp`, `fromMin` and `toMin` and come to `minOf(now)` without the body. So the region arm's ceiling may pass this task. The natural guess, `isQuiet(this.quiet, now)`, is wrong and fails.

2. PP3's check tests the edges of quiet hours: `fromMin` is quiet, `toMin` is not, and the same time twice is never quiet. The ask does not state these. It says to use the file's idea of quiet hours. An answer that calls `isQuiet` rightly passes. One that works quiet hours out again must agree at the edges. I think that is fair for a leans task, but it is a judgment.

3. The comment above `isQuiet` states the fact outright ("It is not a stamp"). The brief asks that the whole file show it plainly. It is blunter than most comments in the file.

4. PP1: the outline shows `sortDue(list: Notice[]): Notice[]`, and only its body says it sorts in place. A reader who writes `sortDue(this.notices).filter(...)` reorders the outbox and fails. The ask forbids that in words, and a right answer needs no helper, so I count the task as writable from the outline. Such a failure would be the arm's.

5. PP1: the clause on the lower `id` cannot be told from a stable sort by `dueAt` alone, because the outbox keeps its notices in id order. The check fails only a sort that turns the ids round.

6. PP2: the ask is 167 words by `wc -w`, title included. The limit is 170. The check does not test a fallback that holds an opening brace, or what `checkTemplates` says of a template with a bar. The ask is silent on both.

7. The helper does not pin `isQuiet` for a time outside 0 to 1439. I left that out on purpose, so that making `isQuiet` take a remainder is not punished. A rewrite of `isQuiet` that differs only there passes.

8. `isLeap`'s rule for century years is not tested. No day number near a hire reaches 2100.

9. The module has more comments than the sparest reading of "sparse" would give: about one for every second function.

10. The yard's name, Lowmere Wharf, and the customers' names are invented. I did not search to confirm that no real business has the name. The phone number is in the range kept for fiction.

11. I read one finished sibling set, `worklog`, for the form of the files. I copied none of its content. The brief says to work only inside W, which I took to mean write only there.