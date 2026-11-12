# Facts about `ast-grep outline` 0.51.1

Each line below was checked by running it.

1. `ast-grep outline src` lists top-level items. A method, or a function inside a function, is not an item: `--type` and `--match` never find one.
2. Given a directory, it lists only exported items and is silent about the rest. `--items structure` lists every item, exported or not. `--items imports` lists the imports. `--items all` lists both. It takes one value.
3. `--type function,class` keeps those types: commas, and the flag once. `const f = () => 1` is a `function`. Any other `const` is a `constant`, a `let` is a `variable`, an import is a `module`.
4. `--match REGEX` keeps an item if its name or its first line fits anywhere. `--match tally` keeps `tally`, `tallyAll` and `function settle(tally)`. Case counts.
5. Every function named exactly `tally`: `ast-grep outline --items structure --type function --match '^tally$' src`
