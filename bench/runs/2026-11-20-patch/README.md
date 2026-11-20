# What a reader must hold of a file to patch it right

Written by Claude Fable 5.2 on 2026-11-20, before any file, task or try of this run existed. The maintainer approved the question on 2026-11-20. No try is sent to the 27B until the maintainer hands `HANDOFF.md` over. Every later change to this note has its date.

## What it is for

A model works on a file, then loses its context, then must change the file again. In a long job with tools this happens each time the context is cleared. The question is what has to be put back in front of the model for its change to land: the file's name, an outline of it, the outline and the part to be changed, or the whole file. Each step costs more of the reader's context than the one before.

I have said I doubt that an outline is enough to edit from. This run tests that doubt on one model, in one message, with no tools. It also says what a cheap row about a file being written would have to hold, which is a question the maintainer has asked of Ley Lines.

**It is one message and one reply.** The reply is a patch against the file as it is on disk. The subject cannot open the file. So a patch written from a wrong idea of the file is refused, or it lands and breaks the file, as it would in real use.

## Three new words

- **Holds.** What the reader is given of the file. There are four: `name`, `outline`, `region` and `whole`.
- **Edit.** One piece of a patch: a text that is in the file now, and the text to put in its place. It is the search-and-replace form that edit tools use.
- **Kind.** What a right patch needs. There are three, below.

## The code

New code, written for this run on 2026-11-20 by agents, so that no model has seen it in training. It is plain TypeScript with no library: eight modules of one made-up app, each in one file with no import from another. Their sizes are spread from about 150 to about 800 lines. They are in `bench/sets/patch/app/src`.

The subject did not write these files. In the case this run stands for, it would have. A model may guess its own code better than another's. This run cannot see that.

## The tasks

24 tasks: three on each file, one of each kind.

| Kind | The change | What a right patch needs |
| --- | --- | --- |
| `beside` | adds a function or a method beside what is there | the names and types of what exists: what an outline shows |
| `inside` | changes what one declaration does; the ask names it | the text of that declaration |
| `leans` | changes one declaration the ask names, and to be right it must agree with what another declaration's body does, which that declaration's first line does not say | the text of the named declaration, and the other body |

A fourth kind is left out: a change that must also alter text the ask does not name. With an outline and the named part only, that text cannot be quoted, so the arm fails for a reason no try can change.

Each task has an ask, a reference answer, a check, and wrong answers the check must fail (`hollow-*.ts`). The check tests the new behaviour. It also tests that the rest of the file still does what it did, so a file written anew from a guess fails it. Each reference answer is also kept as edits, and `bench/holds.py` requires that they apply to the file and give the reference answer byte for byte.

## The arms

All on the 27B as the animation runs had it: reasoning effort `low`, the same server settings. The arms differ in nothing but what the reader holds of the file.

| Arm | The reader holds | Tries |
| --- | --- | --- |
| `name` | the file's path | 24: one a task |
| `outline` | the path, and the file's outline | 72 |
| `region` | the path, the outline, and the lines of each declaration the ask names | 72 |
| `whole` | the whole file | 72 |
| `whole-b` | `whole` again, byte for byte | 72 |

312 tries.

- **The outline has no author.** It is what `ast-grep outline --view expanded --items all` prints for the file, ast-grep 0.51.2, as it is. Each line is a line number and the first line of a declaration or of a member. A declaration whose first line does not hold all its parameters is shown cut. The files are formatted to 120 columns, and `holds.py` counts the lines that are cut.
- **The region has no author.** For each name the ask puts in a code span, if the file declares it at the top level, the region is that declaration's lines with the comment above it. `Name.member` gives that member's lines. The names come from the ask by a rule in `bench/holds.py`, and nobody picks them.
- **`name` has one try a task.** I expect it to pass nothing. Its tries are read for what the subject does when it holds nothing: says it cannot, makes up the text to replace, or writes the whole file anew. No rule is asked of it.
- **`whole-b`** is there so that the rule is tried on two rounds of one arm, as `AGENTS.md` asks.

`bench/holds.py make` writes what each arm's reader holds for each task into `bench/sets/patch/tasks/<task>/holds/`, and `holds.py check` says whether those files are still what the command gives. The machine that sends the tries needs no ast-grep.

## The reply

The message ends by asking for edits:

    EDIT: app/<path>
    ```
    <<<<<<< SEARCH
    text that is in the file now, copied exactly
    =======
    the text to put in its place
    >>>>>>> REPLACE
    ```

- The SEARCH text must be in the file exactly once, or that edit is refused. Nothing is forgiven: not a space, not a line's indent.
- Edits are applied in the order given. A refused edit leaves the file as it was, and the edits after it are still tried.
- An edit with an empty SEARCH adds its text at the end of the file.
- A whole file may be written instead, as `FILE: app/<path>` and a fenced block.

The form is the one a widely used open-source coding tool asks of its models, so a model is likely to have met it. `small.py selfcheck` reads made-up replies in this form.

## What is measured

For each try, by a command:

1. **What the reply holds:** edits, a whole file, both, or nothing.
2. **Whether the patch applies:** the reply holds an edit or a file, and every edit was applied. For each refused edit: no such text, or the text is there more than once. Beside it, whether it would have applied had spaces at line ends and indents not counted. That last one is for reading only. It changes no count.
3. **Whether the check passes.**
4. **Output tokens,** as the endpoint counts them, reasoning included. The message's size stands beside them.

