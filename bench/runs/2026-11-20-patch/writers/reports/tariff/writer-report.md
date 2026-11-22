Module `tariff` and tasks PC1, PC2, PC3 are written in /home/build/patch/tariff/set, and every command in the brief ends as it must. Nothing was committed and nothing under /home/user/Kung-Fu was edited.

## The module: /home/build/patch/tariff/set/files/tariff.ts

294 lines by `wc -l`. No import, no clock, no random number, four spaces, no line over 120 columns, every function header on one line. The outline shows no first line with a bracket left open.

**Exports**
- Types: `BoatClass`, `SeasonName`, `PaymentKind`, `Season`, `Hire`, `QuoteLine`, `Quote`, `Payment`.
- Constants: `DAYS_IN_YEAR`, `BOAT_CLASSES`, `SEASONS`.
- Functions: `seasonOn`, `nightlyRate`, `nightsBySeason`, `longHireRate`, `petSupplement`, `formatPence`, `quoteHire`, `addExtra`, `quoteText`, `depositDue`, `recordPayment`, `paidSoFar`, `lastPayment`, `securedOn`, `balanceDue`, `refundRate`, `refundDue`.
- Not exported: `wrapDay`, `daysUntil`, `inSeason`, `share`, three interfaces, and the tables and constants for prices, bonds, bands, refund steps, deposit terms, cap, fee and minimum.

**Conventions a guess would get wrong, and where each shows**

| Convention | Where it shows |
| --- | --- |
| A season includes `fromDay` and not `toDay`; the low season runs over the new year | body of `inSeason`, lines 120-125 |
| Days are days of the year from 1; day 366 is day 1, day 0 is day 365 | body of `wrapDay`, line 112 |
| Notice in days is never negative; an earlier-looking day is next year | body of `daysUntil`, lines 116-117 |
| Rates are tenths of a percent, and a part of a penny is dropped | body of `share`, line 152; comment directly above `longHireRate`, line 155 |
| The ledger is newest first | body of `recordPayment` (`unshift`, line 239); bodies of `lastPayment` and `securedOn` |
| `recordPayment` changes the ledger it is given, and leaves out a payment of nothing or less | its body, lines 238-240 |
| A refund is entered as a positive amount and counted against what was paid | body of `paidSoFar`, line 247 |
| 0 stands for "none" (`securedOn` with no deposit, `longHireRate` for a short hire) | bodies, and the comments above them |
| `addExtra` changes the quote, and a reduction stops at a total of nothing | its body, lines 213-217 |
| The discount is on the boat alone, capped at 50000 pence; pets are charged for at most seven nights | bodies of `quoteHire` and `petSupplement` |
| The bond is never in the total; the deposit is a quarter, floored at 10000, never more than the total | bodies of `quoteHire` and `depositDue` |
| The admin fee is a tenth of what was paid, up to 2500 | body of `refundDue`, lines 289-290 |
| A minus sign goes before the pound sign | body of `formatPence` |

All but the last line of the 0-for-none row are visible only in a body. No first line shows any of them, and the outline shows no value of any rate.

## The helper: /home/build/patch/tariff/set/checks/helpers-tariff.ts

`unchanged(mod, skip)` registers 74 cases with distinct names. It pins every export, with two or more cases for each function. It throws if `skip` names a case that does not exist.

I ran 68 one-line changes of the module against it. 65 fail. The other three do exactly what the module does: two touch a fallback that is never reached, and one removes a guard the later lines repeat.

## The tasks

**PC1, beside: "Find the cheapest day to start a hire".** Adds `cheapestStart(boatClass, nights, fromDay, toDay)`.
- It turns on what the outline shows: `quoteHire(hire: Hire): Quote`, the four members of `Hire`, and `Quote.totalPence`.
- The ask states the two facts the outline does not: both ends of the span are tried, and days may run past the end of the year and are returned as given.
- The reference edit has an empty SEARCH.
- Hollow answers: `latest` (latest of several cheapest days), `open` (stops before `toDay`), `lost` (`recordPayment` appends).

