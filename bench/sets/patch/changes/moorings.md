# Changes to `moorings` and its three tasks

The findings are the adversary's, in `/home/build/patch/moorings/findings.md`. A breach is named by its task and the file the adversary filed it as, `hollow-adv-<n>.ts`. The name after the arrow is what that file is called now.

**Another mender took over here.** Written by Claude Opus 5.5 on 2026-11-22. The mender before me was stopped by a usage limit. It left no line in this file, so there were no earlier lines to keep. It did leave changes in W. It had saved a copy of W as it found it, in `SCRATCH/mend-moorings/before`, and I found its changes by comparing that copy with W. When I began, `check-tasks` ended `window: none; all as they must be` and `holds.py check` ended `all as they must be`. I ran each renamed file on the checks as they were in that copy and as they are now. Each of the 14 breaches passed then and fails now, at the case named below. Each renamed file is the adversary's, byte for byte. The first part below lists the earlier mender's changes, in my words. The second part lists mine.

The module `files/moorings.ts` did not change. No `plain.ts`, `reference.ts`, `reference.edits.md` or `other.ts` changed. The PA2 and PA3 asks did not change.

## Changes the mender before me made

### `checks/helpers-moorings.ts`: 12 cases added to `unchanged`, from 52 to 64

- New case "bestBerth: goes by length alone, and takes the shorter berth though it is the wider". Answers PA1 adv-5 → `hollow-bestarea.ts`.
- New case "bestBerth: of berths of one length and unlike beams, still takes the one that comes first". Answers PA1 adv-6 → `hollow-bestbeam.ts`, and fails adv-5 too.
- New case "bestBerth: the berth the boat lies at is taken, like any other". Answers PA1 adv-7 → `hollow-bestown.ts`.
- New case "quayLoad: changes neither the list nor any berth in it". Answers PA1 adv-8 → `hollow-loadsorts.ts`.
- New case "berthOn: goes by place in the log and not by day". Answers PA2 adv-1 → `hollow-byday.ts`.
- New case "assign: writes the move at the front of the log, whatever its day". Answers PA2 adv-2 → `hollow-assignday.ts`. It also pins what PA3's new case rests on, as the adversary asked.
- New case "boardLine: changes neither the berth nor the list of boats". Answers PA2 adv-3 → `hollow-boardsorts.ts`.
- New case "release: writes the move at the front of the log, whatever its day". Answers PA3 adv-3 → `hollow-releaseday.ts`.
- New case "shift: writes its two entries at the front of the log, whatever their day". Answers the module's hole (2), "no log is out of day order ... for `berthOn`, `assign`, `release`, and PA3's `shift`", for PA1 and PA2, where `shift` must stay as it is. No kept file breached it. The earlier mender's probe, the PA1 reference with `shift` writing its two entries in day order (`scratchpad/mend-moorings/p/pa1-shiftday.ts`), passed the PA1 check before and fails this case now.
- New case "berthOf: changes neither the list nor any berth in it". Answers the module's hole (3), "`quayLoad`, `boardLine`, `berthOf`, `lastMove` and `berthOn` are never tested for leaving their arguments alone". No breach was filed for it.
- New case "lastMove: changes no entry of the log, nor their order". Answers the same hole (3).
- New case "berthOn: changes no entry of the log, nor their order". Answers the same hole (3).

### PA1

- `ask.md`: a new sentence, "Whether the boat already lies at a berth makes no difference: the berth it lies at is not free, and the others count as they would for any boat." Answers PA1's "ask with two readings (mild)" on "the berths the boat could be given right now". The ask is 159 words with its title.
- `check.test.ts`: new case "gives the same berths for a boat that lies at a berth already, and takes its berth as taken", with the boat `kestrel` on `quay()`. Answers PA1 adv-2 → `hollow-berthed.ts` and adv-3 → `hollow-ownberth.ts`.
- `check.test.ts`: new case "goes by length alone, and puts a shorter berth first though it is the wider". Answers PA1 adv-4 → `hollow-area.ts`.
- `check.test.ts`: "keeps berths of one length in the order the list has them" gains two berths of one length and unlike beams, W then N. Answers PA1 adv-1 → `hollow-beamtie.ts`, and fails adv-4 too.
- `hollow-adv-1.ts` → `hollow-beamtie.ts`, `hollow-adv-2.ts` → `hollow-berthed.ts`, `hollow-adv-3.ts` → `hollow-ownberth.ts`, `hollow-adv-4.ts` → `hollow-area.ts`, `hollow-adv-5.ts` → `hollow-bestarea.ts`, `hollow-adv-6.ts` → `hollow-bestbeam.ts`, `hollow-adv-7.ts` → `hollow-bestown.ts`, `hollow-adv-8.ts` → `hollow-loadsorts.ts`. Answers each breach.
- The near miss `hollow-adv-9.ts` → `hollow-idtie.ts`. Answers "Near miss kept".

