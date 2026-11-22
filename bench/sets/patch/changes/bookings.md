# Changes made by the mender, module `bookings`

Written by Claude Opus 5.5 on 2026-11-22, from the adversary's findings on PG1, PG2 and PG3. The module, the
asks, `plain.ts`, the references and their edits, `where.md` and every `other.ts` are unchanged. The numbers are
the adversary's file numbers, `hollow-adv-<n>.ts`.

## The regression helper, `checks/helpers-bookings.ts`

Each line is one case added, or one expectation added to a case, and the breach it fails. No task's skip list
names a case that changed. 152 cases became 182.

- New case "stampOf: minutes past the end of a day run on into the next": `stampOf(0, 1440)` is 1440. Answers 154.
- New case "dayOf: a stamp before day 0 is in a day before 0": `dayOf(-1)` is -1. Answers 005.
- New case "minuteOf: a stamp before day 0 counts from that day's midnight": `minuteOf(-1)` is 1439. Answers 006.
- New case "formatDay: days before day 0 fall in week 0 and earlier": `formatDay(-1)` is "Fri wk0". Answers 007.
- New case "formatStamp: only NEVER is a dash, and other stamps before day 0 print as times": `formatStamp(-2)` is "Fri wk0 23:58". Answers 010.
- New case "daysOverlap: a span of no days inside a hire still touches it, one at its edge does not": `daysOverlap(70, 77, 72, 72)` is true. Answers 213, 233 and 263.
- New case "validateRequest: a size that is not whole is not also measured against the berths": 4.5 people on Heron give only the whole-number problem. Answers 019.
- New case "validateRequest: a day before day 0 has its weekday as any other day does": a week from day -5, a Monday, has no problem. Answers 025.
- New case "hireCharge: days that run backwards bring the berth extra below zero": `hireCharge(KESTREL, 72, 70)` is -2800. Answers 216, 236 and 266.
- New case "sortForDiary: on one day the boat comes before the booking number": teal B0001 and heron B0002 sort as B0002, B0001. Answers 037.
- New case "quoteFor: for a hire early in the season the balance falls due before day 0": `quoteFor(HERON, 14, 17)` has balanceDueDay -14. Answers 039.
- New case "book: of two boats with one id, the later is kept": the later boat's berths decide. Answers 150.
- New case "book: keeps the caller's boats, not copies of them": a change to the caller's boat after the book is made counts. Answers 151.
- New case "confirm: more than the charge is written down as paid too": 70000 handed over is 70000 paid. Answers 217, 237 and 267.
- New case "confirm: a hold that has run out is let go, however little is handed over": 100 pence at S(50, 0) gives "lapsed". Answers 067.
- New case "cancel: a lapsed hold gives 0 and stays lapsed". Answers 166.
- New case "cancel: a hold past its minute that nothing has let go yet is cancelled at the minute given": cancelled at S(50, 0), not left held. Answers 167.
- New case "move: a hire that costs more on its new days keeps the deposit it was placed with": Kestrel moved from 72 to 76 keeps 14200. Answers 080.
- New case "move: to the day it begins already, the move is still noted and recorded". Answers 086.
- New case "move: a hold moved nearer its days keeps the minute it runs out": moved to day 44, it still runs out at S(42, 600). Answers 087.
- New case "move: a hold past its minute that nothing has let go yet can still be moved": at S(45, 0) the move gives []. Answers 214, 234 and 264.
- New case "changeBoat: a hold past its minute that nothing has let go yet can still change boat": at S(45, 0) the change gives []. Answers 215, 235 and 265.
- New case "addNote: a closed booking still takes a note". Answers 096.
- New case "waitingFor: the queue is in the order parties joined, whatever stamp they carry". Answers 102.
- New case "waitingFor: hands back the book's own entries". Answers 104.
- New case "history: in the order the book came to know of things, not by stamp": a lapse noticed after a payment is listed before it. Answers 113.
- New case "weekTotals: the money counts every boat's hires, not only the boats given": `weekTotals(sample(), [HERON], 70)` charges 154950. Answers 145.
- New case "weekTotals: a hire that begins on the day after the week brings no money to it": the week from 63 counts only Okafor's hire from 63. Answers the remark on 144, that it was caught only through the gap 145 shows.
- New case "weekTotals: open nights are the boats' nights less those sold, below 0 if a list sells a night twice": nightsOpen is -7. Answers 142.
- New case "weekSheet: the boats go by name, whatever their ids": Alder (id zz) comes before Birch (id aa). Answers 147.
- Case "parseRequestLine: undefined for a line with the wrong number of fields or an empty name": added "heron; Okafor; 4; 14; 7;" and "heron;;Okafor;4;14;7". Answers 212, 232 and 262.
- Case "parseRequestLine: undefined when a number is not a row of digits": added "7.0", "1e1", "+7" and "0x7" as the last field. Answers 211, 231 and 261.
- Case "place: the request's own problems come first, then the day, and no clash is looked for among them": its second call now runs on a fresh book where Okafor's hold still stands. Before, the first call had let that hold go, so there was no clash to look for. Answers 057.
- Case "confirm: less than the deposit leaves the hold as it was": added 15599.9 pence, which is "underpaid". Answers 068.
- Case "find: gives the book's own booking, or undefined": added `find(" B0001")`, which is undefined. Answers 153.
- Case "changeBoat: the other boat must sleep the party and be free": added that the deposit stays 10000 after the move to Kestrel. Answers 091.
- Case "changeBoat: an unknown booking, an unknown boat, and the boat it is on already": added `changeBoat("B0007", "osprey")`, which names the booking. Answers 089.
- Case "weekStrip: the day a hire ends is free, and closed bookings leave no mark": added a lapsed booking, which leaves ".......". Answers 141.

