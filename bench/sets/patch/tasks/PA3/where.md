# PA3, leans: `shift`

**The right change.** In `shift`, lines 89 to 95 of `src/moorings.ts`. Now, after it has checked the target berth, it calls `release` and then `assign` with the caller's log (lines 93 and 94), and each of those writes an entry. After the change `shift` writes one entry, `{ day, boatId: boat.id, from: <the old berth's id>, to: toId }`, **at the front of the log**, and writes nothing when it refuses. The reference frees the old berth and fills the new one by hand, and calls `log.unshift(...)`.

**The other declaration.** `assign`, lines 70 to 78. `release`, lines 80 to 87, shows the same thing.

**The fact.** The log is kept newest first: a new entry goes at the front.

**The lines that show it.** Line 76, in `assign`: `log.unshift({ day, boatId: boat.id, from: "", to: berth.id });`. Line 85, in `release`: `log.unshift({ day, boatId, from: berth.id, to: "" });`. The comment at line 22, above `Move`: "The log is kept newest first." `lastMove` (line 98) and `berthOn` (line 103) read the log from the front with `find`.

**What the first lines leave open.** `assign(berths: Berth[], boat: Boat, berthId: BerthId, day: number, log: Move[]): boolean` and `release(berths: Berth[], boatId: string, day: number, log: Move[]): BerthId` say that a log is passed in. They do not say at which end an entry is put. The lines of `shift` show only that it hands its log to both.

**The natural wrong guess.** `log.push(...)`: the new entry at the end, as a log is most often kept. `hollow-guess.ts` is the reference with `push`. The check fails it in "leaves one entry, from the old berth to the new, where the file's other moves go", in "logs it there whatever the day, and leaves the older entries in their places", in "keeps the log in step with the moves made after it" and in "is the boat's last move, and says where the boat lay that day".

**What else a wrong answer is likely to do.**

- Free the old berth by hand and leave `assign` to log the arrival, so that the one entry has `from: ""`. `hollow-from.ts`.
- Call `release` and `assign` as now, then take the two entries from the end of the log and push one. `hollow-popped.ts`. It holds the same wrong guess twice.
- Read "newest first" as day order, not as the front. It may put the entry before the first entry of that day or an earlier one (`hollow-dayorder.ts`), or after the entries of that day (`hollow-afterday.ts`), or put it at the front and then sort the log by day (`hollow-resorted.ts`). The case "logs it there whatever the day, and leaves the older entries in their places" fails all three.
- Call `release` before it has checked the target, so that a refused shift has freed the berth or written to the log.
- Write the whole file anew. `hollow-lost.ts` is the reference with `nightlyFee` rounding the length to the nearest metre.

**One more thing the lines of `shift` do not show.** An answer that frees the old berth by hand must write `boatId = ""`. That `""` stands for a free berth is in the body of `isFree` (line 42) and in the comment at line 18, not in the outline or in `shift`. It is the natural guess for a `boatId: string`, and an answer can go round it by calling `release` and `assign` with a log of its own and then writing the one entry.

**An answer that is right without knowing the fact.** One can call `release` and `assign` on the caller's log, find the two entries they added by comparing with a copy taken before, and put one entry in their place. It lands where they did, so it is right and the check passes it. Such an answer does not know the end. It must still see that the two calls decide it.
