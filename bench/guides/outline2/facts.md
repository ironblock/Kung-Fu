# Facts about `ast-grep outline` 0.51.1

Each line was checked by running it.

1. `ast-grep outline demo` lists top-level items. A method, a function inside a function, and a `var` are not items.
2. Given a directory, it lists only exported items and is silent about the rest. `--items structure` lists every item but the imports, exported or not. `--items imports` lists the imports, `--items all` both.
3. `--type function,class` keeps both types. An arrow function in a `const` or `let` that is not exported is a `function`. Exported, or with another value, a `const` is a `constant` and a `let` a `variable`. An import or an `export {...}` list is a `module`.
4. `--match REGEX` keeps an item when the regex is in its name or on the line of its name. A `const` or `let` that is not exported is read from its name on: `helper = () => 1`. An import's name is its quoted path.
5. Every `function` named exactly `tally`: `ast-grep outline --items structure --type function --match '^tally$' demo`
