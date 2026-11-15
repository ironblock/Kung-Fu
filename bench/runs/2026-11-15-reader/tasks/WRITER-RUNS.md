# Runs

All runs were made from `app`, with `VITE_CONFIG_NATIVE_IGNORE_WARNING=true` exported. Each task's `check.test.ts` was copied to `app/checks/<task>.check.test.ts` for its runs and removed afterwards. Before each run, `app/src` was emptied and the answer under test was copied to the file the ask names. The "other" answers, the second right answers, are in `other/<task>.ts`. The script that ran everything is `other/run.sh`. The output below keeps only vitest's per-test lines, assertion messages and summary lines; ANSI colours are stripped.

```
### B1 reference
$ cp  ../tasks/B1/reference.ts src/limited-orbit.ts && npx vitest run checks/B1.check.test.ts
 Test Files  1 passed (1)
      Tests  5 passed (5)

### B1 plain
$ cp  ../tasks/B1/plain.ts src/limited-orbit.ts && npx vitest run checks/B1.check.test.ts
     × brings a camera that starts too far into the range at once 6ms
     × lets the wheel zoom out, but never past the far limit on any frame 1ms
     × lets the wheel zoom in, but never past the near limit on any frame 1ms
     × lets a pinch zoom, but not past either limit 1ms
⎯⎯⎯⎯⎯⎯⎯ Failed Tests 4 ⎯⎯⎯⎯⎯⎯⎯
AssertionError: expected 10 to be less than or equal to 6.000000001
AssertionError: expected 88.18358247500714 to be less than or equal to 6.000000001
AssertionError: expected 0.01 to be greater than or equal to 1.999999999
AssertionError: expected 0.5 to be greater than or equal to 1.999999999
 Test Files  1 failed (1)
      Tests  4 failed | 1 passed (5)

### B1 other
$ cp  ../other/B1.ts src/limited-orbit.ts && npx vitest run checks/B1.check.test.ts
 Test Files  1 passed (1)
      Tests  5 passed (5)

### B2 reference
$ cp  ../tasks/B2/reference.ts src/fast-orbit.ts && npx vitest run checks/B2.check.test.ts
 Test Files  1 passed (1)
      Tests  4 passed (4)

### B2 plain
$ cp  ../tasks/B2/plain.ts src/fast-orbit.ts && npx vitest run checks/B2.check.test.ts
     × turns left-right twice as far as the default controls, glide included 6ms
     × turns up-down twice as far as the default controls, glide included 1ms
⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯
AssertionError: expected 0.4956830017179829 to be greater than 1.9
AssertionError: expected 0.4826087224088723 to be greater than 1.9
 Test Files  1 failed (1)
      Tests  2 failed | 2 passed (4)

### B2 other
$ cp  ../other/B2.ts src/fast-orbit.ts && npx vitest run checks/B2.check.test.ts
 Test Files  1 passed (1)
      Tests  4 passed (4)

### B3 reference
$ cp  ../tasks/B3/reference.ts src/fly-controls.ts && npx vitest run checks/B3.check.test.ts
 Test Files  1 passed (1)
      Tests  4 passed (4)

### B3 plain
$ cp  ../tasks/B3/plain.ts src/fly-controls.ts && npx vitest run checks/B3.check.test.ts
     × moves forward three times as far with Shift held, without changing height 9ms
     × does not move at all when only Shift is held 1ms
⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯
AssertionError: expected -12.562406434141128 to be close to +0, received difference is 12.562406434141128, but expected 5e-10
AssertionError: expected -12.562406434141128 to be close to +0, received difference is 12.562406434141128, but expected 5e-10
 Test Files  1 failed (1)
      Tests  2 failed | 2 passed (4)

### B3 other
$ cp  ../other/B3.ts src/fly-controls.ts && npx vitest run checks/B3.check.test.ts
 Test Files  1 passed (1)
      Tests  4 passed (4)

### B4 reference
$ cp  ../tasks/B4/reference.ts src/globe-tilt.ts && npx vitest run checks/B4.check.test.ts
 Test Files  1 passed (1)
      Tests  3 passed (3)

### B4 plain
$ cp  ../tasks/B4/plain.ts src/globe-tilt.ts && npx vitest run checks/B4.check.test.ts
     × tilts a newly created, fully zoomed-out camera without zooming, turning or moving it 6ms
     × keeps the tilt when the camera is later moved nearer or farther 1ms
⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯
AssertionError: expected 0.001 to be close to 0.8, received difference is 0.799, but expected 5e-7
AssertionError: expected 0.001 to be close to 0.6, received difference is 0.599, but expected 5e-7
 Test Files  1 failed (1)
      Tests  2 failed | 1 passed (3)

### B4 other
$ cp  ../other/B4.ts src/globe-tilt.ts && npx vitest run checks/B4.check.test.ts
 Test Files  1 passed (1)
      Tests  3 passed (3)

### B5 reference
$ cp  ../tasks/B5/reference.ts src/label-position.ts && npx vitest run checks/B5.check.test.ts
 Test Files  1 passed (1)
      Tests  5 passed (5)

### B5 plain
$ cp  ../tasks/B5/plain.ts src/label-position.ts && npx vitest run checks/B5.check.test.ts
     × counts a point beyond the far clipping distance as visible 5ms
⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯
AssertionError: expected false to be true // Object.is equality
 Test Files  1 failed (1)
      Tests  1 failed | 4 passed (5)

### B5 other
$ cp  ../other/B5.ts src/label-position.ts && npx vitest run checks/B5.check.test.ts
 Test Files  1 passed (1)
      Tests  5 passed (5)

### B6 reference
$ cp  ../tasks/B6/reference.ts src/chase-camera.ts && npx vitest run checks/B6.check.test.ts
 Test Files  1 passed (1)
      Tests  3 passed (3)

### B6 plain
$ cp  ../tasks/B6/plain.ts src/chase-camera.ts && npx vitest run checks/B6.check.test.ts
     × keeps looking at the target, with its previous roll, when the car's up lies along the line of sight 3ms
⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯
AssertionError: expected +0 to be close to 0.6, received difference is 0.6, but expected 0.0000049999999999999996
 Test Files  1 failed (1)
      Tests  1 failed | 2 passed (3)

### B6 other
$ cp  ../other/B6.ts src/chase-camera.ts && npx vitest run checks/B6.check.test.ts
 Test Files  1 passed (1)
      Tests  3 passed (3)

```
