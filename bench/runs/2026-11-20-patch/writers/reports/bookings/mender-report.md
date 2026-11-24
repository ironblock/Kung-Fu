## changes

Every change is listed in /home/build/patch/bookings/set/CHANGES.md, one line each, with the finding it answers. I did not change the module, the asks, plain.ts, any reference.ts or reference.edits.md, any where.md or any other.ts. Numbers below are the adversary's hollow-adv numbers.

Regression helper, /home/build/patch/bookings/set/checks/helpers-bookings.ts. It went from 152 cases to 182. No task's skip list names a case that changed.

New cases:
- "stampOf: minutes past the end of a day run on into the next" (154)
- "dayOf: a stamp before day 0 is in a day before 0" (005)
- "minuteOf: a stamp before day 0 counts from that day's midnight" (006)
- "formatDay: days before day 0 fall in week 0 and earlier" (007)
- "formatStamp: only NEVER is a dash, and other stamps before day 0 print as times" (010)
- "daysOverlap: a span of no days inside a hire still touches it, one at its edge does not" (213, 233, 263)
- "validateRequest: a size that is not whole is not also measured against the berths" (019)
- "validateRequest: a day before day 0 has its weekday as any other day does" (025)
- "hireCharge: days that run backwards bring the berth extra below zero" (216, 236, 266)
- "sortForDiary: on one day the boat comes before the booking number" (037)
- "quoteFor: for a hire early in the season the balance falls due before day 0" (039)
- "book: of two boats with one id, the later is kept" (150)
- "book: keeps the caller's boats, not copies of them" (151)
- "confirm: more than the charge is written down as paid too" (217, 237, 267)
- "confirm: a hold that has run out is let go, however little is handed over" (067)
- "cancel: a lapsed hold gives 0 and stays lapsed" (166)
- "cancel: a hold past its minute that nothing has let go yet is cancelled at the minute given" (167)
- "move: a hire that costs more on its new days keeps the deposit it was placed with" (080)
- "move: to the day it begins already, the move is still noted and recorded" (086)
- "move: a hold moved nearer its days keeps the minute it runs out" (087)
- "move: a hold past its minute that nothing has let go yet can still be moved" (214, 234, 264)
- "changeBoat: a hold past its minute that nothing has let go yet can still change boat" (215, 235, 265)
- "addNote: a closed booking still takes a note" (096)
- "waitingFor: the queue is in the order parties joined, whatever stamp they carry" (102)
- "waitingFor: hands back the book's own entries" (104)
- "history: in the order the book came to know of things, not by stamp" (113)
- "weekTotals: the money counts every boat's hires, not only the boats given" (145)
- "weekTotals: a hire that begins on the day after the week brings no money to it". This answers the remark that 144 was caught only through the gap that 145 shows.
- "weekTotals: open nights are the boats' nights less those sold, below 0 if a list sells a night twice" (142)
- "weekSheet: the boats go by name, whatever their ids" (147)

Expectations added to existing cases:
- Wrong field count: "heron; Okafor; 4; 14; 7;" and "heron;;Okafor;4;14;7" give undefined (212, 232, 262).
- Not a row of digits: "7.0", "1e1", "+7" and "0x7" give undefined (211, 231, 261).
- "place: the request's own problems come first ...": its second call now runs on a fresh book where Okafor's hold still stands. Before, the first call had let that hold go, so there was no clash to look for (057).
- confirm with 15599.9 pence gives "underpaid" (068).
- find(" B0001") gives undefined (153).
- changeBoat to Kestrel leaves depositPence at 10000 (091).
- changeBoat("B0007", "osprey") gives ["no live booking B0007"] (089).
- weekStrip of a lapsed booking is "......." (141).

PG1's own check, /home/build/patch/bookings/set/tasks/PG1/check.test.ts:
- In "gives 0 for a boat with no bookings and for a boat the book does not know", with Okafor's Heron hold in the book, outstanding("heron") is 62150, and outstanding("HERON") and outstanding(" heron") are 0. The ask says 0 for "a boat id the book does not know" (201).

