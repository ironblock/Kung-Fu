# Runs

All runs were made from `app/`, through `tasks/run-checks.sh`. For a code task the script copies `check.test.ts` to `app/checks/<id>.test.ts`, then copies each answer in turn to the file the ask names, runs `npx vitest run checks/<id>.test.ts`, and removes both files afterwards. For a question task it copies `proof.test.ts` to `app/checks/<id>.proof.test.ts`; the proof reads `tasks/<id>/expected.json`. Below each run is the test count line and every failing assertion's first line (counted), as the script prints them.

What each run must give, by WRITER.md:
- `reference.ts` and `other.ts`: all tests pass.
- `plain.ts` and each `hollow*.ts`: at least one test fails, and every failure is an `AssertionError` (no import, load or type error).
- each proof: passes with the right `expected.json`, fails with one field changed, passes again once it is put back.

## Code tasks

$ tasks/run-checks.sh AG1
== AG1 reference.ts as src/skip-to-end.ts
Tests  2 passed (2)
== AG1 other.ts as src/skip-to-end.ts
Tests  2 passed (2)
== AG1 plain.ts as src/skip-to-end.ts
Tests  2 failed (2)
1 AssertionError: expected +0 to be close to 10, received difference is 10, but expected 0.000049999999999999996
1 AssertionError: expected 1 to be close to 21, received difference is 20, but expected 0.000049999999999999996
== AG1 hollow-near.ts as src/skip-to-end.ts
Tests  2 failed (2)
1 AssertionError: expected 20.700000762939453 to be close to 21, received difference is 0.2999992370605469, but expected 0.000049999999999999996
1 AssertionError: expected 9.800000190734863 to be close to 10, received difference is 0.19999980926513672, but expected 0.000049999999999999996
== AG1 hollow.ts as src/skip-to-end.ts
Tests  2 failed (2)
1 AssertionError: expected +0 to be close to 10, received difference is 10, but expected 0.000049999999999999996
1 AssertionError: expected 1 to be close to 21, received difference is 20, but expected 0.000049999999999999996

$ tasks/run-checks.sh AG2
== AG2 reference.ts as src/pose-mode.ts
Tests  2 passed (2)
== AG2 other.ts as src/pose-mode.ts
Tests  2 passed (2)
== AG2 plain.ts as src/pose-mode.ts
Tests  2 failed (2)
1 AssertionError: expected 2 to be -4 // Object.is equality
1 AssertionError: expected 2 to be 50 // Object.is equality
== AG2 hollow-speed.ts as src/pose-mode.ts
Tests  2 failed (2)
1 AssertionError: expected 2 to be -4 // Object.is equality
1 AssertionError: expected 2 to be 50 // Object.is equality
== AG2 hollow.ts as src/pose-mode.ts
Tests  2 failed (2)
1 AssertionError: expected 0.02 to be close to 0.22, received difference is 0.2, but expected 0.000049999999999999996
1 AssertionError: expected 0.2 to be close to 0.4, received difference is 0.2, but expected 0.000049999999999999996

$ tasks/run-checks.sh AG3
== AG3 reference.ts as src/jump-to-frame.ts
Tests  3 passed (3)
== AG3 other.ts as src/jump-to-frame.ts
Tests  3 passed (3)
== AG3 plain.ts as src/jump-to-frame.ts
Tests  3 failed (3)
1 AssertionError: expected 10 to be close to 11, received difference is 1, but expected 0.0005
1 AssertionError: expected 150 to be close to 210, received difference is 60, but expected 0.005
1 AssertionError: expected 30 to be close to 36, received difference is 6, but expected 0.0005
== AG3 hollow-order.ts as src/jump-to-frame.ts
Tests  3 failed (3)
1 AssertionError: expected 10 to be close to 11, received difference is 1, but expected 0.0005
1 AssertionError: expected 150 to be close to 210, received difference is 60, but expected 0.005
1 AssertionError: expected 30 to be close to 36, received difference is 6, but expected 0.0005
== AG3 hollow.ts as src/jump-to-frame.ts
Tests  1 failed | 2 passed (3)
1 AssertionError: expected 135 to be close to 210, received difference is 75, but expected 0.005

