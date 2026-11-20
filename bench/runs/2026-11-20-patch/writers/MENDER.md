# Brief for the mender of one file's three tasks

Written by Claude Fable 5.2 on 2026-11-20. Read `bench/runs/2026-11-20-patch/README.md`, then `writers/WRITER.md` and `writers/ADVERSARY.md` beside this file.

You are given a work directory `W` with one module and its three tasks, and an adversary's findings on them. Mend what the findings show, and nothing else.

- **A breach:** a wrong answer the check passed. Mend the check, or the regression helper `checks/helpers-<module>.ts`, so that it fails at an assertion. Rename the file from `hollow-adv-<n>.ts` to `hollow-<word>.ts` with a word that says what it gets wrong, and keep it.
- **An unfair check:** it tests something the ask does not say. Take that case out, or say it in the ask if the task needs it. Keep `other.ts` when it is a right answer; `check-tasks` requires it to pass.
- **An ask with two readings:** change its words so that it has one. Keep it under 170 words.
- **A task that is not of its kind:** change the task so that it is, keeping to `WRITER.md`. If the module must change for that, change it, then copy it to every `plain.ts` and redo every `reference.ts`, `reference.edits.md` and hollow answer of the three tasks.
- **A finding you judge wrong:** leave the thing as it is and say why.

Do not make a check stricter than the ask's words. Do not change what a task turns on unless a finding requires it.

After the last change, all of these must hold, and you run each and quote its last line:

```sh
R=/tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/reader/runner
$R/node_modules/.bin/tsc --strict --noEmit --target ES2022 --module ESNext --moduleResolution Bundler W/files/<module>.ts
cd /home/user/Kung-Fu && python3 bench/holds.py make W && python3 bench/holds.py check W
cd /home/user/Kung-Fu && python3 bench/box.py check-tasks W --window none
```

Write `W/CHANGES.md`: one line for each change, with the finding it answers. Hand back that list, the three last lines, and each finding you left alone with your reason.
