# Brief for the writer of one file and its three tasks

Written by Claude Fable 5.2 on 2026-11-20. `bench/runs/2026-11-20-patch/README.md` says what the run is for. Read it first, and read `bench/holds.py`'s docstring.

Added later the same day, after the first eight writers had started: eight more modules were written to this brief, `pumpout`, `keys`, `survey`, `stoppages`, `invoices`, `parts`, `handover` and `notices`. Their writers were told in their first message which of the two groups below their module belongs to: the first four with the smaller modules, the last four with the larger. Nothing else in the brief changed.

You write one TypeScript module of a made-up app, and three tasks that each ask for one change to it. A small model will be asked to make each change in one message, as a patch, holding only part of the file. Your work is the ground the measure stands on, so it must be exact.

You are given: the module's name, its size in lines, what it is about, and a work directory `W` that holds a copy of the set. Work only inside `W`. Do not commit. Do not touch `/home/user/Kung-Fu` except to run its tools.

## The app

A back-office app for a yard that hires out canal boats. It is called `yard`. Each module is one file with no import of any kind: no library, no other module, no Node API. Plain TypeScript for ES2022 that passes `tsc --strict`.

## The module: `W/files/<module>.ts`

- **About the given number of lines,** within a tenth. Count with `wc -l`.
- **Real code, as a working developer leaves it.** Types and interfaces, constants and tables, free functions, and helpers that are not exported. The four larger modules (`rota`, `worklog`, `bookings`, `manifest`) also hold at least one class with state and five or more methods.
- **Nothing that changes from run to run.** No clock, no random number. A caller passes the day or the time in.
- **Several conventions a guess would get wrong.** Money in pence, times in minutes from midnight, a range that includes one end and not the other, a list kept newest first, a value that stands for "none", a function that changes its argument. They must be sensible, the kind a real codebase gathers. At least four of them must be visible only in a body, not in a declaration's first line.
- **Sparse comments.** A short comment where a developer would leave one. Do not document every function.
- **Format.** Four spaces. No line over 120 columns. A function's header goes on one line whenever it fits in 120 columns.
- **No line that the bench reads as a mark:** no line that is only `=======`, `<<<<<<< SEARCH` or `>>>>>>> REPLACE`, and none that begins `FILE:` or `EDIT:`.
- **Invented names only.** No real company, product or person.

## The regression helper: `W/checks/helpers-<module>.ts`

It exports one function:

```ts
export function unchanged(mod: typeof import("../src/<module>"), skip: string[] = []): void;
```

It registers vitest cases (`describe`, `it`, `expect` from `"vitest"`) that pin what the module does now: every export, with at least two cases for each function and method, and the edges of each convention. Each case has a name of its own. A case whose name is in `skip` is not registered. A task's check calls it and skips only the cases its change must alter.

It must be strong. Someone who writes the whole file anew from its outline, guessing the bodies, must fail it.

## The three tasks: `W/tasks/<id>/`

The ids are given to you. The first is the `beside` task, the second `inside`, the third `leans`.

Each task directory holds:

| File | What it is |
| --- | --- |
| `ask.md` | The ask, as the subject reads it. A title line, then plain first-person prose, under 170 words. It names the file as `src/<module>.ts`. It says everything a right answer needs that the file does not. It never mentions a test, a check or this bench. |
| `kind.txt` | `beside`, `inside` or `leans` |
| `file.txt` | `src/<module>.ts` |
| `start.txt` | `files/<module>.ts` |
| `plain.ts` | a copy of the module, byte for byte |
| `reference.ts` | the whole module after a right change, with as few lines changed as the change needs |
| `reference.edits.md` | the same change as edits in the form below; applied to the module they must leave `reference.ts` byte for byte |
| `check.test.ts` | the check: vitest cases for the new behaviour, then `unchanged(mod, [...])`. It imports the module as `../src/<module>` and the helper as `./helpers-<module>`. |
| `hollow-<word>.ts` | at least two whole files that are wrong and that the check must fail at an assertion; see below |
| `where.md` | for the person who will sort failures: what the right change is, where in the file, and what a wrong answer is likely to do. For `leans`: the other declaration, the fact, the lines that show it, and the natural wrong guess. |

