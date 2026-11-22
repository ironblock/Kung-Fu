## changes

Full list, one line for each change with the finding it answers: /home/build/patch/notices/set/CHANGES.md.

The module, every plain.ts, reference.ts, reference.edits.md and other.ts are unchanged. I ran `holds.py make` again and the held texts came out byte for byte as before, because no ask changed a code span. Before the last run, check-tasks ended "window: none; 35 WRONG". Now it ends "all as they must be".

HELPER (checks/helpers-notices.ts): 165 cases became 178. Every new expectation pins what the module does now, and all three checks run them. No task's skip list names a case that changed.
- New cases:
  - "dateOf: a century year is a leap year only when 400 divides it" (PP1 adv-1)
  - "formatDay: each weekday by its three letters" (PP1 adv-16)
  - "formatDay: each month by its three letters" (PP3 adv-5)
  - "formatMin: a part of a minute is dropped, not rounded" (PP1 adv-6)
  - "greetingName: each title the yard knows" (PP1 adv-2, PP2 adv-13, PP3 adv-14)
  - "clipSms: spaces at the start of a text that is cut are kept" (PP1 adv-13)
  - "checkTemplates: names each channel of a rule that has no template, in the order of RULES". It changes RULES[3] and RULES[4], then puts the table back in a finally (PP1 adv-12).
  - "Outbox.plan: hands back the outbox's own notices..." (PP1 adv-5)
  - "Outbox.plan: numbers a booking's notices in the order of RULES, not of their due times" (PP3 adv-15)
  - "Outbox.move: keeps a new due time clear of the outbox's own quiet hours..." (PP2 adv-6)
  - "Outbox.requeue: goes by the outbox's own quiet hours..." (PP3 adv-4)
  - "Outbox.problems: a notice given up and queued again by hand is not listed until it fails again" (PP3 adv-16)
  - "Outbox.prune: keeps what was dropped with a due time at the first minute of the day" (PP1 adv-3)
- Existing cases with more expectations:
  - dateOf turn of a year: days -1461 and -1462 (PP2 adv-15)
  - parseClock: "9 : 30", "9: 30" and "9 :30" give -1 (PP3 adv-13)
  - formatPence(-50.5) gives "-£0.50" (PP2 adv-8)
  - parseQuiet("08:00-08:00") gives 480 to 480 (PP2 adv-14)
  - mobileOf: "0044 (0)7700 900123" and "0(0)7700 900123" (PP1 adv-14, adv-4)
  - reach: an email address with a tab, and one with a newline (PP3 adv-6)
  - whenDue: a deposit of -500 gives NO_STAMP (PP2 adv-7)
  - fill("{a}}", {a: "x"}) gives "x}" (PP2 adv-4)
  - retryDelay(-1) for email and post (PP1 adv-15)
  - tidyError with a space as its 77th character (PP2 adv-16)
  - byDay: days 10, 9 and 100 come out in number order (PP3 adv-7)

PP1:
- check: the empty-array case also tries " LW-3001" and "LW-3001 " (adv-11).
- Breaches renamed: 1 leapcentury, 2 nomx, 3 prunemidnight, 4 trunkzero, 5 plancopies, 6 minround, 11 trimref, 12 notemplate, 13 cliptrim, 14 intlzero, 15 negtries, 16 tues.
- Close miss adv-8 renamed keepsdropped.
- where.md names the new hollows, and says that copies of the notices pass.

PP2:
- ask.md: "and it may hold more bars" is now "and any bars or opening braces in it are text". "So does the rest: doubled braces, and a brace that is never closed" is now "So do doubled braces outside a field, and a brace that is never closed". "to be able to say" is now "to say" to stay under the limit. 169 words. This answers the finding that "{{" in a fallback had two readings.
- check, new cases:
  - "keeps an opening brace in the fallback as text, doubled or not" (adv-3)
  - "puts the fallback in as it is written, even when it is the name of a field" (adv-10)
  - "looks up only the name before the bar, never the whole of what is in the braces" (adv-1)
  - "takes an empty name before the bar as a name, as empty braces are" (adv-5, adv-12)
