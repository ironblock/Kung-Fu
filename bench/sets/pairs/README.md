# Tasks in pairs, on behaviours the makers of the tool test

This is the record of the writer of this set. The writer is Claude, a model, started for this one job on 2026-11-14 with `WRITER.md` as its whole brief. The tool is `ast-grep` 0.51.1, subcommand `outline`, on JavaScript.

The set holds five pairs: ten tasks, T01 to T10, on five bodies of code, P01 to P05. `python3 bench/build.py BINARY --set pairs` passes and prints `pairs, variant 0: 10 tasks, 59 expected matches, 0 tasks worded with other names`.

## The rows, in order

| row | the makers' code | kept or dropped | body and tasks |
|---|---|---|---|
| 1 | `import fs from 'fs'` | kept | P01, T01 and T02 |
| 2 | `export { localHelper };` | kept | P02, T03 and T04 |
| 3 | `export … from './io.js'`, `export * from './all.js'` | kept | P03, T05 and T06 |
| 4 | `const makeThing = () => ({})` | kept | P04, T07 and T08 |
| 5 | `let state;` and `const LOCAL = 1` | kept | P05, T09 and T10 |
| 6 | a `const` and a function inside a callback | dropped | P06, T11, T12 unused |
| 7 | `get value() {}` in a class | dropped | P07, T13, T14 unused |
| 8 | `static version = 1` and `#secret = 2` | dropped | P08, T15, T16 unused |
| 9 | `constructor(name) {}` | dropped | P09, T17, T18 unused |
| 10 | a class with a decorator on the line above | dropped | P10, T19, T20 unused |

Rows 7, 8 and 9 are about members of a class, and the bench grades top-level items only. Rows 6 and 10 are dropped for another reason: the behaviour hides something from every option, so no ask can expect it, and an ask that leaves it out is passed by a first user's first command. Each is set out below with its commands.

## What every pair also needs

These hold for the tool at 0.51.1. I saw each on code of my own. Line numbers in this record are lines of the code as the subject sees it.

- **Given a directory, the tool lists exported items only.** `ast-grep outline src` is `--items exports`. An ask about anything else needs `--items structure`, `--items imports` or `--items all`. Every plain command of check 3 runs without `--items`.
- **`--match` is tried against the name of an item and against its signature.** It matches anywhere unless it is anchored. A name is one word, so `^\w+$` matches every item.
- **The signature is the first line of the item's own text.** For an import or an `export … from` written on several lines it is the last line, the one that holds the path: `} from './render.js';`.
- **A `const` or `let` that is not exported is listed from its name on:** `MAX_TRIES = 5`, with no `const` in front. An exported one is listed as its whole line: `export const DEFAULTS = …`.
- **The help text does not list the type names.** `--type const` is an error: ``Unknown outline symbol type `const` ``.

## Row 1, kept: P01, T01 and T02

**The behaviour.** An `import` statement is listed as an item of type `module`, and its name is the path as it is written, quotes and all: `'node:fs'`, `"marked"`.

**The code.** `marked/P01/src`: four files, 83 lines. They build a small site from notes written in Markdown. `render.js` writes its strings with double quotes. The other three use single quotes.

**T01 expects** the eight imports whose path does not start with a dot:

- `site.js:1` `import 'dotenv/config';`
- `site.js:2` `import fs from 'node:fs';`
- `notes.js:1` the import on four lines from `'node:fs/promises'`
- `notes.js:5` `import * as yaml from 'yaml';`
- `render.js:1` `import { marked } from "marked";`
- `render.js:2` `import escape from "lodash.escape";`
- `markdown.js:1` `import { marked } from 'marked';`
- `markdown.js:2` `import hljs from 'highlight.js';`

**T02 expects** the four imports whose path starts with `./`:

- `site.js:3` `import './markdown.js';`
- `site.js:4` `import { loadNotes } from './notes.js';`
- `site.js:5` the import on four lines from `'./render.js'`
- `render.js:3` `import { slugify } from "./notes.js";`

Neither expects `render.js:4`, `import site from "../site.config.js";`, nor the three `export … from` lines at the end of `site.js`.

**A first user's first command.**

