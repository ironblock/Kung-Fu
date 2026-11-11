# Three facts about ast-grep 0.51.1

Each line below was checked by running it.

1. A rule must name a kind of node. A position, a regex or `pattern: $X` is not a kind.
   - Refused: `rule: {nthChild: 2, inside: {kind: arguments}}`. ast-grep says "Rule must specify a set of AST kinds to match".
   - Runs: `rule: {kind: number, nthChild: 2, inside: {kind: arguments}}`.
   - To take more than one kind, list them: `any: [{kind: number}, {kind: identifier}]`.

2. In a pattern, `$$$A` stops at the first place where the rest of the pattern fits. It never tries a later place.
   - `wrap($$$A, last)` finds `wrap(last)` and `wrap(1, last)`. It misses `wrap(last, last)`.
   - A comma written before `$$$A` must be in the code: `tally(1, $$$A)` misses `tally(1)`.
   - This finds every call to `wrap` whose last argument is `last`: `rule: {pattern: "wrap($$$A)", has: {kind: arguments, has: {kind: identifier, regex: "^last$", nthChild: {position: 1, reverse: true}}}}`.

3. A pattern matches the tree of the code, not its text.
   - `var $A = $B` also finds `var a = 1, b = 2;`.
   - `var $A = $B;` misses a statement that ends with no semicolon.
   - This finds every `var` statement with exactly one variable: `rule: {kind: variable_declaration, not: {has: {kind: variable_declarator, nthChild: 2}}}`.
