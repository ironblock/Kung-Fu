# 2026-11-12-probe-known: what does the subject remember of ast-grep's command line?

This was written before the run. It is a probe and not a study: ten tries, read by eye.

## Why

The first two studies used a subject that already knew ast-grep. With no guide and no tool it passed 47 of 48 tries at the control tasks. So neither study says anything about a tool that a model has never seen, and that is the aim.

On 2026-11-12 the maintainer saw a way to ask about it with the same model and the same tool. ast-grep has gained things since the subject was trained. The stronger model did not know of them: it wrote down beforehand that `ast-grep outline` would be an error, and `outline` arrived in version 0.44. If the Haiku subject does not know of them either, tasks that need them are tasks about a thing it has never seen, and the tasks it does know are the control.

That "if" has not been measured. This probe asks it, before a study is written on it.

## What

Ten subjects of the Haiku model, each of the kind `bench-subject-closed`: it can read and write files and can run nothing. `probe.py` makes the requests and keeps the answers. Two groups of five, so that the names in one cannot prompt the other.

- **recall.** From memory: the newest version it knows of, every subcommand, every long flag of `run` and of `scan`.
- **names.** Sixteen names, in an order of each subject's own: yes, no or not known, and for a yes what the thing does. Four are old, in ast-grep 0.40.0 and 0.51.1 alike. Six are new, in 0.51.1 and not in 0.40.0: `outline`, `run --kind`, `--files-with-matches`, `scan --max-results`, `scan --min-severity` and `--custom-languages`. Six are made up, and in neither.

## What each outcome changes

- **No recall subject writes `outline` or a new flag, and no more than one names subject calls `outline` a yes and says rightly what it does.** The belief holds as far as ten tries can see. A study is then written on it, and that study's arm with no guide is the real check, task by task.
- **Two or more recall subjects write `outline`, or two or more names subjects call it a yes and say rightly what it does.** The subject knows it. The split fails for `outline`, and the same is asked of each new flag.
- **A subject calls the made-up names yes as often as the new ones.** Its yes says nothing, and only the recall group counts.
- **A subject calls the four old names no or not known.** It is not telling what it knows, and its answer is set aside.

"Says rightly what it does" for `outline`: it shows the structure of code, such as its symbols, imports, exports or members.

## What the probe takes for granted

Each points at words in a request, at the kind of subject, or at a check in `probe.py`.

- **The subject cannot look the answer up.** Its kind is handed `Read` and `Write`, and `keep` keeps no answer from another kind. Its directory holds `question.md` and nothing else: "No file in that directory holds the answer."
- **A subject that knows a thing writes it when asked to list.** This cannot be checked from the recall group alone. The names group is the check on it, and the four old names are the check on the names group.
- **The recall question names nothing new.** Its only examples are `--pattern` and `--rule`.
- **"Not known" is allowed, and said to be a fine answer**, so that a gap need not be filled.
- **Not checked:** whether the harness's own instructions, about 3,700 tokens that each subject reads first, say anything of ast-grep.

## Before the subjects

A fresh reader reads one request of each group with its question, says what it is asked and what is missing, and answers once.

## Size and cost

Ten tries, all sent at once. A try in the second study wrote about 4,300 output tokens, and that was another kind of try. So about 45,000 output tokens is a guess, and there is no first group to learn from.

## What it cannot show

Ten tries are data and not a finding. A subject may fail to write down a thing it would use if a task called for it. Only a task shows that.