## PG1's own check, `tasks/PG1/check.test.ts`

- Case "gives 0 for a boat with no bookings and for a boat the book does not know": with Okafor's Heron hold in the book, `outstanding("heron")` is 62150, and "HERON" and " heron" give 0, as the ask says of "a boat id the book does not know". Answers 201.

## Files

- Deleted `tasks/PG1/hollow-adv-001.ts`. It is not mended, for the reason given under "Left alone".
- Renamed each breach that now fails, as `hollow-<what it gets wrong>.ts`:
  - PG1: 005 `hollow-dayof-trunc`, 006 `hollow-minuteof-mod`, 007 `hollow-week-trunc`, 010 `hollow-stamp-dash`, 019 `hollow-berths-fraction`, 025 `hollow-weekday-mod`, 037 `hollow-diary-id-first`, 039 `hollow-due-clamped`, 057 `hollow-clash-always`, 067 `hollow-underpaid-first`, 068 `hollow-underpaid-halfpenny`, 080 `hollow-move-deposit`, 086 `hollow-move-sameday`, 087 `hollow-move-lapsesat`, 089 `hollow-boat-checked-first`, 091 `hollow-change-deposit`, 096 `hollow-note-closed`, 102 `hollow-queue-sorted`, 104 `hollow-queue-copies`, 113 `hollow-history-sorted`, 141 `hollow-strip-lapsed`, 142 `hollow-open-clamped`, 145 `hollow-money-boats`, 147 `hollow-sheet-by-id`, 150 `hollow-boat-first-kept`, 151 `hollow-boats-copied`, 153 `hollow-find-trims`, 154 `hollow-minute-wraps`, 166 `hollow-cancel-lapsed`, 167 `hollow-cancel-runout`, 201 `hollow-id-folded`.
  - The same seven in each task: 211, 231, 261 `hollow-number-loose`; 212, 232, 262 `hollow-fields-dropped`; 213, 233, 263 `hollow-empty-span`; 214, 234, 264 `hollow-move-letgo`; 215, 235, 265 `hollow-change-letgo`; 216, 236, 266 `hollow-backwards-zero`; 217, 237, 267 `hollow-paid-capped`.
- Renamed the four files the adversary kept because they came close and failed. Their checks are unchanged, except
  that 144 also fails the new weekTotals case above: PG1 082 `hollow-move-noclash`, 144 `hollow-week-end`,
  202 `hollow-lapsed-owe`; PG2 224 `hollow-charge-floored`.

## Left alone

- **001, pad2.** Not pinned. Its file is deleted. It differs from the module only on money that is not whole pence,
  such as `formatPence(1012.5)`. There the module itself prints "£10.12.5", which is not money. A check that held
  that output would hold a fault in place. Every input in the module's own terms, whole pence and whole minutes,
  gives the same text in both. The adversary advised the same.
- **068, 142, 154 and 216 are pinned, although they differ only off the module's usual ground.** At each of these
  inputs the module's output is the plain result of its own rule: 15599.9 pence is less than the deposit; open
  nights are the boats' nights less those sold; a minute count runs on; the berth extra is times the nights. No
  right answer to any of the three tasks changes those functions, so pinning them fails none.
- **The PG3 hedge** (`raw > 1 ? raw / 100 : raw`) passes every case, and is kept in scratch only. On this module it
  is right on every input, because `refundShare` gives only 0, 40, 75 or 100, so no check of behaviour can tell it
  from knowing the fact. Making it fail would need a new step on the scale, which changes the module and what PG3
  turns on, and no finding requires that. Whoever sorts PG3's region-arm passes should read them for hedges.
- **PG1's region text is its outline text,** because the ask writes BookingBook as plain words. This follows the
  README's rule, and the region arm is not sent `beside` tasks.
- **082, 202 and 224 are each caught by one expectation.** They are not breaches, and each expectation tests what
  the ask or the module says, so I added nothing for them.
- **The module's quirks** (money in `weekTotals` for any boat; `move` and `changeBoat` not letting go of run-out
  holds; `cancel` closing a run-out hold at `at`; a negative berth extra for days that run backwards) are left in
  the module. They harm no task, and no finding asks for the module to change. The helper now pins each one as
  what the module does.
- **The kinds.** The adversary found each task true to its kind and each ask with one reading, and I agree. No
  change.
- **030, 060, 063 and 070,** which the adversary deleted because no input can tell them from a right answer: I
  agree, and there is nothing to mend.
