# 2026-11-13-third-shell: the five `outline` tasks with the tool in hand and no guide

This was written before the run. The study is `../../studies/third.md`: its sections "After the planning session read the result" and "The go, 2026-11-13". The ceiling is `../2026-11-13-third-shell-ceiling`.

- **What.** The Haiku model, as a subject of the kind `bench-subject`, on T01, T02, T03, T04 and T06 of the set `outline`, in variants 0 to 3, with nothing but the task: 20 tries. A subject gets `task.md`, the code under `src`, and `bin/ast-grep`. It has a shell and its files. It is given no text about `outline`. With a flag it does not have, the tool says "For more information, try '--help'", so a subject can find the long help by itself.
- **Why.** In the study no subject had the tool. With nothing, no try of 20 passed. This asks what the tool in hand changes, and so what form the next study takes.
- **What is measured.** Whether the last answer passes, as it was written. The output tokens of each try, and those before its first right call. The calls: how many, how many the tool refused, how many listed other items, how many were right. Whether the subject asked the tool for its help, and for which subcommand. Each sign that the subject left its directory.
- **What each outcome changes.**

| what comes | what it says | what follows |
|---|---|---|
| T01 to T04 pass 14 or more of 16, and T06 passes 3 or 4 of 4 | for a subject with a shell, a guide prevents no failure here, and can only save spend | the next study measures spend, with the tool |
| T06 passes none or 1 of 4 | a trap that makes no sign catches a subject that has the tool | the next study measures passes, with the tool, and T06's kind of task is what it is about |
| T06 passes 2 of 4 | cannot tell | T06 goes into the next study with the tool in every arm |
| T01 to T04 pass fewer than 14 of 16 | the tool in hand does not teach the subcommand by itself, whatever T06 does | the answers say why, and the next study measures passes |

- **T06 is four tries at nearly one string:** it has one reference answer for all four variants. That is why its lines are fixed here.
- **The author's guess, as a guess:** T01 to T04 pass, and T06 fails in two or more of four.
- **How a failure is sorted, with made-up failures sorted first.** With the tool and the code, nothing a right answer needs is withheld: the help is one call away, and any command can be tried on the code. So by the project's fifth step a failure is the subject's, unless the request, the wrapper, the code or the grader made it, which is the test's. It is not known when the record cannot say which.
  - The last answer is `ast-grep outline --items structure --type function src`, and the calls show that the subject ran it and was shown a list with `detour` in it: the subject's.
  - The same answer, where the ceiling failed T06 too and no try passed it: still the subject's. A right command exists and runs on the code in the directory. That nobody found it is told beside the count.
  - The subject could not run `bin/ast-grep` as the request says, and guessed: the test's, if the wrapper is at fault. The subject's, if the record shows that it never tried.
  - The subject ran another ast-grep than the one in `bin`, so no call is written down: the answer is sorted as above, and the try is left out of every count of calls and of tokens before the first right call.
  - The answer is not the command of the subject's last right call, and nothing in the record says why: not known.
- **A try whose subject read a file outside its directory that holds an answer** is spoiled, and is left out with `compare.py --without`. This repository is on the same machine, and it holds answers to these tasks.
- **The order.** All 20 at once.
- **What it should cost,** guessed from the first study, where a try of the Haiku model with the tool and no guide wrote about 6,200 output tokens on a part of the tool it knew: about 125,000, and likely more here.
- **What it cannot show.** Anything about a guide: there is one arm. How often T06 passes: four tries at one string say "passes", "fails" or "cannot tell" and no more. Anything on code too long to check by eye: the set has seven short files.

## What came

Written on 2026-11-13, after the 20 tries were kept. Every answer was read, and every call each subject made to the tool.

**With the tool in hand and no guide, the Haiku model passed 20 tries of 20.**

