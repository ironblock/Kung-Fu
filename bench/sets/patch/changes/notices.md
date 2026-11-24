# Changes to `notices` and its three tasks

Written by Claude Opus 5.5 on 2026-11-22, from the adversary's findings on PP1, PP2 and PP3. A breach is named by the file the adversary left it as, `hollow-adv-<n>.ts`, under its task. The module, every `plain.ts`, `reference.ts`, `reference.edits.md` and `other.ts` are unchanged. The kept texts in `tasks/*/holds/` were made again and are byte for byte as they were, since no ask changed a code span.

## The regression helper, `checks/helpers-notices.ts`

It had 165 cases and now has 178. Each line is one case added, or expectations added to a case. Each pins what the module does now, and all three checks run it. No task's skip list names a case that changed.

- New case "dateOf: a century year is a leap year only when 400 divides it": the day after 28 Feb 2100 is 1 Mar, and the day after 28 Feb 2000 is 29 Feb. Answers PP1 `hollow-adv-1`.
- "dateOf: the turn of a year, forward and back" also reads days -1461 and -1462, 1 Jan 2020 and 31 Dec 2019. Answers PP2 `hollow-adv-15`.
- New case "formatDay: each weekday by its three letters", days 0 to 6. Answers PP1 `hollow-adv-16`.
- New case "formatDay: each month by its three letters", the 15th of each month of 2024. Answers PP3 `hollow-adv-5`.
- New case "formatMin: a part of a minute is dropped, not rounded": 59.6, 719.5 and -0.5. Answers PP1 `hollow-adv-6`.
- "parseClock: -1 for what is not a time of day" also tries "9 : 30", "9: 30" and "9 :30". Answers PP3 `hollow-adv-13`.
- "formatPence: the minus goes before the pound sign, and a part of a penny is rounded" also has `formatPence(-50.5)`, "-£0.50". Answers PP2 `hollow-adv-8`.
- "parseQuiet: two times with a dash between" also has "08:00-08:00", 480 to 480. Answers PP2 `hollow-adv-14`.
- "mobileOf: a UK mobile comes back as +44 and ten digits, however it was typed" also has "0044 (0)7700 900123" and "0(0)7700 900123". Answers PP1 `hollow-adv-14` and PP1 `hollow-adv-4`.
- "reach: an empty text for an email address that cannot be one" also has an address with a tab and one with a newline. Answers PP3 `hollow-adv-6`.
- "whenDue: NO_STAMP for the deposit when none is held" also has a deposit of -500. Answers PP2 `hollow-adv-7`.
- New case "greetingName: each title the yard knows", all eight titles. Answers PP1 `hollow-adv-2`, PP2 `hollow-adv-13` and PP3 `hollow-adv-14`.
- "fill: a doubled brace is one brace of the text" also has `fill("{a}}", { a: "x" })`, "x}". PP2 skips no case of `fill` but the one with a bar. Answers PP2 `hollow-adv-4`.
- New case "clipSms: spaces at the start of a text that is cut are kept". Answers PP1 `hollow-adv-13`.
- New case "checkTemplates: names each channel of a rule that has no template, in the order of RULES". It gives two rules of the exported `RULES` a channel with no template, reads the two faults, and puts the table back in a `finally`. Answers PP1 `hollow-adv-12`.
- "retryDelay: GIVE_UP after the fifth try, and for a count below 1" also tries -1, for email and for post. Answers PP1 `hollow-adv-15`.
- "tidyError: 80 characters are kept, and more are cut to 77 and three dots" also has an error whose 77th character is a space. Answers PP2 `hollow-adv-16`.
- New case "Outbox.plan: hands back the outbox's own notices, so a later change shows on them". Answers PP1 `hollow-adv-5`.
- New case "Outbox.plan: numbers a booking's notices in the order of RULES, not of their due times", a booking with `bookedDay` 150. Answers PP3 `hollow-adv-15`.
- New case "Outbox.move: keeps a new due time clear of the outbox's own quiet hours, not the default ones", with quiet hours of 13:00 to 14:00. Answers PP2 `hollow-adv-6`.
- New case "Outbox.requeue: goes by the outbox's own quiet hours, not the default ones", with the same hours. Answers PP3 `hollow-adv-4`.
- New case "Outbox.problems: a notice given up and queued again by hand is not listed until it fails again". Answers PP3 `hollow-adv-16`.
- New case "Outbox.prune: keeps what was dropped with a due time at the first minute of the day", in an outbox with no quiet hours. Answers PP1 `hollow-adv-3`.
- "byDay: the notices by the day they fall due, the earliest day first" also puts days 10, 9 and 100 in order as numbers. Answers PP3 `hollow-adv-7`.

