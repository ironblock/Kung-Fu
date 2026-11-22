## changes

The earlier mender (Claude Fable 5.2) had made and recorded every change before the usage limit stopped it. I changed no file except /home/build/patch/keys/set/CHANGES.md. There I kept its lines as they were and added mine below "## Another mender took over here". I checked every line below against the files and the per-case results.

From the earlier mender's lines in CHANGES.md:

Twelve new cases in checks/helpers-keys.ts, one for each regression gap:
- "settle keeps the late fee when all is back, but late" (PJ1 adv-1, PJ3 adv-4)
- "issue still issues to a loan that has been settled" (PJ1 adv-2)
- "issue counts and logs an issue entered twice for one day and minute" (PJ2 adv-5, PJ3 adv-3)
- "issueKeys still gives keys to a loan that has been settled" (PJ3 adv-5)
- "issueKeys gives a new tag once the last key of the old one is back" (PJ2 adv-2)
- "takeBack still takes gear back from a loan that has been settled" (PJ2 adv-1, PJ3 adv-2)
- "takeBack keeps the newest 40 entries of the log, as issue does" (PJ1 adv-5, PJ3 adv-1)
- "keyHolder gives the first loan in the list when two open loans have one tag" (PJ1 adv-3, PJ3 adv-6)
- "openLoan keeps a space inside the booking reference" (PJ1 adv-4)
- "standardKit for the smallest boats still has two windlasses and three pins" (PJ2 adv-3)
- "isOpen is false for a settled day below 0: only 0 stands for not settled" (PJ2 adv-4)
- "summary counts a damaged item of a kind that has nothing still out" (PJ1 adv-16)

PJ1 check:
- New case "counts each of two loans that have the same booking reference" (adv-10).
- The case "changes neither the loans nor the list" now has the first loan's lines in the order issued (mallet first), not the order of ALL_KINDS, plus a third open loan with no lines (adv-11).
- where.md updated.

PJ2 check:
- New case "charges one key when the missing keys were issued with no tag" (adv-10).
- where.md updated.

PJ3 check, four new cases:
- "is a repeat when the return has the same day and minute as the issue before it" (adv-9)
- "is a repeat when the return was entered for a time before every other entry in the log" (adv-9, adv-10)
- "is a repeat when the second count is the smaller one" (adv-17)
- "takes back a return when the matching one was the first entry of the log and an issue came after it". This answers the finding that one case alone stood against two forms of the guess.
- where.md updated.

Renames: every hollow-adv-<n>.ts now has a word for what it gets wrong, and none was changed.
- PJ1: latefee, closed, holder, spaces, uncut, tally, booking, sorted, linefor.
- PJ2: closed, onetag, kit, negative, twice, tag, waterkey, lock.
- PJ3: uncut, closed, twice, latefee, keysclosed, holder, laterend, earlierend, atleast, eitherend, bytime.
- The three other.ts files are kept as they were, and each passes.

My lines (Claude Opus 5.5, 2026-11-22), no change:
- Each finding is answered in the files. All 12 helper cases and all the new check cases are there, and no hollow-adv file is left.
- I graded each answer with box.py's own grader and read which cases it fails. All 23 files that got through before now fail, and none failed only because it would not load. The cases each one fails agree with its task's where.md.
- Each plain.ts is still the module byte for byte, and the asks are still 148, 137 and 146 words.
- tsc --strict passes on the module and on all 47 answer files: 3 reference.ts, 3 other.ts and 41 hollow files. Each check with the helper also passes against its reference, with --skipLibCheck and the DOM lib.

## tsc_last_line

No output, exit 0 (tsc --strict --noEmit --target ES2022 --module ESNext --moduleResolution Bundler /home/build/patch/keys/set/files/keys.ts)

## holds_check_last_line

all as they must be

## check_tasks_last_line

window: none; all as they must be

## left_alone

I agree with every finding the earlier mender left alone, and I left them alone too:

1. receiptLines prints raw kind names, such as "boatKey x1 not returned", on the customer's slip. This does not harm the measure: no task turns on it and the helper pins it. Changing the module would mean rebuilding every plain.ts, reference.ts, edits file and hollow answer for no gain.

2. The comment at line 61, "Anyone heavier takes a large". It is loose, not false. Its first sentence says each size is for anyone under its weight, so exactly 70 kg is not adult, and the code and the helper agree. No task touches jacketSize. Left for the same reason as 1.

3. issue, issueKeys and takeBack work on a settled loan with no guard. The module keeps this behaviour, and the helper now pins it. PJ3's ask says a call that is not a repeat "does exactly what it does now", so a file written anew that adds a guard has changed the module.

4. An answer that fails tsc --strict but runs would still pass, because the grader runs only vitest. The adversary did not try one and called it a matter for the whole set. Nothing in this module's files can mend it.

5. The kind of each task, and the PJ1 note that an open loan has settledDay 0. The adversary found each task to be of its kind, each ask to have one reading, and no check testing what its ask does not say. The settledDay fact is not needed, because isOpen is in the outline and the adversary itself called it not needed. Nothing to mend.

6. The "kept, failed as it should" files, such as PJ1 hollow-linefor and PJ2 hollow-waterkey and hollow-lock, were never breaches. They were only renamed, and each still fails.