### PA2

- `hollow-adv-1.ts` → `hollow-byday.ts`, `hollow-adv-2.ts` → `hollow-assignday.ts`, `hollow-adv-3.ts` → `hollow-boardsorts.ts`. Answers each breach. All three were holes in the helper, so `check.test.ts` did not change.
- The near miss `hollow-adv-4.ts` → `hollow-capped.ts`. Answers "Near miss kept".

### PA3

- `check.test.ts`: new case "logs it there whatever the day, and leaves the older entries in their places", the adversary's case. Answers PA3 adv-1 → `hollow-dayorder.ts` and adv-2 → `hollow-resorted.ts`. It rests on the ask's "logged in the same way as every other move", which now means "at the front" because the helper pins that `assign` and `release` log at the front whatever the day.
- `check.test.ts`: `unchanged` now also skips "shift: writes its two entries at the front of the log, whatever their day", which this change must alter. Follows from the helper's new `shift` case.
- `hollow-adv-1.ts` → `hollow-dayorder.ts`, `hollow-adv-2.ts` → `hollow-resorted.ts`, `hollow-adv-3.ts` → `hollow-releaseday.ts`. Answers each breach.
- The near miss `hollow-adv-4.ts` → `hollow-afterday.ts`. Answers "Near miss kept". It now fails the new case too.

## My changes

- `tasks/PA2/where.md`: a new paragraph, "An answer from the outline alone that passes". It says that the adversary's outline-only answer passes all 68 cases with `Math.floor` and fails two with `round` or `ceil`, and that an `outline-1` pass on PA2 must be read for whether it guessed three facts of the body. Answers PA2's "Kind: an `inside` task, but thin", by its first way: "accept that and note it in `where.md`". The task is kept as it is; see "Left alone" for why.
- `tasks/PA3/where.md`: the sentence on `hollow-guess.ts` now names all four cases that fail it, with "logs it there whatever the day, and leaves the older entries in their places". Follows from the PA3 check's new case: the sentence named three.
- `tasks/PA3/where.md`: a new item names `hollow-dayorder.ts`, `hollow-afterday.ts` and `hollow-resorted.ts`, and the case that fails them. Answers PA3 adv-1 and adv-2, the wrong guess "in another form", and the kept near miss.
- `tasks/PA1/where.md`: a new item names `hollow-berthed.ts` and `hollow-ownberth.ts`, says that `assign` can lead a reader of the whole file to them, and names the case that fails both. Answers PA1's "ask with two readings" and PA1 adv-2 and adv-3.
- `CHANGES.md`: this file.
- `holds.py make` run again. Answers nothing; the brief asks for it after the last change.

## Left alone, and why

- **PA2, its kind.** The adversary offered a second way: make the change need more of the body. I did not take it. Written in place, the change needs the body: an edit quoting line 120 cannot be written from the outline. A reader who holds only the outline can still pass by putting a whole new function in place of the first line. Then it must guess three facts of the body, and the natural guess for money, the nearest penny, is wrong. That way round is open in any `inside` task. Closing it would change what the task turns on, and the brief says not to unless a finding requires it. This one does not. `where.md` now says how to read such a pass.
- **PA1, the outline prints interface members and constants not as the file has them.** The adversary says this is the tool's and not the writer's. The outline has no author (`README.md`, "The outline has no author"). A right answer can use an empty SEARCH or quote a function's first line, as the reference does.
- **PA2, two answers that pass and are not wrong.** These are rounding the whole bill and not the discount, and `Math.floor(later / LONG_STAY_OFF)`. On this module they give the same as the reference for every input the ask covers. No check that runs the code can fail them, and the adversary did not keep them.
- **PA3, `berths.find((b) => b.boatId === boat.id)` in place of `berthOf`.** Not pinned, as the adversary advised. A case for it would make PA3 lean on a second body the `region` reader cannot see, the guard in `berthOf`.
- **The module, `assign` with a boat whose id is `""`.** Not pinned, as the adversary advised. It is an oddity of the module, not a fault for the run, and pinning it would pin the oddity.
- **The passing variants the adversary did not keep.** These are `berthOf` giving the last berth, `release` freeing every berth, `metres` rounding first, `boardLine` with an empty name, `nightlyFee` with a least charge, PA1 lengths compared as text, ids that are `""` or repeated, a tie broken by spare beam, a PA3 shift that drops an earlier shift of the day, and the answers equal in behaviour. They differ only where the module's own rules are already broken (one boat at two berths), on inputs no ask speaks of, or not at all. Each one is the adversary's judgement, and I agree with it.
