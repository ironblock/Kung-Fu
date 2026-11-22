Module `pumpout` and tasks PI1, PI2, PI3 are written in /home/build/patch/pumpout/set, and every command in the brief ends as it must. Nothing was committed and nothing under /home/user/Kung-Fu was edited.

## The module

/home/build/patch/pumpout/set/files/pumpout.ts is 201 lines (`wc -l`). It has no import, four-space indent, no line over 120 columns, and every function header on one line. The outline shows 0 first lines cut.

**Exports**
- Types: `Service`, `Visit`, `Waiting`, `TokenBatch`, `Wallet`, `Payment`.
- Constants: `OPENS` 510, `CLOSES` 1010, `SLOT_MIN` 20, `TOKEN_PENCE` 850, `TOKEN_LIFE_DAYS` 180, `NO_START` -1.
- Functions: `lengthOf`, `endOf`, `clock`, `nextStart`, `joinQueue`, `leaveQueue`, `waitFor`, `liveTokens`, `topUp`, `spend`, `settle`, `record`, `visitsOf`, `takings`, `serve`.
- Not exported: the tables `SLOTS`, `TOKENS`, `DESK_PENCE`, and the helper `isLive`.

**Conventions a guess would get wrong, and where each shows**
1. The log is newest first. Body of `record` only (line 171, `log.unshift`).
2. A visit holds the point from its start up to, not including, its end, and may end exactly at closing. Body of `nextStart` only.
3. Starts sit on a slot grid counted from opening time (510, 530, ...), not from midnight. Body of `nextStart` only.
4. A token is good from the day bought up to, not on, the day 180 later, and not before the day bought. Body of `isLive` only.
5. `lengthOf` returns slots, not minutes. Body only, though the outline does show the table's name `SLOTS` and its values.
6. "None" values: `nextStart` returns `NO_START` (-1); `clock` shows it as `--:--`; a visit's `tokens` of 0 means paid at the desk; `waitFor` gives a boat that is not waiting a newcomer's wait. All in bodies or a comment; only the constant itself is in the outline.
7. Functions that change their argument: `joinQueue`, `leaveQueue`, `topUp`, `spend`, `settle`, `record`, `serve`. Bodies only.
8. `spend` is all or nothing, takes from the oldest live batch first, drops a batch it empties and keeps a dead one. Body only.
9. `topUp` returns pence, every tenth token of one purchase is free, a same-day purchase joins the last batch, batches are oldest first. Body only.
10. `joinQueue` returns the number of boats ahead (from 0); asking again keeps place and time, and a different service makes it "both". Body only.
11. `settle` never mixes tokens and money. Body only.
12. Money in pence, times in minutes from midnight. Shown by names (`paidPence`, `TOKEN_PENCE`) and by `OPENS = 510`.

## The regression helper

/home/build/patch/pumpout/set/checks/helpers-pumpout.ts registers 62 named cases, at least two for each function. It throws if two cases share a name or if `skip` names a case that does not exist. I applied 46 single guesses at a body to the module (one per convention and edge) and it failed all 46.

## The tasks

| Id | Kind | Title | What it turns on |
| --- | --- | --- | --- |
| PI1 | beside | Tokens that are about to run out | Adds `expiringSoon(wallet, day, within)`. The ask states the token-life rule, since it is only in `isLive`'s body. The reference is one edit with an empty SEARCH. |
| PI2 | inside | No visits over lunch | `nextStart` must pass over starts whose visit overlaps minutes 750 up to, not including, 790. It needs the loop's grid, the open-ended overlap test and `NO_START`. Two `unchanged` cases are skipped, the two whose answers were starts inside the closure. |
| PI3 | leans | Only a boat's last few visits | `visitsOf` gets an optional `latest`. A right answer takes the top of the log, because `record` adds at the front. The ask says "recorded most recently" goes by entry into the log, not by day or time, so sorting by time is wrong. The natural wrong guess is the end of the list. |

Hollow answers, each failing at an assertion:
- **PI1:** `lost` (`record` pushes), `edge` (good on the day its life is up), `future` (counts a batch bought after the day), `difference` (`liveTokens(day) - liveTokens(day + within)`).
- **PI2:** `lost` (`joinQueue` replaces the service), `edge` (closure shut at both ends), `startonly` (looks only at the start).
- **PI3:** `lost` (`nextStart` grid from midnight), `guess` (end of the list), `bytime` (sorts by day and start), `zero` (treats 0 as not given).

Each `lost` fails only through `unchanged`; the others fail only in the new-behaviour cases. `hollow-difference` came from my own attack on the PI1 check: that answer passed until I added a case for a batch bought after the day and still good on the day looked ahead to.

## Last line of each command

- `tsc --strict` on the module: no output, exit 0. The same for each `reference.ts` and every hollow file. Each check, with the helper, also type-checks against its reference.
- `holds.py make`: `3 tasks: name, outline, region, whole written for each`
- `holds.py check`: `all as they must be`
- `box.py check-tasks --window none`: `window: none; all as they must be`
- `holds.py sizes`: `PI3   leans          201       116      2551      2719      7138   visitsOf`

Sizes in bytes for all three: name 116, outline 2551, whole 7138; region is 2640 (PI1), 3363 (PI2), 2719 (PI3).

No rule in the brief had to be broken.

Files are in /home/build/patch/pumpout/set:
- files/pumpout.ts
- checks/helpers-pumpout.ts
- tasks/PI1, tasks/PI2, tasks/PI3

## Unsure

1. PI2's ask gives the closure in minutes as well ("from 750 up to but not including 790"). The file shows the unit only by `OPENS = 510` and `clock`'s body, and I judged a region reader should not have to infer it. It tells the reader one of the module's conventions.
2. PI3's ask says in plain words that every visit gets into the log "through this module's own function for recording one". It does not name `record` in a code span and does not say the order, but it is a pointer. Without it the ask gives no reason to look at another declaration.
3. PI3 for a reader holding only the region is one guess between two ends of a list. Such a reader can pass by luck about half the time; the task cannot tell that from knowing.
4. The outline prints the non-exported tables with their values (`SLOTS`, `TOKENS`, `DESK_PENCE`), so `lengthOf`'s unit and the prices are half visible there. No task leans on them.
5. PI1's ask puts `TOKEN_LIFE_DAYS` in a code span, so its region text is the outline plus that one line. The brief does not send `region` a `beside` task, so this should not matter.
6. The checks ask nothing about a `within` or a `latest` below 0, or whether `visitsOf` returns a new list; the asks do not say. `where.md` notes this for PI1 and PI3.
7. `CLOSES` is 1010 (16:50), not a round hour, so that closing falls on the slot grid counted from 08:30.