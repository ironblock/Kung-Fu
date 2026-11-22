# Changes to `tides` and its three tasks

Written by Claude Fable 5.2 on 2026-11-20, as the mender, after the adversary's findings. One line for each change, and the finding it answers. The names H1 to H8 are the adversary's.

## The module

- `files/tides.ts`, `windowsFor`: it now puts the windows in the order they open before it joins them, where it took the tides in the order of high water. Three lines changed, lines 58 to 60. The file is still 149 lines and no other line moved. Answers THE MODULE ("`windowsFor` loses an earlier opening when it joins") and H2.
- Every `plain.ts` is the mended module again, byte for byte. Answers the same.
- Every `reference.ts`, `other.ts` and hollow answer was made again on the mended module, each with the same change it had, line for line. No `reference.edits.md` changed: none quotes a line of `windowsFor`. Answers the same.
- `tasks/*/holds/whole.md` made again by `holds.py make`. The outline and the regions are as they were. Answers the same.

## The shared helper, `checks/helpers-tides.ts`

- New case "closeFor leaves a window it trims as it was and puts a new one in the list": a closure that takes one end of a window, at each end. Answers H1.
- New case "windowsFor takes the earlier opening when a small tide comes just ahead of a big one". Answers H2.
- New case "windowsFor joins by the order the windows open and not by the order of the high waters": three tides, where taking the earlier opening on a join is not enough. Answers H2.
- New case "windowsFor joins a window to all that was joined before it": three tides in one window. Answers H3.
- "nextEntry leaves the windows as they were" now also gives a list that is not in opening order, and asks only that the list is left alone. Answers H4.
- "planDeparture leaves the windows as they were" now also gives such a list. Answers H5.
- New case "isOpen takes the windows in any order and leaves them as they were". Answers H6.
- New case "spare takes the windows in any order and leaves them as they were"; new case "closeFor takes the windows in any order and keeps them in the order they came"; "deepEnough gives a new list and leaves the old one" now uses a list that is not in opening order. Answers H6's "Not tried" (`spare`, `closeFor`, `deepEnough`).
- New case "boardLine takes the locking off the closing time even of a window shorter than a locking". Answers H7.
- New case "lockDues is nothing for a length of nothing". Answers H8.
- "nextEntry is now when the lock is open" gains an entry at minute 0, and new case "planDeparture plans for a lock that is open in the first minute of the day". Answers PB3's first breach.

## PB1

- `check.test.ts`: new case "counts a window listed after one that lies outside the stretch". Answers PB1's first breach.
- `hollow-adv-1.ts` is now `hollow-stops.ts`. Answers PB1's first breach.
- `hollow-adv-2.ts` is now `hollow-inplace.ts` (H1); `hollow-adv-3.ts` is now `hollow-overlap.ts` (H2); `hollow-adv-4.ts` is now `hollow-chain.ts` (H3); `hollow-adv-5.ts` is now `hollow-entrysort.ts` (H4); `hollow-adv-6.ts` is now `hollow-board.ts` (H7); `hollow-adv-7.ts` is now `hollow-plansort.ts` (H5); `hollow-adv-8.ts` is now `hollow-opensort.ts` (H6); `hollow-adv-9.ts` is now `hollow-length.ts` (H8).
- `hollow-overlap.ts` and `hollow-chain.ts` were written anew, since they change the lines the module's mend changed. `hollow-overlap.ts` is the module as it was with the earlier opening taken on a join. Answers H2 and H3.
- `hollow-opening.ts` is new: the reference with `windowsFor` as the module had it before the mend. Answers THE MODULE.
- The two near misses kept their place under names that say what they do: `hollow-adv-10.ts` is now `hollow-sum.ts`, `hollow-adv-11.ts` is now `hollow-split.ts`. Answers "Near miss kept".
- `where.md` names the new wrong answers. Answers PB1's breaches.

## PB2