Files:
- Deleted PG1/hollow-adv-001.ts (see Left alone).
- Renamed each mended breach to hollow-<what it gets wrong>.ts. The old-to-new map is in CHANGES.md. Examples: 005 hollow-dayof-trunc, 145 hollow-money-boats, 201 hollow-id-folded. The seven that recur in every task (211-217, 231-237, 261-267) have the same names in all three: hollow-number-loose, -fields-dropped, -empty-span, -move-letgo, -change-letgo, -backwards-zero, -paid-capped.
- Renamed the four files the adversary kept because they came close and still fail: 082 hollow-move-noclash, 144 hollow-week-end, 202 hollow-lapsed-owe, PG2 224 hollow-charge-floored. Their checks are unchanged, except that 144 now also fails the new weekTotals case.
- Wrote /home/build/patch/bookings/set/CHANGES.md.

Checked beyond the three commands:
- My single-process vitest run of every answer showed each breach failing on the case meant for it.
- Six more right answers pass the mended checks: the earlier adversary's three other.ts files, the PG3 hedge, a PG3 fraction-first form and a PG2 float form.
- The helper and PG1's check pass tsc --strict.
- No line I added is over 120 columns.
- check-tasks gives 75 ok lines: 3 references, 3 plain, 3 other.ts and 66 hollow files, none failing to load.
- Nothing was committed and nothing under /home/user/Kung-Fu was edited, though running its Python tools may have refreshed bench/__pycache__. My scratch files are in SCRATCH/mend-bookings/.

## tsc_last_line

(no output; exit 0)

## holds_check_last_line

all as they must be

## check_tasks_last_line

window: none; all as they must be

## left_alone

1. Breach 001 (pad2): not mended; its file is deleted. It differs from the module only on money that is not whole pence, such as formatPence(1012.5). There the module itself prints "£10.12.5", which is not money. A check holding that output would hold a fault in place. For whole pence and whole minutes, the module's own terms, both give the same text. The adversary advised the same.

2. Breaches 068, 142, 154 and 216: these differ only on inputs off the module's usual ground, but I pinned them rather than judge them wrong. At each input the module's output is the plain result of its own rule:
- 15599.9 pence is less than the deposit;
- open nights are the boats' nights less those sold;
- a minute count runs on into the next day;
- the berth extra is multiplied by the nights.
No right answer to any of the three tasks changes those functions, so pinning them fails none.

3. PG3 hedge (raw > 1 ? raw / 100 : raw): not mended. It passes every case and is kept in scratch only. On this module it is right on every input, because refundShare gives only 0, 40, 75 or 100. So no check through the module's API can tell it from knowing the fact. Making it fail would need a new step on the refund scale, which changes the module and what PG3 turns on, and no finding requires that. Whoever sorts PG3's region-arm passes should read them for hedges.

4. PG1's region text is its outline text, because the ask writes BookingBook as plain words. This follows the README's rule, and the region arm is not sent beside tasks. No change.

5. 082, 202 and 224 are each caught by only one expectation. They are not breaches, and each expectation tests what the ask or the module says, so I added nothing for them. Only their files were renamed. (144 got a case, because its catch rested on the gap that breach 145 shows.)

6. The module's quirks stay in the module: weekTotals counts money for any boat; move and changeBoat do not let go of run-out holds; cancel closes a run-out hold at the minute given; the berth extra goes negative for days that run backwards. They harm no task, and no finding asks for the module to change. The helper now pins each one as what the module does.

7. Kinds and readings: the adversary found PG1 a true beside task, PG2 a true inside task and PG3 a true leans task, with no ask having two readings and no unfair case. I agree; no change.

8. 030, 060, 063 and 070, which the adversary deleted because no input can tell them from a right answer: I agree, and there is nothing to mend.