$ tasks/run-checks.sh AG4
== AG4 reference.ts as src/play-again.ts
Tests  3 passed (3)
== AG4 other.ts as src/play-again.ts
Tests  3 passed (3)
== AG4 plain.ts as src/play-again.ts
Tests  3 failed (3)
1 AssertionError: expected 10 to be close to 2.5, received difference is 7.5, but expected 0.0005
1 AssertionError: expected 100 to be close to 25, received difference is 75, but expected 0.0005
1 AssertionError: expected 6 to be close to 3, received difference is 3, but expected 0.0005
== AG4 hollow-time.ts as src/play-again.ts
Tests  2 failed | 1 passed (3)
1 AssertionError: expected 100 to be close to 25, received difference is 75, but expected 0.0005
1 AssertionError: expected 6 to be close to 3, received difference is 3, but expected 0.0005
== AG4 hollow.ts as src/play-again.ts
Tests  3 failed (3)
1 AssertionError: expected +0 to be close to 2.5, received difference is 2.5, but expected 0.0005
1 AssertionError: expected +0 to be close to 25, received difference is 25, but expected 0.0005
1 AssertionError: expected 2 to be close to 3, received difference is 1, but expected 0.0005

$ tasks/run-checks.sh AG5
== AG5 reference.ts as src/restore-mask.ts
Tests  4 passed (4)
== AG5 other.ts as src/restore-mask.ts
Tests  4 passed (4)
== AG5 plain.ts as src/restore-mask.ts
Tests  3 failed | 1 passed (4)
2 AssertionError: expected 2 to be +0 // Object.is equality
1 AssertionError: expected [ 1, 2, 3 ] to deeply equal [ +0, +0, NumberCloseTo 3 (4 digits) ]
== AG5 hollow-mode.ts as src/restore-mask.ts
Tests  1 failed | 3 passed (4)
1 AssertionError: expected +0 to be close to 1, received difference is 1, but expected 0.000049999999999999996
== AG5 hollow.ts as src/restore-mask.ts
Tests  1 failed | 3 passed (4)
1 AssertionError: expected +0 to be close to 6, received difference is 6, but expected 0.000049999999999999996


Result: every `reference.ts` and `other.ts` passes; every `plain.ts` and `hollow*.ts` fails, and only at assertions.

## Question tasks

$ tasks/run-checks.sh AG6 proof
== AG6 proof with expected.json
Tests  5 passed (5)
$ tasks/run-checks.sh AG7 proof
== AG7 proof with expected.json
Tests  4 passed (4)
$ tasks/run-checks.sh AG8 proof
== AG8 proof with expected.json
Tests  4 passed (4)

$ (expected.json of AG6 with neverPlayedPosed set to true) tasks/run-checks.sh AG6 proof
== AG6 proof with expected.json
Tests  1 failed | 4 passed (5)
1 AssertionError: expected false to be true // Object.is equality
$ (expected.json of AG6 put back) tasks/run-checks.sh AG6 proof
== AG6 proof with expected.json
Tests  5 passed (5)

$ (expected.json of AG7 with sceneAdvancesAttached set to true) tasks/run-checks.sh AG7 proof
== AG7 proof with expected.json
Tests  1 failed | 3 passed (4)
1 AssertionError: expected false to be true // Object.is equality
$ (expected.json of AG7 put back) tasks/run-checks.sh AG7 proof
== AG7 proof with expected.json
Tests  4 passed (4)

$ (expected.json of AG8 with zeroMsFrame set to 0) tasks/run-checks.sh AG8 proof
== AG8 proof with expected.json
Tests  1 failed | 3 passed (4)
1 AssertionError: expected 16.67 to be +0 // Object.is equality
$ (expected.json of AG8 put back) tasks/run-checks.sh AG8 proof
== AG8 proof with expected.json
Tests  4 passed (4)


Result: each proof passes with the right `expected.json`, fails at an assertion with one field changed, and passes again once the file is put back. The `.orig` copy used for this was moved back over `expected.json`.

## Type check of the answers

Vitest strips types without checking them, so the 25 code answers (reference, other, plain, hollow) were also type-checked under the app's own `tsconfig.json`, all at once, with one file that holds a type error on purpose to show the run does check `src`:

```
$ mkdir -p app/src/typecheck   # each answer copied in as <id>-<name>.ts, plus zz-sanity.ts
$ cd app && npx tsc -p tsconfig.json --noEmit | grep -E "^src/"
src/typecheck/zz-sanity.ts(2,14): error TS2322: Type '(group: AnimationGroup, frame: number, engine?: EngineContext | undefined) => void' is not assignable to type 'number'.
```

Only the planted error is reported under `src/`. The run also prints 87 errors inside the library itself, all about `.wgsl?raw` shader imports that the app's `tsconfig.json` has no declarations for; they are not in any answer. `app/src/typecheck` was removed afterwards.

## State at the end

```
$ ls -A app/src app/checks
app/checks:
helpers.ts

app/src:
```
