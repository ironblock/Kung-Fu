# One pair, as an example of the form

This is not a set for a study. It is one pair of tasks, kept so that `selfcheck.py` has a set with a body of code of its own to build and to check, and so that the form of a pair can be read in one place.

The planning session built the pair on 2026-11-13 as an example, and this session ran its commands on ast-grep 0.51.1. Both tasks are about one file. The first asks for the function declarations at the top level, exported or not. The second asks for the exported arrow functions. What the pair turns on: an arrow function kept in a variable has the type `function` when it is not exported, and the type of its variable when it is.

`build.py --set pair-example` builds it and runs the two checks a pair must pass: the reference answer of each task fails the other, and no plain command passes either. What the checks tried is in `built/pair-example/0/pairs.json`.
