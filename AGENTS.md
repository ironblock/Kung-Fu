# For agents working in this repository

## Read in first

`README.md` says what Kung Fu is for and how a result will be judged. `pilot/README.md` is the guide to the one pilot. It says what the pilot showed, what it does not show, and each claim it has had to take back.

This file holds the rules for measuring. The steps under "Before you explain a score" are here because the first pilot was explained without them, and its guide has had to take back a list of claims. The other rules come from the brief this project began with.

A rule that lives in someone's memory fails at the moment they feel sure. So the rules live here, and where a program can hold a rule, the program holds it.

## Before you explain a score

A score says how many answers passed. It does not say why the others failed. A subject that held a wrong belief, and a subject that was asked a question it could not answer, get the same score.

A cost is the same. A subject spends a lot on a hard question. It spends as much on a question that has no right answer. The two numbers look alike.

So do these steps in order. Write no reason for any number until the last step is done.

1. **Keep what was sent and what came back.** For each pass, keep the request as the subject received it, everything the subject wrote back, and what the record says it spent. They go in the pass's own directory. Copy a subject's files after it has finished, never while it works. `pilot/grade.py` does not grade a pass that has no request beside it.
2. **Read the request as the subject did.** Read it with nothing else in front of you. Write down what it asks for, in what form, and what is missing from it.
3. **Read every answer.** Read the ones that passed too. An answer can pass for a reason that has nothing to do with the task.
4. **Read every line the tool said.** Run each answer that did not pass, and read its output to the last line. Two different faults can share a first line. `pilot/grade.py` prints every line for this reason.
5. **Ask whether the subject could have passed.** Is everything a right answer needs in the request? Can a right answer be written from the request alone? Show it: write one, or run a stronger subject with exactly what the arm's subject was given. A ceiling that saw more than the arm saw does not answer this.
6. **Sort each failure.** It is the subject's when the subject had what it needed and got it wrong. It is the test's when the request, the code or the grader made it. It is not known when you cannot tell. Report the three counts beside the score. Never report the score alone.
7. **Check each sentence against each answer it speaks for.** "All three wrote the same rule" is three claims. Quote what the subject wrote and what the tool said. Put it in your own words only after the quote.
8. **Say what you did not read.** If a subject's reasoning was not kept, say so, and explain nothing from its cost.

## Before a run

- **Write down what the run is for.** Say what you expect, what each outcome would change, and how large a difference would matter. Do this before the run. The maintainer says go. After that, every change is written down with its date.
- **The ceiling comes first.** A stronger subject passes every task as it is worded, with exactly what the arm's subject will be given. Run it again when the tasks, the code or the request change. A ceiling from an earlier version was not measured.
- **Have a fresh reader read one request.** Give it the request and nothing else. It says what it is asked, in what form, and what is missing or does not agree. It also does the task once. The person who wrote the tasks knows what they meant. The subject knows only what it received.
- **List what the test takes for granted.** The tools the subject has, the form of an answer, what each word in a task refers to. Each one points at words in a kept request. One that points at nothing is a fault in the test.
- **Turn each belief about the test into a check that runs.** `pilot/build.py` stops unless every reference answer matches exactly the marked lines.

## When you read a result

- **One pass is data. It is not a finding.** A difference of one task between two arms means nothing until the same run, done again, shows it again.
- **A comparison has three answers.** A difference was shown. No difference as large as the one that would matter. Cannot tell. The size that would matter is written down before the run.
- **What the subject did is measured in every run.** Its tries, its reasoning where that is kept, what it said about its own answers. Decide before the run what will be kept.
- **Two numbers, never one.** A pass rate stands beside the count behind it. A score stands beside the test's share.
- **Count cost in tokens and tries.** Seconds are written down and decide nothing.
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
for arm in ceiling none help skill; do python3 pilot/grade.py /path/to/ast-grep pilot/passes/$arm; done
```

The totals in `pilot/README.md`, and each failed answer it lists, are what these print. If you change the tasks, the code or the grader, run them and change the guide in the same commit.
