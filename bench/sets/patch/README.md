# The patch set

Sixteen files of a made-up app, and three tasks on each, that each ask for one change to one file. `bench/runs/2026-11-20-patch` says what the set is for. `bench/box.py` reads this directory, and a run names it in its `run.json`.

## Where each part came from

- **`files/`, `checks/helpers-<file>.ts` and `tasks/`:** written on 2026-11-20 by agents of a Fable model, one agent a file, to the brief in `bench/runs/2026-11-20-patch/writers/WRITER.md`. No model has seen them in training.
- **The hollow answers and the mended checks:** for each file, one agent tried to pass each check with a wrong answer, to `writers/ADVERSARY.md`, and another mended what it found, to `writers/MENDER.md`. Twelve files were attacked by agents of the Fable model. Then its usage limit stopped four attacks and fifteen menders, and agents of an Opus model did that work again or finished it, on 2026-11-22. `changes/<file>.md` gives every change a mender made, with the finding it answers, and says where one mender took over from another. The agents' own reports are in `bench/runs/2026-11-20-patch/writers/reports/`.
- **`app/`:** a TypeScript app with no library, made for this set. `checks/vitest.config.ts` and `checks/helpers.ts` are the set's own.

The app is a back office for a yard that hires out canal boats. Each file is one module with no import of any kind.

## The layout of a task

As in `bench/sets/camera`, and four things more:

- **`start.txt`** names a file of `files/`. `box.py` puts it at the path `file.txt` names before the try, so the task changes a file that is there already.
- **`kind.txt`** is `beside`, `inside` or `leans`. The run's note says what each means.
- **`reference.edits.md`** is the reference answer as edits. `bench/holds.py check` requires that they apply to the starting file and give `reference.ts` byte for byte.
- **`holds/`** holds what each arm's reader is given of the file: `name.md`, `outline.md`, `region.md` and `whole.md`. `bench/holds.py make` writes them from the file and the ask, with ast-grep 0.51.2, and `holds.py check` says whether they are still what it would write.

Each task also holds `plain.ts`, the file as it starts; `other.ts`, a right answer written another way; and hollow answers, `hollow-<word>.ts`, each a whole file that is wrong. `box.py check-tasks` requires the reference and `other.ts` to pass, and `plain.ts` and every hollow answer to fail at an assertion. Eleven hollow answers keep the name the attack gave them, `hollow-adv-<n>.ts`: their menders judged each a near miss that the check already failed, and the brief renames only a breach. `where.md` is for the person who sorts failures: what the right change is, where, and what a wrong answer is likely to do.

Each check calls its file's `unchanged`, which pins what the file does now, and skips only the cases the change must alter. So a file written anew from a guess fails it.

## The tasks

