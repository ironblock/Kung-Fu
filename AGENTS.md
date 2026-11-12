# For agents working in this repository

## Read in first

`README.md` says what Kung Fu is for and how a result will be judged. `pilot/README.md` is the guide to the one pilot. It says what the pilot showed, what it does not show, and each claim it has had to take back. `bench/README.md` is the guide to the instrument: how one run goes, and what each number is.

This file holds the rules for measuring. The steps under "Before you explain a score" are here because the first pilot was explained without them, and its guide has had to take back a list of claims. The other rules come from the brief this project began with.

A rule that lives in someone's memory fails at the moment they feel sure. So the rules live here, and where a program can hold a rule, the program holds it.

## Before you explain a score

A score says how many answers passed. It does not say why the others failed. A subject that held a wrong belief, and a subject that was asked a question it could not answer, get the same score.

A cost is the same. A subject spends a lot on a hard question. It spends as much on a question that has no right answer. The two numbers look alike.

So do these steps in order. Write no reason for any number until the last step is done.

1. **Keep what was sent and what came back.** For each pass, keep the request as the subject received it, everything the subject wrote back, and what the record says it spent. They go in the pass's own directory. Copy a subject's files after it has finished, never while it works. `pilot/grade.py` does not grade a pass that has no request beside it, and `bench/keep.py` keeps nothing until the record shows the subject has finished.
2. **Read the request as the subject did.** Read it with nothing else in front of you. Write down what it asks for, in what form, and what is missing from it.
3. **Read every answer.** Read the ones that passed too. An answer can pass for a reason that has nothing to do with the task.
4. **Read every line the tool said.** Run each answer that did not pass, and read its output to the last line. Two different faults can share a first line. `pilot/grade.py` prints every line for this reason.
5. **Ask whether the subject could have passed.** Is everything a right answer needs in the request? Can a right answer be written from the request alone? Show it: write one, or run a stronger subject with exactly what the arm's subject was given. A ceiling that saw more than the arm saw does not answer this.
6. **Sort each failure.** It is the subject's when the subject had what it needed and got it wrong. It is the test's when the request, the code or the grader made it. It is not known when you cannot tell. Report the three counts beside the score. Never report the score alone. In the bench, write the line in `whose.txt`: `bench/score.py --strict` fails while a failure is not sorted.
7. **Check each sentence against each answer it speaks for.** "All three wrote the same rule" is three claims. Quote what the subject wrote and what the tool said. Put it in your own words only after the quote.
8. **Say what you did not read.** If a subject's reasoning was not kept, say so, and explain nothing from its cost.

## Before a run

- **Write down what the run is for.** Say what you expect, what each outcome would change, and how large a difference would matter. Do this before the run. The maintainer says go. After that, every change is written down with its date.
- **The ceiling comes first.** A stronger subject passes every task as it is worded, with exactly what the arm's subject will be given. Run it again when the tasks, the code or the request change. A ceiling from an earlier version was not measured.
- **Have a fresh reader read one request.** Give it the request and nothing else. It says what it is asked, in what form, and what is missing or does not agree. It also does the task once. The person who wrote the tasks knows what they meant. The subject knows only what it received.
- **List what the test takes for granted.** The tools the subject has, the form of an answer, what each word in a task refers to. Each one points at words in a kept request. One that points at nothing is a fault in the test.
- **Turn each belief about the test into a check that runs.** `pilot/build.py` stops unless every reference answer matches exactly the marked lines.
- **Hand the subject what the task needs, and nothing more.** In the first study each subject was handed 52 tools, and more than half of the weaker subjects called one that had nothing to do with the task. Name the kind of subject with `bench/setup.py --subject`: `bench/keep.py` then keeps no try from another kind.
- **Fix the size before the run, and try the rule on made-up subjects.** Say how many tries, and do not add tries until an answer comes. Before the run, ask the rule for its answer on subjects whose pass rates you choose. If it cannot tell a difference you care about from none, the run is too small. `bench/studies/second.md` has such a table.
- **Run the arm with no guide first, and look at each task.** A task that arm nearly always passes can show nothing for a guide. Size the study on the tasks that are left. In the second study the arm with none passed two of the six tasks nearly every time. That was learned from 360 tries, and one round of that arm is 40.
- **Fix a rule for each thing the tasks test, not only for their sum.** In the second study one arm was far ahead on one task and behind on another, and one rule over six tasks gave one answer for both.
- **Give a ladder a step that can fail.** If every text passes, the study has not found where passing stops, and it says nothing about how little text is enough. Cut the lowest steps from the tool by a command, so that they have no author.
- **Do not run again what one round has settled.** An arm that passes no try, each for a reason that cannot change, is at the floor. Write that rule before the round, and spend the tries elsewhere.
- **Write a fact no wider than its check.** A check shows that a line holds on the code it ran on. Two lines of `bench/guides/outline/facts.md` say more than their checks ran, and both are wrong outside them.
- **Try the rule that sorts failures, as you try the rule that compares.** Before the run, sort a made-up failure of each kind you expect by it. A rule that can never say "the subject's" counts nothing, and a rule that two readers apply two ways is not fixed yet. The third study's rule was read three ways after its tries: none, 15 or 46 of 146 failures were the subject's.
- **Guess the cost from the same kind of try.** Send one group, count its tokens, and say what the whole run will cost before the rest is sent. The second study's guess came from another kind of try, and the run cost 2.2 times the guess.

## When you read a result

- **One pass is data. It is not a finding.** A difference of one task between two arms means nothing until the same run, done again, shows it again.
- **A comparison has three answers.** A difference was shown. No difference as large as the one that would matter. Cannot tell. The size that would matter is written down before the run.
- **A direction is not a result.** Numbers that all lean one way can still be chance, and they are often one thing seen several times: a try that was right at once also made fewer calls and wrote fewer tokens. Set two arms try against try, and ask how often chance alone would split the pairs that unevenly.
- **What the subject did is measured in every run.** Its tries, its reasoning where that is kept, what it said about its own answers. Decide before the run what will be kept.
- **Two numbers, never one.** A pass rate stands beside the count behind it. A score stands beside the test's share.
- **Count cost in tokens and tries.** Seconds are written down and decide nothing.
- **The task is the unit, and a try is not.** Tries at one task rise and fall together, and a round adds tries and no task. Give each task's passes in each arm first. Draw the tasks again, and not only the pairs, before a sum is believed: `bench/compare.py` prints both.
- **One tool, one model and one set of tasks show nothing about any other.**
- **Say when a case was added after a run,** and whether the person who added it had seen the answers. Report the score on the code as it stood during the run, beside the score on the code as it stands now.

## How to write here

- Write for a reader who was never in the room. Use short sentences, one idea in each, and plain words. Use one term for one thing.
- Nothing from a private place goes into this repository: no codenames, no names of private tools, no error text from private systems. Made-up examples use invented names.
- A public tool is named, with its version. Its own words are quoted exactly. Its files are pointed at by repository and commit, and are not copied in.
- Put your own name on what you write. Put another person's name on something only after they have told you they approve it.

## Before you commit

```sh
python3 pilot/build.py /path/to/ast-grep
for arm in pilot/passes/*/; do python3 pilot/grade.py /path/to/ast-grep $arm; done
python3 bench/selfcheck.py /path/to/ast-grep
```

The totals in `pilot/README.md`, and each failed answer it lists, are what the grader prints. If you change the tasks, the code or the grader, run them and change the guide in the same commit. The self-check plays a subject by hand, and says so when the bench stops doing what its guide says.