The form of an edit:

    EDIT: app/src/<module>.ts
    ```
    <<<<<<< SEARCH
    text that is in the file now, copied exactly
    =======
    the text to put in its place
    >>>>>>> REPLACE
    ```

The SEARCH text must be in the file exactly once. An edit with nothing between SEARCH and `=======` adds its text at the end of the file. Edits are applied in order. The two texts carry no newline at their ends, so a SEARCH may begin and end inside a line.

### The `beside` task

It adds one thing beside what is there. In `moorings`, `tides`, `tariff` and `fuel` it adds an exported function. In `rota`, `worklog`, `bookings` and `manifest` it adds a method to a class of the module.

- The ask gives the new declaration's signature in a fenced `ts` block, and says what it must do.
- **A careful reader who holds only the ask and the outline must be able to write a right answer.** The outline is `W/tasks/<id>/holds/outline.md`, which `holds.py make` writes. Read it as that reader would. It shows a line number and the first line of each declaration and member, and nothing else: no body, no comment. If a right answer needs a fact that is only in a body or a comment, the ask must say it, or the task must change.
- The reference edits may quote only text the outline shows, or have an empty SEARCH. For a new method, quote the first line of a member as the outline prints it (its text after the line number and the spaces), and put the new method before it.

### The `inside` task

It changes what one existing function or method does. The ask names that declaration in a code span, as `name` or `Class.method`.

- The change is local to that declaration and needs its body: it cannot be written from the first line.
- A careful reader who holds only the ask, the outline and that declaration's lines must be able to write a right answer. Those are in `holds/region.md`.
- The reference edits quote only text inside that declaration's lines.

### The `leans` task

It also changes one existing declaration the ask names in a code span. But a right change must agree with what another declaration's body does: a unit, an order, which end of a range is included, a value that stands for "none", a side effect.

- **That other declaration's first line must not show the fact.** Its name, parameters and return type must leave it open, and the natural guess must be wrong.
- **The whole file must show it plainly:** in the other declaration's body, or in a comment inside or directly above it.
- **The ask must not say the fact,** and must not put the other declaration's name in a code span. The named declaration's own lines, or the ask's requirement, must make a careful reader see that the other declaration matters.
- The reference edits quote only text inside the named declaration's lines.
- One hollow answer, `hollow-guess.ts`, is the reference with the natural wrong guess in place of the fact. The check must fail it at an assertion.

### Hollow answers, for every task

- `hollow-lost.ts`: the new behaviour is right, and one other function or method of the file does something slightly different from the module, as it would in a file written anew from a guess. The check must fail it through `unchanged`.
- One more that does the ask in a wrong but likely way: `hollow-guess.ts` for `leans`, and for the others a `hollow-<word>.ts` of your choice.

### The check

- It tests what the ask says, and that the rest is unchanged. It tests nothing the ask does not say. A right answer written another way must pass.
- It tests behaviour through the module's exports. It never reads the source text.
- It tests each clause of the ask, at the edges too.

## Commands

`R` is `SCRATCH/reader/runner`. SCRATCH stands for the session's scratch directory. Its full path was written here until 2026-11-22; it held the session's id, so it is no longer written out.

```sh
# the module and each reference pass the type checker
R/node_modules/.bin/tsc --strict --noEmit --target ES2022 --module ESNext --moduleResolution Bundler W/files/<module>.ts
# the held texts, and what a patch task needs
cd /home/user/Kung-Fu && python3 bench/holds.py make W && python3 bench/holds.py check W
# every reference passes its check, every plain and hollow answer fails at an assertion
cd /home/user/Kung-Fu && python3 bench/box.py check-tasks W --window none
# the sizes of the held texts
cd /home/user/Kung-Fu && python3 bench/holds.py sizes W
```

`holds.py check` must end `all as they must be`, and so must `check-tasks`. Type-check each `reference.ts` too (copy it to a temporary file whose name ends `.ts`).

Run `holds.py make` again after any change to the module or to an ask. If you change the module after writing tasks, copy it again to every `plain.ts`, and redo each `reference.ts` and its edits.

## What you hand back

A short report: the module's line count, its exports, the conventions a guess would get wrong and where each shows, each task's title and what it turns on, the last line of each command, and anything you are not sure of. Say plainly if a rule in this brief could not be kept, and why.