- T01: `ast-grep outline --items imports --match '^[^.]' src`. It lists all 13 imports. The name starts with a quote and the signature starts with `import`, so nothing is left out. A next guess, `--match "from '[^.]"`, lists five. It misses `import 'dotenv/config';`, which has no `from`, and the two in double quotes.
- T02: `ast-grep outline --items imports --match '^\./' src`. It lists nothing: no name starts with a dot. A next guess, `--match '\./'`, lists the four and `"../site.config.js"` besides. `--match "'\./"` misses the one in double quotes.

**The reference answers.**

    T01: ast-grep outline --items imports --match "^['\"][^.]" src
    T02: ast-grep outline --items imports --match "^['\"]\./" src

**For a later reader.**

- The pair needs a second behaviour: imports are listed only with `--items imports` or `--items all`. With `--items all`, the reference answers also list the `export … from` lines, and fail.
- The signature gives another way in. `--items imports --match "(from|import) ['\"][^.]"` passes T01, and `--match "['\"]\./"` passes T02. Both put the quote into the pattern, as the name does.
- The answers hold a `"` inside double quotes for the shell. A subject can fail T01 or T02 on the quoting, and not on the tool.
- `highlight.js` and `lodash.escape` are packages with a dot in the name. They are there for a guess that takes `.js` to mean a file.

## Row 2, kept: P02, T03 and T04

**The behaviour.** An `export { … }` list is one item of type `module`, named `exports`, however many names it holds. What it names is listed as not exported.

**The code.** `marked/P02/src`: three files, 80 lines. A cart, its prices, and an `index.js` that passes both on.

**T03 expects** the four lists of names declared in the same file:

- `money.js:24` `export { toCents, fromCents, formatPrice };`
- `cart.js:31` the list on five lines: `addItem`, `removeItem`, `total`
- `cart.js:36` `export { TAX_RATE as taxRate };`
- `index.js:20` `export { newOrderId };`

**T04 expects** the seven declarations with `export` in front of them:

- `money.js:3` `export const CURRENCY`
- `money.js:5` `export let locale`
- `money.js:7` `export function setLocale`
- `cart.js:5` `export class Cart`
- `cart.js:27` `export default function checkout`
- `index.js:3` `export const exportsDir`
- `index.js:9` `export function receiptPath`

Neither expects the three statements of `index.js` that go on with `from` (lines 13, 14 and 19), nor the ten declarations with no `export` in front, seven of which a list names.

**A first user's first command.**

- T03: `ast-grep outline --match 'export \{' src`. It lists five: the four, and `export { default as checkout, Cart } from './cart.js';`. Another first guess, `ast-grep outline --type module src`, lists seven: the four, and the three statements with `from`.
- T04: `ast-grep outline src`. It lists 14: the seven, the four lists, and the three statements with `from`. A first user expects the exports of a file to be its exported declarations.

**The reference answers.**

    T03: ast-grep outline --items exports --match '^exports$' src
    T04: ast-grep outline --items exports --type function,class,constant,variable src

**For a later reader.**

