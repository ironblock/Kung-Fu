# Runs

Every command below was run from the workspace root (the directory that holds `app/`, `babylon-lite/` and `tasks/`). Each block shows the command and what it printed.

Two small scripts in this directory do the copying:

- `tasks/run-checks.sh <id>...`: for each code task and each of its answers (`reference`, `other`, `plain`, every `hollow*`), copies `check.test.ts` to `app/checks/<id>.test.ts` and the answer to the file named in `file.txt`, runs `npx vitest run checks/<id>.test.ts` in `app/`, prints PASS or FAIL with the first failure line, then deletes both copies.
- `tasks/run-proof.sh <id> <field>=<value>`: copies `proof.test.ts` to `app/checks/<id>.proof.test.ts` and `expected.json` to `app/checks/<id>.expected.json` (where the proof reads it), runs the proof, then changes one field of the copy and runs it again, then deletes both copies. The `expected.json` under `tasks/` is never changed, so the right file stays in place.

## Type check of every code answer

All 29 answer files were copied into `app/src` under distinct names, `tsc` was run on the app, and only errors in `app/src` were kept (the library itself reports errors about its `?raw` shader imports, which are not ours). Then `app/src` was emptied.

```
$ for id in AM1 AM2 AM3 AM4 AM5; do for f in tasks/$id/reference.ts tasks/$id/other.ts tasks/$id/plain.ts tasks/$id/hollow*.ts; do cp $f app/src/$id-$(basename $f); done; done
$ ls app/src | wc -l
29
$ (cd app && npx tsc --noEmit -p . 2>&1 | grep -E "^src/")
(no output: no type error in any answer)
$ rm -f app/src/*.ts
```

## Code tasks: every answer against its check

Each must come out as: `reference` PASS, `other` PASS, `plain` FAIL at an assertion, every `hollow*` FAIL at an assertion.

```
$ tasks/run-checks.sh AM1 AM2 AM3 AM4 AM5
AM1 reference: PASS (Tests  3 passed (3))
AM1 other: PASS (Tests  3 passed (3))
AM1 plain: FAIL (Tests  1 failed | 2 passed (3)) first failure: AssertionError: expected 30 to be close to 10, received difference is 20, but expected 0.000049999999999999996
AM1 hollow-late-zero: FAIL (Tests  1 failed | 2 passed (3)) first failure: AssertionError: expected 30 to be close to 10, received difference is 20, but expected 0.000049999999999999996
AM1 hollow-one-sided: FAIL (Tests  2 failed | 1 passed (3)) first failure: AssertionError: expected 17.5 to be close to 15, received difference is 2.5, but expected 0.000049999999999999996
AM1 hollow: FAIL (Tests  2 failed | 1 passed (3)) first failure: AssertionError: expected 10 to be close to 15, received difference is 5, but expected 0.000049999999999999996
AM2 reference: PASS (Tests  3 passed (3))
AM2 other: PASS (Tests  3 passed (3))
AM2 plain: FAIL (Tests  3 failed (3)) first failure: AssertionError: expected 22.5 to be close to 19, received difference is 3.5, but expected 0.000049999999999999996
AM2 hollow-fade-only: FAIL (Tests  2 failed | 1 passed (3)) first failure: AssertionError: expected 0.75 to be close to 0.4, received difference is 0.35, but expected 5e-7
AM2 hollow-reattach: FAIL (Tests  3 failed (3)) first failure: AssertionError: expected 22.5 to be close to 19, received difference is 3.5, but expected 0.000049999999999999996
AM2 hollow: FAIL (Tests  2 failed | 1 passed (3)) first failure: AssertionError: expected 0.4 to be close to 0.7, received difference is 0.29999999999999993, but expected 5e-7
AM3 reference: PASS (Tests  2 passed (2))
AM3 other: PASS (Tests  2 passed (2))
AM3 plain: FAIL (Tests  1 failed | 1 passed (2)) first failure: AssertionError: expected 2 to be close to 51, received difference is 49, but expected 0.0005
AM3 hollow-no-restore: FAIL (Tests  1 failed | 1 passed (2)) first failure: AssertionError: expected +0 to be 20 // Object.is equality
AM3 hollow-seek: FAIL (Tests  1 failed | 1 passed (2)) first failure: AssertionError: expected 52.999996185302734 to be close to 51, received difference is 1.9999961853027344, but expected 0
AM3 hollow: FAIL (Tests  1 failed | 1 passed (2)) first failure: AssertionError: expected 52 to be close to 51, received difference is 1, but expected 0.0005
AM4 reference: PASS (Tests  4 passed (4))
AM4 other: PASS (Tests  4 passed (4))
AM4 plain: FAIL (Tests  2 failed | 2 passed (4)) first failure: AssertionError: expected 6 to be close to 4, received difference is 2, but expected 0.000049999999999999996
AM4 hollow-handmix: FAIL (Tests  1 failed | 3 passed (4)) first failure: AssertionError: expected 16.666666666666668 to be close to 12.5, received difference is 4.166666666666668, but expected 
AM4 hollow-skeletal-only: FAIL (Tests  2 failed | 2 passed (4)) first failure: AssertionError: expected 30 to be close to 25, received difference is 5, but expected 0.000049999999999999996
AM4 hollow: FAIL (Tests  2 failed | 2 passed (4)) first failure: AssertionError: expected 30 to be close to 25, received difference is 5, but expected 0.000049999999999999996
AM5 reference: PASS (Tests  3 passed (3))
AM5 other: PASS (Tests  3 passed (3))
AM5 plain: FAIL (Tests  3 failed (3)) first failure: AssertionError: expected [] to deeply equal [ 16 ]
AM5 hollow-shared: FAIL (Tests  1 failed | 2 passed (3)) first failure: AssertionError: expected [ 7, 9, 11 ] to deeply equal [ 7, 11 ]
AM5 hollow: FAIL (Tests  1 failed | 2 passed (3)) first failure: AssertionError: expected [ 100, 50 ] to deeply equal [ 100, 50, 100 ]
```

