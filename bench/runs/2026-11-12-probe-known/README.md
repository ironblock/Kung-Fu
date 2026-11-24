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

Done on 2026-11-12, by the stronger model, one reader for each group, with no tool. Both said rightly what is asked and in what form, and neither found the request and the question at odds.

- **One thing was changed.** The names reader said that a flag's word can be part of ast-grep somewhere else: `kind` is a key in a rule, and `customLanguages` is a key in a config file. A loose reader might call such a name a yes. The names question now says that a name counts only as it is written, and the requests were made again.
- **One thing was left, and matters when the answers are read.** The line between "no" and "not known" is not drawn: two subjects with the same memory may write either for a name they have never met. The outcomes above turn on "yes", so the two are read together as "not a yes".
- **The rest was left.** No version is named for the lists, `help` and `--help` may or may not be listed, and one word must say how sure a subject is of many lines. None of these changes whether a new name is written down.
- **What the readers answered, from memory.** The recall reader gave 0.40.5 as the newest version, did not list `outline`, and listed one new flag, `scan --max-results`, as its least certain line. The names reader called the four old names yes, all six made-up names no, `outline` no, four new flags no and `run --files-with-matches` not known.

## Size and cost

Ten tries, all sent at once. A try in the second study wrote about 4,300 output tokens, and that was another kind of try. So about 45,000 output tokens is a guess, and there is no first group to learn from.

## What it cannot show

Ten tries are data and not a finding. A subject may fail to write down a thing it would use if a task called for it. Only a task shows that.

## What came

Written after the run, from `probe.py tally` and from all ten answers, each read in full.

**The belief holds, as far as ten tries can see.** Of the outcomes written above, this is the first. No recall subject wrote `outline` or any new flag, and no names subject called `outline` a yes.

| the names group, five subjects | called yes | called no | called not known |
|---|---|---|---|
| four old names, 20 lines | 19 | 0 | 1 |
| six new names, 30 lines | 1 | 12 | 17 |
| six made-up names, 30 lines | 1 | 6 | 23 |

- **Recall.** All five listed `run`, `scan`, `test`, `new` and `lsp`. None listed `outline`, and none wrote any of the six new names. All five gave the newest version as "not known". The lists are not clean: one subject listed a `config` subcommand that does not exist, and four listed `--heading` on `scan`, which only `run` has.
- **`outline`.** Four of five called it not known, and one called it no.
- **The subjects told what they knew.** The four old names were called yes in 19 of 20 lines, each with a right account of what the thing does.
- **A yes for a new name is worth what a yes for a made-up name is worth.** One subject called `run --files-with-matches` a yes and said rightly what it does. One subject called the made-up `scan --baseline` a yes and said what it would do. That is 1 of 30 for each, so the one right yes may be a guess from the name.
- **`run --kind` was called no by all five, and not "not known".** One wrote why: "`kind` is a rule key in YAML rules, not a run flag". The flag exists in 0.51.1. The fresh reader had warned that "no" and "not known" are not held apart, so this is noted and no more is made of it.

**What it cost.** 18,614 output tokens for the ten tries, against a guess of 45,000. The guess came from another kind of try and was 2.4 times too high. The two fresh readers were the stronger model, and what they wrote was not counted.

**The subjects were what they should be.** All ten records name the kind `bench-subject-closed`. Nine hold the list of tools, and each list is `Read`, `Write` and the hand-back. Each subject read 3,679 or 3,680 tokens before its request, and left `question.md` and `answer.txt` and nothing else. No record holds a sign that a subject left its directory.

**What this does not show.** That the subject could not write an `outline` command if a task named the subcommand: its flags may be guessable from other tools. Only a task shows that. A subject's reasoning is not kept.