| task | passed | output tokens for a try | of them before the first right call | calls on the task's code | which call was first right, try by try |
|---|---|---|---|---|---|
| T01 | 4 of 4 | 3,025 | 1,464 | 25 | 2, 3, 2, 2 |
| T02 | 4 of 4 | 3,082 | 2,125 | 21 | 1, 4, 3, 2 |
| T03 | 4 of 4 | 3,339 | 2,446 | 23 | 4, 3, 3, 5 |
| T04 | 4 of 4 | 4,470 | 3,141 | 28 | 6, 3, 2, 4 |
| T06 | 4 of 4 | 4,684 | 3,401 | 34 | 7, 5, 4, 5 |
| all | 20 of 20 | 3,720 | 2,515 | 131 | |

- **By the table of outcomes above, this is its first line.** T01 to T04 passed 16 of 16, and T06 passed 4 of 4. So for a subject with a shell, on these five tasks, a guide prevents no failure and can only save spend. What follows, as written: the next study measures spend, with the tool.
- **The author's guess was wrong.** It was that T06 would fail in two or more of four.
- **Every subject asked the tool for the help of `outline`, unasked.** All 20 called `ast-grep outline --help`, most of them twice to read it in two parts, and 13 called `ast-grep --help` as well. So each read the long help, the text that passed T06 in 1 try of 12 when there was no tool.
- **No call was refused.** Of the 131 calls on the task's code, 71 were right and 60 listed other items. With nothing and no tool, all 20 answers of the study were refused, for a flag that `outline` does not have.
- **On T06 every subject fell into the trap first, saw it, and got out.** All four ran `--items structure --type function` or the same with `all`, and looked at the list by its names or its signatures. Then each added a `--match` on the word `function`. Two hand-backs say why: the list held variables with arrow functions in them, `onChange` and three others. The task names `onChange` and one more of those four as not counted, so the wrong list showed the trap in the task's own words.
- **On T04 one subject began with `--items exports --type variable`,** the command that failed 22 times in the study. It listed too little, and the subject went on. Two subjects ended with the types `constant` and `variable`, which is the reference answer, and two with a `--match` on `export const` and `export let`.
- **Every subject called its answer sure.** Each had run its answer and looked at what it listed.
- **What it cost.** 74,398 output tokens of the Haiku model: 3,720 for a try, from 1,890 to 4,956. The guess was 125,000. In the study a try with no tool wrote 2,281 with nothing and 1,942 with the facts guide. Those are not set against 3,720 as spend: a subject with the tool also reads the help and every list it asks for, and the bench does not count what a subject reads. Each subject here read 7,063 tokens before its request, where the kind with no shell read about 3,720: it is handed more tools.
- **Each subject was what it should be.** All 20 records name the kind `bench-subject`. For 12 the harness also wrote the list of tools, and each list is `Bash`, `Read`, `Write`, `Edit`, `Glob`, `Grep` and the hand-back. No subject changed the code.
- **Eight signs that a subject left its directory were written down, and none is a leaving.** In seven, the subject's first shell command begins `cat` with the full path of its own `task.md`, where `keep.py` looks for `cd` and its directory, and writes "a command that starts elsewhere". In the eighth, a `find` with `-not -path '*/bin/*'` was read as the place `/bin`. To be sure, every call of every tool in the harness's own record of each of the 20 subjects was searched for a place outside the subject's directory: none names one. `keep.py` cut such a sign at 120 characters, which hid what the command went on to name. It now keeps 400.
- **No failure, so nothing to sort.**

**What this cannot carry.**

- **The code is short, and the task names what not to count.** Seven files and 320 lines can be read whole, and two subjects say they checked their list against the code by hand. The four items that make the plain command wrong on T06 include two that the task gives as its own examples. On code too long to read, or for a task that does not name the things to leave out, a wrong list may be taken for a right one. Nothing here says.
- **T06 is four tries at nearly one string.**
- **There is one arm.** Nothing here is about a guide, and nothing compares spend.
- **One model, one tool, one harness, one day.**