- `check.test.ts`: new case "still leaves the window it cuts as it was, and puts what is kept in the list as a new one". It rests on the ask's "Everything else about the function stays as it is now." Answers PB2's first breach (H1 in PB2's form).
- `hollow-adv-1.ts` is now `hollow-inplace.ts` (H1); `hollow-adv-2.ts` is now `hollow-overlap.ts` (H2); `hollow-adv-3.ts` is now `hollow-chain.ts` (H3); `hollow-adv-4.ts` is now `hollow-entrysort.ts` (H4); `hollow-adv-5.ts` is now `hollow-board.ts` (H7); `hollow-adv-6.ts` is now `hollow-plansort.ts` (H5). `hollow-overlap.ts` and `hollow-chain.ts` were written anew, as in PB1.
- `hollow-opening.ts` is new, as in PB1. Answers THE MODULE.
- The two near misses: `hollow-adv-7.ts` is now `hollow-two.ts`, `hollow-adv-8.ts` is now `hollow-together.ts`. Answers "Near misses kept".
- `where.md`: the line on changing a window in place now names both pins and the check's own case, so the claim is as wide as what pins it. Answers "One claim in PB2/where.md is wider than its pin".
- `where.md`: a new paragraph on the right answer that quotes only the first line and keeps the old body under a new name, and that an `outline-1` pass must be read for it. Answers PB2's "Kind".

## PB3

- `check.test.ts`: new case "still plans for a lock that is open in the first minute of the day". Answers PB3's first breach.
- `hollow-adv-1.ts` is now `hollow-midnight.ts`. Answers PB3's first breach.
- `hollow-adv-2.ts` is deleted: the return type left as `Departure`. No check that runs the code can fail it. Answers PB3's second breach; see what was left alone.
- `hollow-adv-3.ts` is now `hollow-inplace.ts` (H1); `hollow-adv-4.ts` is now `hollow-overlap.ts` (H2); `hollow-adv-5.ts` is now `hollow-chain.ts` (H3); `hollow-adv-6.ts` is now `hollow-entrysort.ts` (H4); `hollow-adv-7.ts` is now `hollow-board.ts` (H7); `hollow-adv-8.ts` is now `hollow-plansort.ts` (H5). `hollow-overlap.ts` and `hollow-chain.ts` were written anew, as in PB1.
- `hollow-opening.ts` is new, as in PB1. Answers THE MODULE.
- The two near misses: `hollow-adv-9.ts` is now `hollow-late.ts`, `hollow-adv-10.ts` is now `hollow-finite.ts`. Answers "Kept".
- `where.md`: it now lists `!isOpen(windows, entry)` among the right answers, says that a pass does not show the reader knew the fact, and asks for each pass to be read and the hedges counted beside the score. Answers PB3's "Kind", the weakness.
- `where.md`: it now says the check cannot see the return type. Answers PB3's second breach.

## Left alone

- **PB3, what the task turns on.** A reader who holds only the region can pass with a test that covers every guess. The adversary found the task of its kind by `WRITER.md`'s letter, and no check can fail a right answer. Closing it means another fact for the task to turn on, which is the run's author's to decide, since it touches every `leans` task that turns on a value for "none". The task is as it was; `where.md` says how to read a pass.
- **PB3, the return type.** The ask keeps the clause: a right answer in TypeScript has it. The check cannot test it without a type checker, and `WRITER.md` has the check run the code only.
- **PB2, its kind.** The change can be made from the outline by wrapping the old body. That route is open in any `inside` task whose change can be made on the result. Written in place, the change needs the body. The task is as it was; `where.md` says how to read an `outline-1` pass.
- **H7 as a wart.** `boardLine` still prints a last entry before the opening for a window under 12 minutes. The helper now pins it as it is. The adversary called it a wart and not a fault, so the module was not changed for it.
- **The second wart:** `nextEntry` and `planDeparture` rely on a list in opening order, and `isOpen`, `spare` and `closeFor` do not. Left as it is: `nextEntry`'s comment says so, and the helper pins no result for a list out of order, only that the list is left alone.
- **No case with a window that closes after 1440.** There `entry === DAY` and `entry >= DAY` part, and both are right answers. `windowFor` makes no such window. A case would fail one right answer.
- **The two answers the adversary deleted as not wrong** (`clock` and `windowFor` flooring) still pass. They differ only for times and heights that are not whole numbers.