## PP1 (beside), `Outbox.waitingFor`

- `check.test.ts`: "gives an empty array for a reference the outbox holds nothing for" also tries " LW-3001" and "LW-3001 ". It rests on the ask's "the booking with that reference" and "A reference the outbox holds nothing for gives an empty array." Answers `hollow-adv-11`.
- Renamed: `hollow-adv-1.ts` to `hollow-leapcentury.ts`, `-2` to `hollow-nomx.ts`, `-3` to `hollow-prunemidnight.ts`, `-4` to `hollow-trunkzero.ts`, `-5` to `hollow-plancopies.ts`, `-6` to `hollow-minround.ts`, `-11` to `hollow-trimref.ts`, `-12` to `hollow-notemplate.ts`, `-13` to `hollow-cliptrim.ts`, `-14` to `hollow-intlzero.ts`, `-15` to `hollow-negtries.ts` and `-16` to `hollow-tues.ts`. The check fails each at an assertion, by the case written for it. Answers each breach.
- Renamed: the close miss `hollow-adv-8.ts` to `hollow-keepsdropped.ts`. Answers "Close miss kept".
- `where.md`: names the new hollow answers, and says that copies of the notices pass. Answers the breaches, and "Not wrong, removed: earlier hollow-adv-9".

## PP2 (inside), `fill`