- The second half of the row, that `localHelper` is listed as not exported, shows in T04: the seven functions and constants that a list names are not among the exports, and T04 does not expect them. I found no ask where that half makes a first guess wrong. The tool has no option that keeps only what is not exported, so a subject cannot misuse one.
- The answer of T04 uses the type names `constant` and `variable`, which is row 5's behaviour. `ast-grep outline --match '^export [^{*]' src` passes T04 without them.
- `ast-grep outline --match exports src` lists the four lists and `exportsDir` besides, and fails T03. Without `exportsDir` it would pass, and it is a plain command in form. The build did not try it, because the wording of T03 does not hold the word `exports`. Keep that word out of the wording. `--type module --match exports` passes.
- `ast-grep outline --match '^export \{[^}]*(\};?)?$' src` passes T03 by the signature alone.

## Row 3, kept: P03, T05 and T06

**The behaviour.** An `export … from` statement is an item of type `module` among the exports, named by its path with the quotes, as an import is. `export { a }` and `export * ` are named alike.

**The code.** `marked/P03/src`: three files, 74 lines. Rules that check a record, their messages, and an `index.js` that passes them on.

**T05 expects** the four `export … from` statements, all in `index.js`:

- line 8 `export { isEmail, isUrl } from './rules.js';`
- line 9 the one on four lines from `'./rules.js'`
- line 13 `export * from './messages.js';`
- line 14 `export { z as schema } from 'zod';`

**T06 expects** those four and the four imports:

- `index.js:1` `import { format } from 'node:util';`
- `index.js:2` the import on four lines from `'./rules.js'`
- `index.js:6` `import * as messages from './messages.js';`
- `rules.js:1` `import 'core-js/actual/url/can-parse.js';`

Neither expects `export { fromJSON, toJSON };` (`index.js:33`) or the list on four lines in `messages.js:14`.

**A first user's first command.**

- T05: `ast-grep outline --match from src`. It lists seven: the four, and `export { fromJSON, toJSON };`, `parseRange` and `between`. `--match 'export .* from'` misses the statement on four lines, whose signature is `} from './rules.js';`. `--type module` lists the two lists of local names besides.
- T06: `ast-grep outline --items imports src`. It lists the four imports and misses the four `export … from` statements. `--items all --type module` lists all eight and the two lists of local names besides.

**The reference answers.**

    T05: ast-grep outline --items exports --match "^'" src
    T06: ast-grep outline --items all --match "^'" src

**For a later reader.**

- Rows 1 and 3 are one way of naming, seen on an import and on an export. The pairs differ: P01 splits imports by their path, and P03 sets the statements that have a path against the lists that have none. A subject that has learned one has learned most of the other.
- The signature gives another way in. `--match "[}*] from '"` passes T05, and `--items all --type module --match "(from|import) '"` passes T06.
- Three names in the code are there to make a guess wrong: `fromJSON` in a list, the `from` of `between`, and the `'from '` of `parseRange`. Without `parseRange`, `--match "from '"` passes T05. If these names are changed for a variant, the new names should hold `from` too.
- All of P03 uses single quotes, so the answers do not need the `['\"]` of P01.

## Row 4, kept: P04, T07 and T08

**The behaviour.** A `const` that is not exported and holds an arrow function is listed as a `function`, not as a `constant`.

**The code.** `marked/P04/src`: three files, 67 lines. A function that tries a task again, the wait between tries, and a log.

**T07 expects** the six arrow functions kept in a `const` that is not exported:

- `retry.js:7` `sleep`, `retry.js:8` `isRetryable`
- `backoff.js:9` `jitter`, `backoff.js:10` `clamp`, written on two lines
- `log.js:4` `stamp`, `log.js:5` `line`

**T08 expects** the seven other `const`s that are not exported:

- `retry.js:4` `MAX_TRIES`, `retry.js:5` `RETRY_CODES`
- `backoff.js:1` `BASE_MS`, `backoff.js:2` `CAP_MS`, `backoff.js:3` `strategies`, an object of arrow functions
- `log.js:1` `PREFIX`, `log.js:2` `verbose`, a call that is passed an arrow function

Neither expects the six exported `const`s (`DEFAULTS`, `never`, `STRATEGY_NAMES`, `fixedDelay`, `LEVELS`, `silent`), `let attempts`, or any function declaration.

**A first user's first command.**

- T07: `ast-grep outline --items structure --type constant --match '=>' src`. It lists five, and none is expected: `verbose`, `DEFAULTS`, and the exported arrow functions `never`, `fixedDelay` and `silent`. Without `--type`, `--match '=>'` lists 13: the six, those five, and the functions `pick` and `retry`, which have an arrow function on their first line.
- T08: `ast-grep outline --items structure --type constant src`. It lists 13: the seven, and the six exported `const`s.

**The reference answers.**

    T07: ast-grep outline --items structure --type function --match '^\w+ =' src
    T08: ast-grep outline --items structure --type constant --match '^\w+ =' src

The two differ in the type alone.

**For a later reader.**

- Both asks need a second behaviour: a `const` that is not exported is listed from its name on, and an exported one as its whole line. `^\w+ =` keeps the first and drops the second. The tool has no option for "not exported".
- An exported arrow function is a `constant`. That is the behaviour of `pair-example`. Here it only makes a first guess wrong.
- The code holds no function expression kept in a `const`, and no arrow function kept in a `let`. The tool lists the first as a `constant` and the second as a `function`, and neither is a row of the makers.

## Row 5, kept: P05, T09 and T10

**The behaviour.** A `let` is listed as a `variable` and a `const` as a `constant`. The type `variable` does not hold a `const`.

**The code.** `marked/P05/src`: three files, 75 lines. The settings of an app, who is signed in, and a count of what was used.

**T09 expects** the seven variables declared at the top level:

- `settings.js:1` `export const VERSION`, `settings.js:3` `const STORAGE_KEY`
- `settings.js:5` `let cached;`, `settings.js:6` `export let dirty`
- `session.js:3` `const IDLE_MS`, `session.js:5` `let user`
- `stats.js:1` `export const counters`

**T10 expects** the four of them declared with `const`: `VERSION`, `STORAGE_KEY`, `IDLE_MS` and `counters`.

Neither expects the `let`s and `const`s inside functions. There are 13 of them, and the tool lists none.

**A first user's first command.**

- T09: `ast-grep outline --items structure --type variable src`. It lists the three `let`s and misses the four `const`s.
- T10: `ast-grep outline --items structure --match '^(export )?const ' src`. It lists `VERSION` and `counters`. It misses `STORAGE_KEY` and `IDLE_MS`, which are listed with no `const` in front. `--type variable` lists the three `let`s and no `const`. `--type const` is an error.

**The reference answers.**

    T09: ast-grep outline --items structure --type variable,constant src
    T10: ast-grep outline --items structure --type constant src

**For a later reader.**

- A first draft asked for every `let` and for every `const`. I changed it, because a first user who guesses the type name `variable` for a `let` would have passed the first ask at once.
- The code holds no arrow function at the top level, so that row 4 plays no part.

## Row 6, dropped: a `const` and a function declared inside a callback are not listed

**What stops it.** The behaviour takes things out of the list, and no option puts them back. So an ask that expects them has no answer. An ask that leaves them out has an answer, and it is the first command a first user writes. No item can make that command wrong by being nested, because the tool does not list it either.

The commands, on a file of my own, `src/suite.js`:

    const LIMIT = 3;
    function top() {}
    setup(() => {
      const inside = 1;
      function helper() {}
    });
    export const shown = wrap(() => {
      const deeper = 2;
      function alsoHidden() {}
    });

    $ ast-grep outline --items all --view expanded src
    src/suite.js
    1: LIMIT = 3
    2: function top() {}
    7: export const shown = wrap(() => {

    $ ast-grep outline --items all --match 'inside|helper|deeper|alsoHidden' src
    nothing found

    $ ast-grep outline --items structure --type function src
    src/suite.js
    function: top

    $ ast-grep outline --items structure --type constant src
    src/suite.js
    constant: LIMIT, shown

The two asks I tried were "every function declaration at the top level of a file; one inside a callback does not count" and the same for `const`. The last two commands above are what a first user writes for them, and both are right. The help text of `--items structure` says "Top-level items defined locally in the file". Check 7 does not hold. To make those commands wrong the code needs an arrow function in a `const`, or a `let`, and then the pair is built on row 4 or row 5.

`--outline-rules` might change what is listed. The bench refuses it (`pilot/grade.py`), and I did not try it.

## Rows 7, 8 and 9, dropped: members of a class

Row 7 is `get value() {}`, listed as a method named `value`. Row 8 is `static version = 1` and `#secret = 2`, listed as fields. Row 9 is `constructor(name) {}`, listed as a member of the type `constructor`.

**What stops them.** The bench grades top-level items only, and no option picks a top-level item by its members. `--type` and `--match` look at top-level items alone, and `--pub-members` changes which members are shown and no item. So no two asks about top-level items turn on how a member is listed.

The commands, on a file of my own, `src/gauge.js`:

    export class Gauge {
      static unit = 'bar';
      #level = 0;
      constructor(start) {
        this.#level = start;
      }
      get level() {
        return this.#level;
      }
    }
    export class Bare {}

    $ ast-grep outline --items all --view expanded src
    src/gauge.js
     1: export class Gauge {
     2:   static unit = 'bar'
     3:   #level = 0
     4:   constructor(start) {
     7:   get level() {
    11: export class Bare {}

    $ ast-grep outline --items all --type method src
    nothing found
    $ ast-grep outline --items all --type field src
    nothing found
    $ ast-grep outline --items all --type constructor src
    nothing found
    $ ast-grep outline --items all --match 'level|unit|constructor' src
    nothing found
    $ ast-grep outline --items all --pub-members src
    src/gauge.js
    class: Gauge, Bare

`method`, `field` and `constructor` are type names the tool knows: it gives no error for them. They keep no class. The same commands with `--view names`, `signatures`, `digest` and `expanded` say the same.

One thing reaches a member: a class written on one line has its members in its signature, so `--match 'get '` keeps `class A { get x() { return 1; } }`. That turns on the text of the line. It does not turn on how the tool lists the member, so it is no pair for these rows.

## Row 10, dropped: a class with a decorator on the line above it

**What stops it.** The grade does not look at how an item is shown. A signature reaches the grade only through `--match`. With the decorator on the line above, `--match` cannot see the decorator at all. So an ask about the decorator has no answer. An ask about anything else gets the same answer with a decorator above or without one, and the first command a first user writes is right.

The commands, on a file of my own, `src/panel.js`:

    @Component()
    export class Panel {}
    @Component()
    class Hidden {}
    export class Plain {}
    class Local {}

    $ ast-grep outline --items all --view signatures src
    src/panel.js
    1: export class Panel {}
    3: class Hidden {}
    5: export class Plain {}
    6: class Local {}

    $ ast-grep outline --items all --match '@' src
    nothing found
    $ ast-grep outline --items all --match Component src
    nothing found

    $ ast-grep outline --type class src
    src/panel.js
    class: Panel, Plain

    $ ast-grep outline --items structure --type class --match '^class' src
    src/panel.js
    class: Hidden, Local

"Every class with a decorator" and "every exported class with no decorator" have no reference answer. "Every exported class" is passed by a plain command, `ast-grep outline --type class src`, so check 3 stops it. "Every class that is not exported" is passed by `--items structure --type class --match '^class'`, a first user's first command, so check 7 stops it.

I tried one more thing. A decorator on the same line as `class` is part of the signature: `@Same() class X {}` is listed as that whole line, and `^class` misses it. That would make a first guess wrong for "every class that is not exported". But it turns on the decorator on the same line, which is the other case from the row, and I found one ask that way and not two.

## What I opened and ran

**Files of this repository that I opened.**

- `bench/sets/pairs/WRITER.md`, `set.json`, `tasks.md` and `reference/answers.txt` as they were, before I wrote to them.
- `bench/sets/pair-example/README.md`, `tasks.md`, `set.json`, `reference/answers.txt` and `marked/P01/src/shapes.js`.
- `bench/build.py`, `bench/sets.py`, `bench/variants.py`, `pilot/build.py` and `pilot/grade.py`.
- `bench/built/pairs/0/pairs.json` and `oracle.json`, and the code under `bench/built/pairs/0/bodies/*/clean`. The build writes these.

**One file outside the list.** `AGENTS.md` was put in front of me. I did not open it. When I read `WRITER.md`, the program that runs me added the text of `AGENTS.md` to what came back, and so I read it. It holds the rules of this repository for measuring and for writing. It says nothing of how `outline` lists anything. It names other files and says to read three of them first. I opened none of them. I kept to its rules for writing here: plain words, no private paths, and the makers' files pointed at and not copied.

**What I ran.**

- `python3 bench/build.py BINARY --set pairs`, many times.
- A script of my own, in a scratch directory outside the repository. It loads `pilot/grade.py` and grades one command against the built code, as the bench does. Every "it lists" in this record is from it.
- The tool, on code of my own in the scratch directory and on the built bodies.

**How I learned the tool.** From the text of `ast-grep --help` and `ast-grep outline --help`. From the makers' three tests, in the directory I was given: `crates/outline/tests/javascript_outline_rules.rs` of ast-grep at 0.51.1. From the binary, on files of my own that held each form of import, export, variable, function and class I could think of. I searched nothing, and read no guide and no study. I listed the scratch directory once and saw the names of other files there. I opened none.

**How the markers were placed.** By reading the code, before the first build. The first build passed. Later builds followed changes to the code and the wording, and the markers of the changed lines were again placed by reading.

**Things the tool does not list at all,** seen while I tried forms: a `var`; a `const` or `let` that takes an object or an array apart; a `function*` declaration; an `export default` of a name or of a function or class with no name; `export let x;` with no value; `export const A = 1, B = 2;`. None is a row of the makers. I kept every one out of the bodies.

## What I am not sure of

- **Check 7 is a judgement.** I wrote down the command I think a first user writes. I ran no subject. A first user who guesses the type name `constant` passes T10 at once. A first user who puts the quote into the pattern from the start, and both kinds of quote, passes T02.
- **Each pair has a way in by the signature** that does not use the behaviour the pair is built on. They are listed under each row. A subject that finds one passes without knowing the row. Each such way needs another behaviour: what the signature of an item is.
- **Rows 6 and 10 are dropped for a reason the brief does not name.** The reason it names is that members are not items. Mine is that the tool hides the thing from every option. A reader may judge that a pair of asks about top-level items only is a pair for row 6. I judged that it turns on nothing, and the commands above are my grounds.
- **Row 2's pair turns on the first half of the row.** The second half is in the code and in what T04 leaves out, and makes no guess wrong.
- **Rows 1 and 3 are close.** See row 3.
- **Some items that make a guess wrong lean on a name:** `exportsDir` in P02; `fromJSON`, `between` and `parseRange` in P03; `highlight.js` and `lodash.escape` in P01. No reference answer leans on a name. If names are changed for variants, these should keep the part that matters, and the build will not always say so: it tries only words of the wording.
- **The double quotes of `render.js` in P01** make the answers harder to write for a shell. That part of the difficulty is not the tool's.
- **One reader read the wordings: me.** I read each as someone who knows JavaScript and has not seen the tool, and found one reading. Another reader has not done it yet.
- **Only variant 0 was built,** and no stronger subject has passed the ten tasks as they are worded.
- **What the tool does not list** is from my own files, on this version. I did not look for the reason.

## What the session that runs the study checked, 2026-11-14

Everything above is the writer's, as it left it. This part is not.

- **What the writer opened, by the harness's own record of it.** Seven files with the tool that reads a file, all on the brief's list. 38 shell commands: none names a guide, a study, a kept run, a check or another set, none runs git, and none reaches the network. The files of `pair-example`, of this set and of the build's output were read through the shell, as the writer says.
- **`AGENTS.md` reached the writer, as it says.** The harness adds that file to what an agent reads in this repository. It holds the rules for measuring. Of the tool it says nothing. It names the file of one guide and says two of its lines were wrong. The writer did not open that file.
- **The writer's last message was lost.** The machine was restarted as it finished. Its record was whole and the build passed, so it was not started again.
- **The build:** ten tasks and 59 expected items. 294 plain commands were tried and none passes a task. The reference answer of each task fails the other task of its pair, in all ten directions. The tool parses every file. `selfcheck.py` passes.
- **Nothing was changed:** no wording, no code, no marker, no answer.

**What the five kept rows are.** They are the five behaviours that the earlier set, `outline`, already turns on: row 1 is its T03, rows 2 and 3 are its T05, row 4 is its T06, and row 5 is its T04. Both pinned guides were mended after tries on those tasks. So this set tests them on new asks and new code from another hand, about behaviours they have met. The five rows that no earlier task touched are the five that cannot be asked in the bench's form: an answer is a list of top-level items, and those rows are about what the tool never lists or lists only inside a class.

**Still to do before a round:** the maintainer reads each ask and says what it wants; names that change from variant to variant; the ceiling; and one try on this set kept by a runner, since no try on a set with more than one body of code has been kept yet.

## What the planning session found, 2026-11-14

It fetched the set, built it, and read it against what it had meant a pair to be. Two things, both checked here on 0.51.1.

**In four pairs of five, the two reference answers are one edit apart.** Pair 1 differs in the end of a pattern, pair 3 in the value of `--items`, pair 4 in the type alone, pair 5 in one type dropped. Pair 2 differs in more: `--match` against `--type`. The copy check asks only that the answer of one ask fail the other, and all five pass it. So for a study of what one subject writes down for the next, these pairs can tell a note that holds the command from a note that holds nothing. They cannot tell a note that holds a fact from one that holds why. The planning session's worked pair had that property, and its checks never said so. A set for that study needs a stronger check, and it is for that study's note to fix: at the least, that the two answers differ in more than one option.

**Two tasks rest on code that leaves a case out,** as the writer said under rows 4 and 5.

- **T07.** Its answer would also list a `let` that holds an arrow function. The code of P04 has none.
- **T10.** Its answer would miss a `const` that is not exported and holds an arrow function, since the tool lists that as a function. The code of P05 has none.

Both pinned guides say that an arrow function has the type `function`. A subject that has read one may look for a case the code does not hold. On T10 it can cost more than calls: `--type constant,function` lists the ten function declarations of P05 besides, and fails. The note of the round is to say this before any try.

**For the round of the fourth study none of this stands in the way:** there a pair is two tasks, and each is graded alone.