**PC2, inside: "Take the admin fee before the refund rate".** Changes `refundDue` from `share(paid, rate) - fee` to `share(paid - fee, rate)`.
- It turns on the body: the rule for the fee is only there, so a `refundDue` written anew from the outline and the ask takes 2500 from everyone and fails.
- The check skips the six unchanged `refundDue` cases at half and at a quarter.
- Hollow answers: `twice` (fee taken before and after), `scaled` (`share(paid, rate) - share(fee, rate)`, a penny over in some cases), `lost` (`inSeason` includes `toDay`).

**PC3, leans: "Show the percentage on the discount line".** Changes the label in `quoteHire` to `Long hire discount (N%)` with N = `rate / 10`.
- The other declaration is `longHireRate(nights: number): number`. The fact is that it returns tenths of a percent.
- The fact shows in the comment directly above it, in the body of `share`, and in the bands table. None of these is in the outline or in the lines of `quoteHire`.
- The natural wrong guess is that the rate is a percentage: `hollow-guess.ts` writes `(100%)` for 10%.
- Other hollow answers: `fixed` (`10.0%`), `worked` (percentage worked back from the two amounts, wrong once the cap bites), `lost` (`addExtra` without its stop at nothing).
- The check skips one unchanged case, the only one that pins the label.

Each `where.md` says the right change, where it is, and what wrong answers are likely.

## Attacks on the checks

Beyond the hollow answers, I ran 37 other answers against the three checks. The 10 right answers written another way all pass. The 26 wrong ones all fail at an assertion. One more, a PC1 answer that quotes with one pet, passes; that is the first item under "not sure of" below. Every `hollow-lost` fails only through `unchanged`.

## Last line of each command

- `tsc` on the module and on each `reference.ts`: no output, exit 0.
- `holds.py make`: `3 tasks: name, outline, region, whole written for each`
- `holds.py check`: `all as they must be`
- `box.py check-tasks W --window none`: `window: none; all as they must be`
- `holds.py sizes`: `PC3   leans          294       115      3361      4724      9919   quoteHire`

Sizes in bytes: name 115, outline 3361, region 3361 (PC1), 4065 (PC2), 4724 (PC3), whole 9919.

## Rules of the brief

All were kept. Two choices went beyond the brief:
- PC2 and PC3 have a third hollow answer each, and PC1 has `hollow-open`.
- Midway I added the discount cap and the tenth-of-what-was-paid fee to the module, to close two ways of passing without holding what the task is meant to need. Every task file was remade from the final module after that.

## Unsure

1. PC1: the ask says "with no pets", and the check cannot tell. The pet supplement is the same for every start day, so an answer that quotes with pets picks the same day and passes.

2. PC3 can be passed without holding the fact, by one route I know: `share(10000, rate) / 100` gives the percentage whatever the unit is. It does what the ask says, so the check passes it, and `where.md` names it. A `region` reader who writes it has not guessed the unit. I think a small model is unlikely to; a ceiling model might. The commoner dodge, working the percentage back from the two amounts, fails since I added the cap (`hollow-worked.ts`).

3. PC3's ask gives 7.5% as an example. It does not say the unit of the rate, but it tells a reader that rates are not all whole percents, which may make a careful `region` reader doubt the plain percentage guess.

4. PC2: `hollow-scaled.ts` differs from the reference by one penny, and only when the fee's share has a part of a penny. I count it wrong because the ask says the part is worked out on what is left and that a part of a penny is dropped. Whoever sorts failures may see that as strict.

5. PC2 from the outline alone: a reader can quote the first line of `refundDue`, which the outline shows whole, and write the function anew. The fee's rule is only in the body, so such an answer fails on small payments. I tested that with a flat-fee variant. I did not have a model try it.

6. The outline prints constants that are not exported without `const` and without the semicolon, and interface members with two spaces and no semicolon. That is the tool's output. A `beside` answer that quotes such a line as it is printed would be refused. PC1's reference avoids it with an empty SEARCH.

7. Three of my 68 one-line changes to the module pass the helper because they change nothing the module does. The module therefore holds a little dead code: the fallback `return "low"` in `seasonOn`, and the `paid <= 0` guard in `refundDue`. I left both as a developer would.

8. No fresh reader and no model has tried these tasks. I read the held texts myself as the reader would; the attack and the ceiling are still to come.

9. `tariff.ts` holds the pound sign, a non-ASCII character, in `formatPence` and `quoteText`. The bench read it without trouble here.