- `ask.md`: "and it may hold more bars" is now "and any bars or opening braces in it are text", and "So does the rest: doubled braces, and a brace that is never closed" is now "So do doubled braces outside a field, and a brace that is never closed". So a `{{` in a fallback is kept as written, as the reference keeps it. To stay under 170 words, "to be able to say" is now "to say". 169 words by `wc -w`. Answers "A fallback holding "{{". There are two readings".
- `check.test.ts`: new case "keeps an opening brace in the fallback as text, doubled or not": `{a|x{{y}` gives `x{{y`, and `{a|{x}` gives `{x`. It rests on the mended ask. Answers `hollow-adv-3`.
- `check.test.ts`: "keeps the fallback exactly as written, spaces and all" also has a fallback with a newline and one with a tab. It rests on "everything after that bar, up to the closing brace". Answers `hollow-adv-2`.
- `check.test.ts`: new case "looks up only the name before the bar, never the whole of what is in the braces". It rests on "The name is the part before the first bar". Answers `hollow-adv-1`.
- `check.test.ts`: new case "takes an empty name before the bar as a name, as empty braces are": `{|none}` with no value gives "none", and `{ |none}` with a value for "" gives the value. It rests on "The name is the part before the first bar" and "When `fields` has a value for the name, that value is used". Answers `hollow-adv-5` and `hollow-adv-12`.
- `check.test.ts`: new case "puts the fallback in as it is written, even when it is the name of a field". It rests on "the fallback goes into the text" and "kept exactly as written". Answers `hollow-adv-10`.
- Renamed: `hollow-adv-1.ts` to `hollow-wholekey.ts`, `-2` to `hollow-newline.ts`, `-3` to `hollow-unescaped.ts`, `-4` to `hollow-closebrace.ts`, `-5` to `hollow-leadingbar.ts`, `-6` to `hollow-movequiet.ts`, `-7` to `hollow-negdeposit.ts`, `-8` to `hollow-halfpenny.ts`, `-10` to `hollow-fallbackfield.ts`, `-12` to `hollow-emptyname.ts`, `-13` to `hollow-noprof.ts`, `-14` to `hollow-samequiet.ts`, `-15` to `hollow-backyears.ts` and `-16` to `hollow-errortrim.ts`. The check fails each at an assertion, by the case written for it. Answers each breach.
- Renamed: the close miss `hollow-adv-11.ts` to `hollow-regexfirst.ts`. It now also fails the new brace case. Answers "Close miss kept".
- `where.md`: names the new hollow answers. A fallback with an opening brace is no longer listed as untested. A new paragraph names the road that needs no body, for whoever reads an `outline-1` pass. Answers the breaches, and "The change CAN be written from the outline alone".

## PP3 (leans), `Outbox.due`

- `ask.md`: "give an empty array" is now "give a new empty array". 145 words. The case "gives a new empty array each time" now rests on the ask's words. Answers "Fairness".
- `check.test.ts`: "alters no notice and records nothing when it gives nothing" also compares `attemptsFor` and `lastError`, before and after the quiet calls, for ids -1, 0 to 7 and 99. It rests on "records nothing". Answers `hollow-adv-9`.
- New hollow answer `hollow-shared.ts`: the adversary's probe `PP3-shared-empty.ts`, which hands out one module-level empty array. The check fails it by "gives a new empty array each time". Answers "Fairness".
- Renamed: `hollow-adv-4.ts` to `hollow-requeuequiet.ts`, `-5` to `hollow-sept.ts`, `-6` to `hollow-tabemail.ts`, `-7` to `hollow-textsort.ts`, `-9` to `hollow-logsquiet.ts`, `-13` to `hollow-clockspaces.ts`, `-14` to `hollow-noms.ts`, `-15` to `hollow-planorder.ts` and `-16` to `hollow-requeuedproblem.ts`. The check fails each at an assertion, by the case written for it. Answers each breach.
- `where.md`: names the new hollow answers and the forms of the natural guess that fail, and says that `clearOfQuiet(this.quiet, now) > now` and `now % 1440` pass. Answers the breaches, "Deleted: the natural guess and its forms", and "Not wrong, removed: earlier hollow-adv-8".

## Left alone

- **PP1, copies of the notices** (the earlier `hollow-adv-9`, removed by the adversary). I agree it is not wrong. The ask says "It gives the notices of the booking", not that they are the outbox's own objects. No case was added, and it passes the mended check.
- **PP3, `now % DAY_MIN`** (the earlier `hollow-adv-8`, removed by the adversary). I agree it is not wrong. It differs from `minOf(now)` only before day 0, and a case there would fail an answer that has the fact right. It passes the mended check.
- **PP2, the road that needs no body.** The adversary's wrapper keeps the old `fill` under a new name and passes. The adversary still counts PP2 as an `inside` task. So do I. The wrapper needs a guess the outline does not give: that a doubled brace is one brace. Closing the road would mean a different task, and no finding asks for that. `where.md` now names it, so that an `outline-1` pass is read before it is counted.
- **PP3, roads for the `region` reader without the fact**: `clearOfQuiet(this.quiet, now) !== now`, and inference from first lines such as `clearOfQuiet(q: QuietHours, stamp: number)` and `DEFAULT_QUIET`. The task keeps the brief's rules for `leans`: `isQuiet`'s own first line leaves the fact open, the natural guess fails 11 cases in six forms, and the whole file shows the fact. The leak is in another declaration's first line, which the outline tool prints and nobody wrote. To close it, the module would have to change, and every reference and hollow answer be made again. The adversary asked for none of that, and `where.md` already names the roads.
- **PP1, its kind.** The adversary found PP1 a `beside` task, and found that the reference SEARCH, quoted with the outline's indent, still occurs once. `holds.py check` checks that. Nothing to mend.
- **`checkTemplates`' three other faults** ("a text has no subject", "the subject is empty", "unknown field") cannot be reached from outside, since `TEMPLATES` is not exported. No case pins them, and no task turns on them. Only the "no template" fault is pinned now.
- **The adversary's note on its own `other.ts`**: it had seen the reference change before writing them. Its three `other.ts` are in styles unlike the writer's, and each passes. I kept them.

## What was run after the last change

- `tsc --strict` on `files/notices.ts`: no output, exit 0. The same on each of the 60 `reference.ts`, `other.ts`, `plain.ts` and hollow files, copied to `.ts` files outside W: none failed. The helper and the three checks also pass `tsc --strict`.
- `holds.py make W` and then `holds.py check W`: `all as they must be`.
- `box.py check-tasks W --window none`: `window: none; all as they must be`.
- Right answers written other ways, graded in a scratch copy, all pass the mended checks: for PP1, the adversary's `this.due(Number.MAX_SAFE_INTEGER)` road, the copies it removed, and the first adversary's loop at the end of the class; for PP2, the wrapper and `split("|")` with `join`; for PP3, `clearOfQuiet(this.quiet, now) > now`, `!== now` and `now % DAY_MIN`.

## Changed in the set, 2026-11-22, by Claude Opus 5.5

- `checks/helpers-notices.ts`, the case "reach: an empty text for an email address that cannot be one": the input that broke the address with a line inside its last word (`.exa`, a line, `mple`) now breaks it before the dot: `"priya@okafor\n.example"`. The module refuses both. The old one, printed by a failing case, looks like an address at a real name, and the bench's privacy check stops on it.