| Task | Kind | File | Lines | Hollow answers | Words in the ask | Title |
| --- | --- | --- | ---: | ---: | ---: | --- |
| PA1 | beside | src/moorings.ts | 146 | 14 | 159 | List the berths a boat could take |
| PA2 | inside | src/moorings.ts | 146 | 9 | 118 | Charge the first week of a long stay in full |
| PA3 | leans | src/moorings.ts | 146 | 8 | 130 | Log a shift along the quay as one move |
| PB1 | beside | src/tides.ts | 149 | 15 | 156 | Minutes the lock is open in a stretch of the day |
| PB2 | inside | src/tides.ts | 149 | 13 | 143 | Drop the slivers a closure leaves behind |
| PB3 | leans | src/tides.ts | 149 | 13 | 96 | No plan when the lock is done for the day |
| PC1 | beside | src/tariff.ts | 294 | 19 | 140 | Find the cheapest day to start a hire |
| PC2 | inside | src/tariff.ts | 294 | 15 | 150 | Take the admin fee before the refund rate |
| PC3 | leans | src/tariff.ts | 294 | 16 | 164 | Show the percentage on the discount line |
| PD1 | beside | src/fuel.ts | 293 | 13 | 153 | Fuel drawn by each boat |
| PD2 | inside | src/fuel.ts | 293 | 11 | 140 | One bill line a day |
| PD3 | leans | src/fuel.ts | 293 | 15 | 129 | Join a split draw |
| PE1 | beside | src/rota.ts | 503 | 24 | 123 | Open shifts in a run of days |
| PE2 | inside | src/rota.ts | 503 | 25 | 118 | Approving a swap settles the other requests for the shift |
| PE3 | leans | src/rota.ts | 503 | 26 | 109 | A Sunday allowance on a shift's pay |
| PF1 | beside | src/worklog.ts | 496 | 13 | 135 | Total the parts used across the log |
| PF2 | inside | src/worklog.ts | 496 | 11 | 152 | Let an earlier finisher sign a job off |
| PF3 | leans | src/worklog.ts | 496 | 10 | 139 | Count lateness in yard weeks |
| PG1 | beside | src/bookings.ts | 770 | 45 | 122 | What is still owed on a boat |
| PG2 | inside | src/bookings.ts | 770 | 11 | 103 | A bigger discount for a fortnight or more |
| PG3 | leans | src/bookings.ts | 770 | 10 | 137 | Give part of the deposit back when a hire is cancelled |
| PH1 | beside | src/manifest.ts | 859 | 20 | 153 | Who gets on and off before a leg |
| PH2 | inside | src/manifest.ts | 859 | 15 | 129 | Keep gear of different weights apart |
| PH3 | leans | src/manifest.ts | 859 | 13 | 122 | Show the latest amendment on the sheet |
| PI1 | beside | src/pumpout.ts | 201 | 19 | 159 | Tokens that are about to run out |
| PI2 | inside | src/pumpout.ts | 201 | 15 | 155 | No visits over lunch |
| PI3 | leans | src/pumpout.ts | 201 | 16 | 159 | Only a boat's last few visits |
| PJ1 | beside | src/keys.ts | 254 | 13 | 148 | Count the gear that is out |
| PJ2 | inside | src/keys.ts | 254 | 12 | 137 | Lost keys and damaged lifejackets |
| PJ3 | leans | src/keys.ts | 254 | 16 | 146 | A return entered twice |
| PK1 | beside | src/survey.ts | 394 | 14 | 81 | Count the standing findings by severity |
| PK2 | inside | src/survey.ts | 394 | 15 | 120 | Five minor findings should count as a major one |
| PK3 | leans | src/survey.ts | 394 | 11 | 137 | Say how much cover is left on the certificate line |
| PL1 | beside | src/stoppages.ts | 441 | 21 | 146 | List the days a route is shut |
| PL2 | inside | src/stoppages.ts | 441 | 16 | 154 | Keep a reissued notice in its place on the register |
| PL3 | leans | src/stoppages.ts | 441 | 21 | 120 | Say on the board when a stoppage ends |
| PM1 | beside | src/invoices.ts | 593 | 16 | 121 | Write off what is left on an invoice |
| PM2 | inside | src/invoices.ts | 593 | 18 | 147 | Do not take the same payment twice |
| PM3 | leans | src/invoices.ts | 593 | 12 | 134 | Show each payment on an invoice's statement |
| PN1 | beside | src/parts.ts | 654 | 11 | 169 | Say how many units short a job would be |
| PN2 | inside | src/parts.ts | 654 | 15 | 157 | A free replacement pack must not make a part cheaper |
| PN3 | leans | src/parts.ts | 654 | 12 | 139 | Let the store screen ask for only the latest movements |
| PO1 | beside | src/handover.ts | 863 | 23 | 141 | Say what is holding a handover up |
| PO2 | inside | src/handover.ts | 863 | 23 | 78 | Charge a very late return more |
| PO3 | leans | src/handover.ts | 863 | 23 | 141 | End the report with the latest events |
| PP1 | beside | src/notices.ts | 992 | 17 | 147 | List what a booking is still waiting for |
| PP2 | inside | src/notices.ts | 992 | 20 | 169 | Let a template give a fallback for a field |
| PP3 | leans | src/notices.ts | 992 | 14 | 145 | Give the sender nothing in quiet hours |

777 hollow answers in all. Lines are counted by `wc -l`, words by `wc -w`, the title line included.

## What has been checked

On 2026-11-22, after the files were gathered here:

- `python3 bench/holds.py make bench/sets/patch`, then `python3 bench/holds.py check bench/sets/patch`, ended `all as they must be`. No first line the outline shows is cut. Six `beside` tasks have a region text that is their outline text, because the ask names nothing the file declares: PB1, PC1, PG1, PH1, PJ1, PK1.
- `python3 bench/box.py check-tasks bench/sets/patch --window none` was running when this was first committed. Its last line is given here when it ends.

One input of a check was changed after the menders, on 2026-11-22: `changes/notices.md` says which and why.

## What is known to be open

- **Most `inside` tasks can be passed from the outline alone, by a way round:** keep the old body under a new name and call it from a new declaration of the old name. The run's note says what that changes and how such passes are counted. Each such task's `where.md` says how to read a pass of this shape.
- **The check runs the code and does not check its types.** A patch that breaks the file's types and behaves right passes.
- **Some `leans` tasks have a way round the fact too,** such as asking another function at run time. Their `where.md` names it.