## Question tasks: each proof as written, then with one field changed

Each must PASS as written and FAIL once a field is changed.

```
$ tasks/run-proof.sh AM6 aloneHalfY=3
AM6 expected.json as written: PASS (Tests  4 passed (4))
AM6 with aloneHalfY changed to 3: FAIL (Tests  1 failed | 3 passed (4)) first failure: AssertionError: expected 1 to be close to 3, received difference is 2, but expected 0.0005
$ tasks/run-proof.sh AM7 layeredLowerY=3
AM7 expected.json as written: PASS (Tests  4 passed (4))
AM7 with layeredLowerY changed to 3: FAIL (Tests  1 failed | 3 passed (4)) first failure: AssertionError: expected 4 to be close to 3, received difference is 1, but expected 0.0005
$ tasks/run-proof.sh AM8 xAfterReAddingA=10
AM8 expected.json as written: PASS (Tests  4 passed (4))
AM8 with xAfterReAddingA changed to 10: FAIL (Tests  1 failed | 3 passed (4)) first failure: AssertionError: expected 30 to be close to 10, received difference is 20, but expected 0.000049999999999999996
```

## End state of the app

```
$ ls -A app/src app/checks
app/checks:
helpers.ts

app/src:
```

## Probes run before writing the tasks

Before writing any task, a probe file `app/checks/probe.test.ts` drove each candidate behaviour on the real library and printed what it saw. It was deleted afterwards. The command and the lines it printed:

```
$ (cd app && npx vitest run checks/probe.test.ts --silent=false --reporter=verbose)
cf 0: 30 1 1                         # cross-fade: x, from.weight, to.weight after a 0 ms update
cf 250: 37.5 0.75 1
cf 1000: 30 0 1
fade 250: 22.5 0.75                  # a fade under way
after set 0.4 + 250: 20 0.5          # setAnimationWeight(0.4), then the fade wrote 0.5
fixed: 2                             # fixedDeltaMs 20, update(510): only 20 ms applied
fixed neg: 4
fixed nan: 6
onUpdate calls: 0                    # onUpdate after a manual update
slot prop-last: ty 6 x 25            # both switches, property last: bones unmixed, HUD mixed
slot gltf-last: ty 4 x 30            # skeletal switch last: bones mixed, HUD unmixed
alone 0.5 ty 1 tx 0                  # lone skeletal clip (y 2, rest 4) at 0.5
both 0.5 ty 4
both 0.75 ty 6
both 1 ty 6
both 0 ty 4
masked full: upper ty 6 lower ty 4   # complementary masks, both at 1
masked b .999: upper ty 5.99399995803833 lower ty 3
order init 30
order re-add a 30 [ 'a', 'b' ]
order clear + b,a 30 [ 'a', 'b' ]
 Test Files  1 passed (1)
      Tests  8 passed (8)
```

(The `#` notes were added here to say what each line is; vitest printed only the values.)