Then every answer is read and every failure sorted, as `AGENTS.md` says. A failure where the arm did not hold what a right patch needs is **the arm's**: it is the thing measured, and it is not counted against the subject or the test. The ceiling says which failures those are.

## The rule, and what it is asked

`box.py`'s rule, with the task as the unit and a quarter as the size that matters. A try cut off is a failure.

1. `whole-b` against `whole`, on all 24 tasks. If the rule tells them apart, nothing below counts.
2. `outline` against `whole`, on the 8 `beside` tasks. Is an outline enough to add code?
3. `region` against `whole`, on the 8 `inside` tasks. Is the named part enough to change it?
4. `region` against `whole`, on the 8 `leans` tasks. Is the named part enough when the change leans on another body?
5. `region` against `outline`, on the 8 `inside` tasks. I expect this one to be shown. It is the step of the ladder that can fail.

The same five are asked of "the patch applies". Output tokens are given as each arm's median and range by kind, with no rule: I have no size that matters for them yet.

Eight tasks are few. `patch.py simulate` asks the rule for its answer on made-up subjects at eight tasks and three tries, and its table goes here before any try.

## What each outcome changes

| Question | If no difference as large as a quarter | If `whole` is shown to pass more |
| --- | --- | --- |
| 2. `outline` on `beside` | A row that holds an outline is enough to add code from. | First lines are not enough. The failures say what was missing: a cut line, a member, a meaning. |
| 3. `region` on `inside` | To change a declaration, a reader needs its lines and an outline, not the file. A row should carry the parts changed lately. | Even the named part is not enough. I would not have guessed this, and would read the failures before anything else. |
| 4. `region` on `leans` | First lines carry more than I think. | A reader needs something about what the other bodies do. Rows would have to carry it, or point at the lines to read. |

If `whole` applies less often on the longer files than on the shorter, that is a reason to hand over parts and not files. I will give the share that applies by file length, and claim nothing from eight files.

## My guesses

Made before any file or task was written. I have read no code of this run, because there is none.

Passes of 24 tries a cell (of 8 for `name`):

| Arm | `beside` | `inside` | `leans` |
| --- | --- | --- | --- |
| `name` | 0 or 1 | 0 | 0 |
| `outline` | 14 to 20 | 0 to 2 | 0 or 1 |
| `region` | 15 to 21 | 17 to 22 | 3 to 9 |
| `whole` | 18 to 23 | 18 to 23 | 12 to 19 |

- **The patch applies:** in `region` and `whole`, 62 to 70 of 72 each. In `outline`, 18 to 23 of 24 on `beside`, mostly by adding at the end of the file; under 6 of 24 on `inside`.
- **What `name` does:** it gives a patch in 16 to 22 of its 24 tries, with made-up text to replace or a whole made-up file, and says it cannot in the rest.
- **What `outline` does on `inside`:** in more than half of the tries it makes up the body's text and the edit is refused. In under a quarter it says it cannot.
- **Output tokens:** `region` and `whole` have medians within a fifth of each other. `name` has a median at least half as large again as `region`.
- **Question 1:** the rule does not tell `whole-b` from `whole`.
- **Questions 2 and 3:** no difference as large as a quarter, or cannot tell. **Question 4:** shown, `whole` passes more. **Question 5:** shown.
- **The ceiling** (a Sonnet model, one try a task): `whole` 22 to 24 of 24. `region` 15 or 16 of the 16 `beside` and `inside` tasks, and 2 to 5 of the 8 `leans`. `outline` 7 or 8 of the 8 `beside`, and no more than 1 of the other 16. `name` 0 or 1.

## Before any try

1. **`box.py check-tasks bench/sets/patch --window none`** ends `all as they must be`, and `holds.py check` finds every kept file current.
2. **The checks are attacked.** A fresh agent tries to pass each check with a wrong answer. Each one that passes becomes a hollow answer and the check is mended.
3. **A ceiling.** A Sonnet model is sent each task once in each of the four arms, through `small.py --via-claude`, in `bench/runs/2026-11-20-patch-ceiling`. For `whole` it must pass every task, or the task is mended and sent again. For the other arms it says which failures are the arm's.
4. **A fresh reader** is given one `outline` message and one `region` message and nothing else. It says what it is asked, in what form, and what is missing.
5. **The rule is tried on made-up subjects** at eight tasks, and the rule that sorts is tried on a made-up failure of each kind.

## What the test takes for granted

Filled in when the messages exist. Each line will point at words in a kept message.

## What it does not cover

- **One model, one message, no tools.** A reader with tools can open the file. Whether it does so before it patches is a question for a run with tools.
- **The subject did not write the files,** and holds no memory of them. A model that wrote a file and kept notes on it holds more than `name` gives.
- **One outline tool, in one view.** Another outline could carry more or less.
- **One language, eight files, one app,** all written the same day by agents of one model family.
- **A change that must alter text the ask does not name** is left out, as said above.
- **No patch by line number.** A reader with a shell can replace lines by their numbers. This form cannot.