- check: "keeps the fallback exactly as written" also has a newline and a tab (adv-2).
- Breaches renamed: 1 wholekey, 2 newline, 3 unescaped, 4 closebrace, 5 leadingbar, 6 movequiet, 7 negdeposit, 8 halfpenny, 10 fallbackfield, 12 emptyname, 13 noprof, 14 samequiet, 15 backyears, 16 errortrim.
- Close miss adv-11 renamed regexfirst.
- where.md names the new hollows, drops the brace case from its untested list, and adds a paragraph on the road that needs no body, for whoever reads an outline-1 pass.

PP3:
- ask.md: "give an empty array" is now "give a new empty array". 145 words. This answers the fairness finding.
- check: "alters no notice and records nothing" also compares attemptsFor and lastError before and after the quiet calls, for ids -1, 0 to 7 and 99 (adv-9).
- New hollow-shared.ts: the adversary's probe that hands out one shared empty array. "gives a new empty array each time" fails it (fairness).
- Breaches renamed: 4 requeuequiet, 5 sept, 6 tabemail, 7 textsort, 9 logsquiet, 13 clockspaces, 14 noms, 15 planorder, 16 requeuedproblem.
- where.md names the new hollows and the forms of the guess that fail, and says that `clearOfQuiet(this.quiet, now) > now` and `now % 1440` pass.

OTHER CHECKS:
- tsc --strict passes on all 60 task .ts files (copied to .ts files outside W), on the helper and on the three checks.
- These right answers pass the mended checks:
  - PP1: due(MAX_SAFE_INTEGER); returning copies; a loop at the end of the class
  - PP2: the wrapper; split("|") with join
  - PP3: clearOfQuiet > now; clearOfQuiet !== now; now % DAY_MIN

My scratch files, including a copy of W as it was before my changes, are in SCRATCH/mend-notices/. Nothing was committed, and nothing under /home/user/Kung-Fu was edited.

## tsc_last_line

(no output; exit 0) for tsc --strict --noEmit --target ES2022 --module ESNext --moduleResolution Bundler /home/build/patch/notices/set/files/notices.ts

## holds_check_last_line

all as they must be

## check_tasks_last_line

window: none; all as they must be

## left_alone

1. PP1, the earlier adv-9, which hands back copies of the notices. The adversary removed it, and I agree it is not wrong. The ask says "It gives the notices of the booking" and never says they must be the outbox's own objects. I added no case, and it passes.

2. PP3, the earlier adv-8, `now % DAY_MIN`. The adversary removed it, and I agree it is not wrong. It differs from minOf(now) only before day 0. A case there would fail an answer that has the fact right, for a reason that has nothing to do with the fact. It passes.

3. PP2's kind: the wrapper road. It keeps the old fill under a new name, quoting only the first line, and it passes. I left the task as an inside task, as the adversary did. The wrapper needs a guess the outline does not give, that a doubled brace is one brace. Closing the road would mean a different task, and no finding asks for that. where.md now names the road, so that an outline-1 pass is read before it is counted.

4. PP3's kind: two leaks that let the region reader pass without the fact. One is `clearOfQuiet(this.quiet, now) !== now` (or `> now`). The other is inferring from first lines such as `clearOfQuiet(q, stamp)` and DEFAULT_QUIET. The task still keeps the brief's leans rules:
   - isQuiet's own first line leaves the fact open;
   - the natural guess fails 11 cases in six forms;
   - the whole file shows the fact.
   The leak is in another declaration's first line, which the outline tool prints and nobody wrote. Closing it would mean changing the module and making every reference and hollow answer again, which no finding requires. where.md already names the roads.

5. PP1's kind. The adversary found it a beside task, and found that the reference SEARCH, quoted with the outline's two-space indent, still occurs exactly once. holds.py check confirms that. Nothing to mend.

6. checkTemplates' three other faults (no subject, empty subject, unknown field) cannot be reached from outside, because TEMPLATES is not exported. They stay unpinned, and no task turns on them. Only the "no template" fault is pinned now.

7. The adversary wrote its other.ts files after seeing the reference change. They are in styles unlike the writer's and each one passes, so I kept them.
