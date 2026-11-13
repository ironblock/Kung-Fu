# 2026-11-13-workflow-smoke: five tries launched by a workflow, to see that the bench can keep them

This was written before the run.

- **What.** The Haiku model, as a subject of the kind `bench-subject`, on T01, T02, T03, T04 and T06 of the set `outline`, in variant 0, with the tool and no guide: five tries. They are the same five tries as `../2026-11-13-fourth-a/none/*/v0` and `../2026-11-13-third-shell/none/*/v0`, with the same request but for the path. Those were launched by hand, one call for each subject. These are launched by one workflow script, which builds each request from one template.
- **Why.** On 2026-11-13 the maintainer said to move the tries to a workflow, after a smoke test. Launched by hand, each subject's report comes back into the session that runs the study, before all tries are kept, and each request is copied by hand. A workflow can hold the reports back and builds the requests itself.
- **It measures nothing about a guide.** Five tries in one arm. No comparison is made, and the numbers of what a subject read are looked at for one thing only: whether a subject launched this way starts where one launched by hand starts.

**What is checked, and what each outcome changes.**

1. **Found and kept.** `claude_code.py` finds each subject's record and `keep.py` keeps it: the request word for word, the answer, the calls. If the records lie elsewhere or have another shape, the note says what had to change. If they cannot be kept, the tries stay launched by hand.
2. **The same kind of subject.** The record names `bench-subject` and the tools it was handed, the Haiku model, and the effort the harness ran it at. By hand that was medium.
3. **The same start.** By hand a subject's first request was 7,065 tokens for these tries, and the harness handed it 8,401 characters after its first message. If a subject launched by a workflow starts elsewhere, a study uses one way of launching throughout, and no round launched one way is set beside a round launched the other.
4. **The reports stay out.** The workflow hands back whether each subject finished and how long its last words were, and nothing of what it said.
5. **Each try passes.** By hand all ten did. A failure here is read before anything else is.

- **What it should cost:** about 16,500 output tokens of the Haiku model, five times what such a try cost by hand.

## What came, 2026-11-13

The workflow ran all five subjects. None of the five is kept, and that is the finding.

**What held.**

- **The reports stayed out.** The workflow handed back, for each subject, that it had finished and how many characters its last words were. Nothing a subject said reached the session that runs the study.
- **The same kind of subject.** Each record names `bench-subject`, the same seven tools with the hand-back among them, the Haiku model, and the effort the harness calls medium.
- **The records can be found.** They lie in a directory of the workflow's own under the session's records, three files for each subject as before, and `claude_code.py --records` can be pointed there.
- **Each answer lists what the passing answer lists.** The five are not kept, so `score.py` did not score them. Each answer was run beside the kept answer of the same try in `../2026-11-13-fourth-a`, on the same code, and the two list the same items.

**What did not.**

- **A subject launched by a workflow is not sent the request alone.** Its first turn is the harness's own: a line that says the harness relays the user request that set the workflow going, and then the message the maintainer had typed, word for word. Here that was their yes to a smoke test.
- **The request comes second, and is framed.** The second turn begins by saying that the text below was computed by a script, was not typed by the session's user, and carries no user authority, and the first turn says that where the two conflict the maintainer's message wins. Then comes the request, each line set in by two spaces.
- **So `keep.py` kept none:** the first thing each subject was sent is not `request.md`. The refusal is right. It is not a matter of where the records lie.
- **A subject starts elsewhere.** Its first request was 7,584 tokens, against 7,065 for the same try launched by hand. The harness's 8,401 characters still come after its first message.

- **Added on 2026-11-13, after `../2026-11-13-workflow-inner`: its instructions differ too.** What the harness tells a subject before any turn is longer by 873 characters when a workflow launches it: a note that it runs inside a workflow script, that its last words are a value a script will parse, and to be concise. All five subjects here had it. This note missed it, since only the turns were read. It is part of the 519 tokens by which a subject starts elsewhere.

**What that means for a round.**

- **Every subject of a round would read the maintainer's last message.** If that message says what the round is for, or names its arms, every subject knows it.
- **The request reaches a subject as text of less weight than a person's.** What that does to how a subject works is not known.
- **Both are the same in every arm of a round that one workflow launches.** Neither is so of any round launched by hand, so the two kinds of round cannot be set side by side.

**What it changes.** As the note said beforehand: the tries cannot be kept, so they stay launched by hand until the maintainer chooses. To go on with a workflow would take three things. `keep.py` would have to read the two framed turns, check the request inside the second, and write the relayed message into the record. The maintainer's last message before each round would have to be one fixed sentence that says nothing of the round. And a study would use one way of launching throughout.

**What it cost:** 18,351 output tokens of the Haiku model. The guess was 16,500.

## Whether it can be set, 2026-11-13

The maintainer asked whether the harness's documents speak of this, and whether it can be turned off. Looked up the same day; nothing was run.

**What the documents say.** Read: the harness's pages on workflows, on settings, on environment variables, and its list of changes.

- **One sentence on the workflows page:** in auto mode the prompt a script passes to `agent()` "doesn't count as a request from you when the classifier reviews that subagent's actions, because Claude Code marks it as text the script computed."
- **Two entries in the list of changes.** One, for the version this session runs (2.1.323): "Changed workflows so that a prompt an app marks as not typed no longer reaches their agents as your request." One older: computed `agent()` prompts "reach the subagent framed as script-authored text, so the safety classifier does not read them as the user".
- **Nothing more.** No page gives the words of the two turns, says that the person's message is handed to every subject, or names a setting, a variable or an `agent()` option that changes either.

**What the program does.** Read in the installed program, version 2.1.323, not tried.

- **No setting was found that takes the frame off.** One switch turns both turns off together. It follows a flag the harness's makers set, on unless they say otherwise. The program also names an environment variable for it, but in this build that name is looked up in an empty table, so it reads as unset whatever is set.
- **The person's message is left out in some cases:** when it is longer than 4,000 characters, when a schedule and not a person began the turn (a line saying so is put in its place), and when the workflow is started from inside a subagent. In each of them the second turn stays as it is: the frame, and the request set in by two spaces.
- **More than the person's message can be handed over.** When the session's own message stands directly before the person's, up to its last 2,000 characters are added to the first turn, marked as the assistant's words. None of the five subjects here was sent that. The session's record shows a hook's entry between the two messages, which is the likely reason and is not proved.

**What it changes.** The three things above still stand, and the second grows: before a round launched by a workflow, neither the maintainer's last message nor the end of the session's message before it may say anything of the round. Starting the workflow from inside a subagent would hand over neither, if the program does what its text says. That has not been tried. All of this is what one version does and is promised nowhere, so it can change between two rounds without notice.
