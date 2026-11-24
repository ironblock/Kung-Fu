# Runs

Made by `python3 tasks/tools/run_all.py`, which runs each command below in turn and keeps what it printed: for vitest, the result of every case, the first line of each failure, and the summary line. Every run starts from an `app/src` that is empty and an `app/checks` that holds only `helpers.ts`, and the script puts them back that way at the end.

### Type check of every answer file, check and proof

```
$ cp tasks/<id>/<variant>.ts app/src/__typecheck/<id>/<variant>.ts   (every answer file of AP1-AP6)
$ cp tasks/<id>/reference.ts app/<file.txt>; cp tasks/<id>/check.test.ts app/checks/<id>.test.ts; cp tasks/AP7|AP8/proof.test.ts app/checks/<id>.proof.test.ts
$ write app/tsconfig.tc.json: extends tsconfig.json, adds the node types, includes src and checks
$ (in app) npx tsc -p tsconfig.tc.json --noEmit, keeping the lines that start with src/ or checks/
(nothing: no type error in any answer file, check or proof)
(the same run printed 87 errors inside ../babylon-lite itself, from missing WebXR types and from shader and worker imports only a bundler resolves; none in our files)
```
As it must be: no type error in our files.

## AP1 (code task, `src/fade-in.ts`)

### AP1 with reference.ts

```
$ cp tasks/AP1/reference.ts app/src/fade-in.ts
$ cp tasks/AP1/check.test.ts app/checks/AP1.test.ts
$ (in app) npx vitest run checks/AP1.test.ts --reporter=default --reporter=json --outputFile.json=../tasks/tools/out/AP1-reference.ts.json
ok   fades alpha from 0 to 1 at a steady rate, then holds 1 and reports the fade over
ok   keeps each fade to its own duration when two run at once
Tests  2 passed (2)
```
As it must be: passes.

### AP1 with other.ts

```
$ cp tasks/AP1/other.ts app/src/fade-in.ts
$ cp tasks/AP1/check.test.ts app/checks/AP1.test.ts
$ (in app) npx vitest run checks/AP1.test.ts --reporter=default --reporter=json --outputFile.json=../tasks/tools/out/AP1-other.ts.json
ok   fades alpha from 0 to 1 at a steady rate, then holds 1 and reports the fade over
ok   keeps each fade to its own duration when two run at once
Tests  2 passed (2)
```
As it must be: passes.

### AP1 with plain.ts

```
$ cp tasks/AP1/plain.ts app/src/fade-in.ts
$ cp tasks/AP1/check.test.ts app/checks/AP1.test.ts
$ (in app) npx vitest run checks/AP1.test.ts --reporter=default --reporter=json --outputFile.json=../tasks/tools/out/AP1-plain.ts.json
FAIL fades alpha from 0 to 1 at a steady rate, then holds 1 and reports the fade over
     AssertionError: expected 0.2499999850988388 to be close to 1, received difference is 0.7500000149011612, but expected 0.0000049999999999999996
FAIL keeps each fade to its own duration when two run at once
     AssertionError: expected 0.2499999850988388 to be close to 1, received difference is 0.7500000149011612, but expected 0.000049999999999999996
Tests  2 failed (2)
```
As it must be: fails, and every failure is at an assertion.

### AP1 with hollow-clamp.ts

```
$ cp tasks/AP1/hollow-clamp.ts app/src/fade-in.ts
$ cp tasks/AP1/check.test.ts app/checks/AP1.test.ts
$ (in app) npx vitest run checks/AP1.test.ts --reporter=default --reporter=json --outputFile.json=../tasks/tools/out/AP1-hollow-clamp.ts.json
FAIL fades alpha from 0 to 1 at a steady rate, then holds 1 and reports the fade over
     AssertionError: expected true to be false // Object.is equality
FAIL keeps each fade to its own duration when two run at once
     AssertionError: expected true to be false // Object.is equality
Tests  2 failed (2)
```
As it must be: fails, and every failure is at an assertion.

### AP1 with hollow-frames.ts

```
$ cp tasks/AP1/hollow-frames.ts app/src/fade-in.ts
$ cp tasks/AP1/check.test.ts app/checks/AP1.test.ts
$ (in app) npx vitest run checks/AP1.test.ts --reporter=default --reporter=json --outputFile.json=../tasks/tools/out/AP1-hollow-frames.ts.json
FAIL fades alpha from 0 to 1 at a steady rate, then holds 1 and reports the fade over
     AssertionError: expected 0.5 to be close to 0.25, received difference is 0.25, but expected 0.000049999999999999996
FAIL keeps each fade to its own duration when two run at once
     AssertionError: expected 0.10000000149011612 to be close to 0.05, received difference is 0.05000000149011612, but expected 0.000049999999999999996
Tests  2 failed (2)
```
As it must be: fails, and every failure is at an assertion.

### AP1 with hollow.ts

```
$ cp tasks/AP1/hollow.ts app/src/fade-in.ts
$ cp tasks/AP1/check.test.ts app/checks/AP1.test.ts
$ (in app) npx vitest run checks/AP1.test.ts --reporter=default --reporter=json --outputFile.json=../tasks/tools/out/AP1-hollow.ts.json
FAIL fades alpha from 0 to 1 at a steady rate, then holds 1 and reports the fade over
     AssertionError: expected 0.4750000238418579 to be close to 0.25, received difference is 0.2250000238418579, but expected 0.000049999999999999996
FAIL keeps each fade to its own duration when two run at once
     AssertionError: expected 1 to be close to 0.05, received difference is 0.95, but expected 0.000049999999999999996
Tests  2 failed (2)
```
As it must be: fails, and every failure is at an assertion.

## AP2 (code task, `src/pulse.ts`)

### AP2 with reference.ts

```
$ cp tasks/AP2/reference.ts app/src/pulse.ts
$ cp tasks/AP2/check.test.ts app/checks/AP2.test.ts
$ (in app) npx vitest run checks/AP2.test.ts --reporter=default --reporter=json --outputFile.json=../tasks/tools/out/AP2-reference.ts.json
ok   waits for a press, then pulses once and rests at 1
ok   pulses again, from the beginning, on every press after the last pulse finished
ok   keeps the pulses of two buttons apart
Tests  3 passed (3)
```
As it must be: passes.

### AP2 with other.ts

```
$ cp tasks/AP2/other.ts app/src/pulse.ts
$ cp tasks/AP2/check.test.ts app/checks/AP2.test.ts
$ (in app) npx vitest run checks/AP2.test.ts --reporter=default --reporter=json --outputFile.json=../tasks/tools/out/AP2-other.ts.json
ok   waits for a press, then pulses once and rests at 1
ok   pulses again, from the beginning, on every press after the last pulse finished
ok   keeps the pulses of two buttons apart
Tests  3 passed (3)
```
As it must be: passes.

### AP2 with plain.ts

```
$ cp tasks/AP2/plain.ts app/src/pulse.ts
$ cp tasks/AP2/check.test.ts app/checks/AP2.test.ts
$ (in app) npx vitest run checks/AP2.test.ts --reporter=default --reporter=json --outputFile.json=../tasks/tools/out/AP2-plain.ts.json
ok   waits for a press, then pulses once and rests at 1
FAIL pulses again, from the beginning, on every press after the last pulse finished
     AssertionError: expected 1 to be close to 1.25, received difference is 0.25, but expected 0.000049999999999999996
FAIL keeps the pulses of two buttons apart
     AssertionError: expected 1 to be close to 1.25, received difference is 0.25, but expected 0.000049999999999999996
Tests  2 failed | 1 passed (3)
```
As it must be: fails, and every failure is at an assertion.

### AP2 with hollow-eager.ts

```
$ cp tasks/AP2/hollow-eager.ts app/src/pulse.ts
$ cp tasks/AP2/check.test.ts app/checks/AP2.test.ts
$ (in app) npx vitest run checks/AP2.test.ts --reporter=default --reporter=json --outputFile.json=../tasks/tools/out/AP2-hollow-eager.ts.json
FAIL waits for a press, then pulses once and rests at 1
     AssertionError: expected 1.25 to be close to 1, received difference is 0.25, but expected 0.000049999999999999996
ok   pulses again, from the beginning, on every press after the last pulse finished
FAIL keeps the pulses of two buttons apart
     AssertionError: expected 1.5 to be 1 // Object.is equality
Tests  2 failed | 1 passed (3)
```
As it must be: fails, and every failure is at an assertion.

### AP2 with hollow-new-group.ts

```
$ cp tasks/AP2/hollow-new-group.ts app/src/pulse.ts
$ cp tasks/AP2/check.test.ts app/checks/AP2.test.ts
$ (in app) npx vitest run checks/AP2.test.ts --reporter=default --reporter=json --outputFile.json=../tasks/tools/out/AP2-hollow-new-group.ts.json
FAIL waits for a press, then pulses once and rests at 1
     AssertionError: expected 1.25 to be close to 1, received difference is 0.25, but expected 0.000049999999999999996
FAIL pulses again, from the beginning, on every press after the last pulse finished
     AssertionError: expected 1.25 to be close to 1, received difference is 0.25, but expected 0.000049999999999999996
FAIL keeps the pulses of two buttons apart
     AssertionError: expected 1.25 to be close to 1, received difference is 0.25, but expected 0.000049999999999999996
Tests  3 failed (3)
```
As it must be: fails, and every failure is at an assertion.

### AP2 with hollow.ts

```
$ cp tasks/AP2/hollow.ts app/src/pulse.ts
$ cp tasks/AP2/check.test.ts app/checks/AP2.test.ts
$ (in app) npx vitest run checks/AP2.test.ts --reporter=default --reporter=json --outputFile.json=../tasks/tools/out/AP2-hollow.ts.json
ok   waits for a press, then pulses once and rests at 1
FAIL pulses again, from the beginning, on every press after the last pulse finished
     AssertionError: expected 1 to be close to 1.25, received difference is 0.25, but expected 0.000049999999999999996
FAIL keeps the pulses of two buttons apart
     AssertionError: expected 1 to be close to 1.25, received difference is 0.25, but expected 0.000049999999999999996
Tests  2 failed | 1 passed (3)
```
As it must be: fails, and every failure is at an assertion.

## AP3 (code task, `src/hover.ts`)

### AP3 with reference.ts

```
$ cp tasks/AP3/reference.ts app/src/hover.ts
$ cp tasks/AP3/check.test.ts app/checks/AP3.test.ts
$ (in app) npx vitest run checks/AP3.test.ts --reporter=default --reporter=json --outputFile.json=../tasks/tools/out/AP3-reference.ts.json
ok   bobs 0.5 above the rest height at full strength and scales the bob with the strength, keeping its rhythm
ok   works below zero and with several pickups on one manager
Tests  2 passed (2)
```
As it must be: passes.

### AP3 with other.ts

```
$ cp tasks/AP3/other.ts app/src/hover.ts
$ cp tasks/AP3/check.test.ts app/checks/AP3.test.ts
$ (in app) npx vitest run checks/AP3.test.ts --reporter=default --reporter=json --outputFile.json=../tasks/tools/out/AP3-other.ts.json
ok   bobs 0.5 above the rest height at full strength and scales the bob with the strength, keeping its rhythm
ok   works below zero and with several pickups on one manager
Tests  2 passed (2)
```
As it must be: passes.

### AP3 with plain.ts

```
$ cp tasks/AP3/plain.ts app/src/hover.ts
$ cp tasks/AP3/check.test.ts app/checks/AP3.test.ts
$ (in app) npx vitest run checks/AP3.test.ts --reporter=default --reporter=json --outputFile.json=../tasks/tools/out/AP3-plain.ts.json
FAIL bobs 0.5 above the rest height at full strength and scales the bob with the strength, keeping its rhythm
     AssertionError: expected 1.2000000476837158 to be close to 2.2, received difference is 0.9999999523162844, but expected 0.000049999999999999996
FAIL works below zero and with several pickups on one manager
     AssertionError: expected -1.1800000667572021 to be close to -2.98, received difference is 1.7999999332427978, but expected 0.000049999999999999996
Tests  2 failed (2)
```
As it must be: fails, and every failure is at an assertion.

### AP3 with hollow-restart.ts

```
$ cp tasks/AP3/hollow-restart.ts app/src/hover.ts
$ cp tasks/AP3/check.test.ts app/checks/AP3.test.ts
$ (in app) npx vitest run checks/AP3.test.ts --reporter=default --reporter=json --outputFile.json=../tasks/tools/out/AP3-hollow-restart.ts.json
FAIL bobs 0.5 above the rest height at full strength and scales the bob with the strength, keeping its rhythm
     AssertionError: expected 2.049999952316284 to be close to 2.2, received difference is 0.150000047683716, but expected 0.000049999999999999996
FAIL works below zero and with several pickups on one manager
     AssertionError: expected -2.950000047683716 to be close to -2.6, received difference is 0.35000004768371573, but expected 0.000049999999999999996
Tests  2 failed (2)
```
As it must be: fails, and every failure is at an assertion.

### AP3 with hollow.ts

```
$ cp tasks/AP3/hollow.ts app/src/hover.ts
$ cp tasks/AP3/check.test.ts app/checks/AP3.test.ts
$ (in app) npx vitest run checks/AP3.test.ts --reporter=default --reporter=json --outputFile.json=../tasks/tools/out/AP3-hollow.ts.json
FAIL bobs 0.5 above the rest height at full strength and scales the bob with the strength, keeping its rhythm
     AssertionError: expected 2 to be close to 2.1, received difference is 0.10000000000000009, but expected 0.000049999999999999996
FAIL works below zero and with several pickups on one manager
     AssertionError: expected -3 to be close to -2.98, received difference is 0.020000000000000018, but expected 0.000049999999999999996
Tests  2 failed (2)
```
As it must be: fails, and every failure is at an assertion.

## AP4 (code task, `src/release.ts`)

### AP4 with reference.ts

```
$ cp tasks/AP4/reference.ts app/src/release.ts
$ cp tasks/AP4/check.test.ts app/checks/AP4.test.ts
$ (in app) npx vitest run checks/AP4.test.ts --reporter=default --reporter=json --outputFile.json=../tasks/tools/out/AP4-reference.ts.json
ok   stops what writes the property and leaves every other group playing
Tests  1 passed (1)
```
As it must be: passes.

### AP4 with other.ts

```
$ cp tasks/AP4/other.ts app/src/release.ts
$ cp tasks/AP4/check.test.ts app/checks/AP4.test.ts
$ (in app) npx vitest run checks/AP4.test.ts --reporter=default --reporter=json --outputFile.json=../tasks/tools/out/AP4-other.ts.json
ok   stops what writes the property and leaves every other group playing
Tests  1 passed (1)
```
As it must be: passes.

### AP4 with plain.ts

```
$ cp tasks/AP4/plain.ts app/src/release.ts
$ cp tasks/AP4/check.test.ts app/checks/AP4.test.ts
$ (in app) npx vitest run checks/AP4.test.ts --reporter=default --reporter=json --outputFile.json=../tasks/tools/out/AP4-plain.ts.json
FAIL stops what writes the property and leaves every other group playing
     AssertionError: expected 5.519999980926514 to be 5.389999866485596 // Object.is equality
Tests  1 failed (1)
```
As it must be: fails, and every failure is at an assertion.

### AP4 with hollow-all.ts

```
$ cp tasks/AP4/hollow-all.ts app/src/release.ts
$ cp tasks/AP4/check.test.ts app/checks/AP4.test.ts
$ (in app) npx vitest run checks/AP4.test.ts --reporter=default --reporter=json --outputFile.json=../tasks/tools/out/AP4-hollow-all.ts.json
FAIL stops what writes the property and leaves every other group playing
     AssertionError: expected -0.7799999713897705 to be close to -1.04, received difference is 0.2600000286102295, but expected 0.0005
Tests  1 failed (1)
```
As it must be: fails, and every failure is at an assertion.

### AP4 with hollow-owner.ts

```
$ cp tasks/AP4/hollow-owner.ts app/src/release.ts
$ cp tasks/AP4/check.test.ts app/checks/AP4.test.ts
$ (in app) npx vitest run checks/AP4.test.ts --reporter=default --reporter=json --outputFile.json=../tasks/tools/out/AP4-hollow-owner.ts.json
FAIL stops what writes the property and leaves every other group playing
     AssertionError: expected -0.7799999713897705 to be close to -1.04, received difference is 0.2600000286102295, but expected 0.0005
Tests  1 failed (1)
```
As it must be: fails, and every failure is at an assertion.

### AP4 with hollow-pin.ts

```
$ cp tasks/AP4/hollow-pin.ts app/src/release.ts
$ cp tasks/AP4/check.test.ts app/checks/AP4.test.ts
$ (in app) npx vitest run checks/AP4.test.ts --reporter=default --reporter=json --outputFile.json=../tasks/tools/out/AP4-hollow-pin.ts.json
FAIL stops what writes the property and leaves every other group playing
     AssertionError: expected 5.389999866485596 to be 42 // Object.is equality
Tests  1 failed (1)
```
As it must be: fails, and every failure is at an assertion.

### AP4 with hollow.ts

```
$ cp tasks/AP4/hollow.ts app/src/release.ts
$ cp tasks/AP4/check.test.ts app/checks/AP4.test.ts
$ (in app) npx vitest run checks/AP4.test.ts --reporter=default --reporter=json --outputFile.json=../tasks/tools/out/AP4-hollow.ts.json
FAIL stops what writes the property and leaves every other group playing
     AssertionError: expected 3.8999998569488525 to be close to 5.2, received difference is 1.3000001430511476, but expected 0.0005
Tests  1 failed (1)
```
As it must be: fails, and every failure is at an assertion.

## AP5 (code task, `src/beacon.ts`)

### AP5 with reference.ts

```
$ cp tasks/AP5/reference.ts app/src/beacon.ts
$ cp tasks/AP5/check.test.ts app/checks/AP5.test.ts
$ (in app) npx vitest run checks/AP5.test.ts --reporter=default --reporter=json --outputFile.json=../tasks/tools/out/AP5-reference.ts.json
ok   flashes once per period, at the strength asked, without shifting the rhythm
ok   keeps each beacon on its own period and strength on one manager
Tests  2 passed (2)
```
As it must be: passes.

### AP5 with other.ts

```
$ cp tasks/AP5/other.ts app/src/beacon.ts
$ cp tasks/AP5/check.test.ts app/checks/AP5.test.ts
$ (in app) npx vitest run checks/AP5.test.ts --reporter=default --reporter=json --outputFile.json=../tasks/tools/out/AP5-other.ts.json
ok   flashes once per period, at the strength asked, without shifting the rhythm
ok   keeps each beacon on its own period and strength on one manager
Tests  2 passed (2)
```
As it must be: passes.

### AP5 with plain.ts

```
$ cp tasks/AP5/plain.ts app/src/beacon.ts
$ cp tasks/AP5/check.test.ts app/checks/AP5.test.ts
$ (in app) npx vitest run checks/AP5.test.ts --reporter=default --reporter=json --outputFile.json=../tasks/tools/out/AP5-plain.ts.json
FAIL flashes once per period, at the strength asked, without shifting the rhythm
     AssertionError: expected 0.2499999850988388 to be close to +0, received difference is 0.2499999850988388, but expected 0.000049999999999999996
FAIL keeps each beacon on its own period and strength on one manager
     AssertionError: expected 0.23999996483325958 to be close to +0, received difference is 0.23999996483325958, but expected 0.000049999999999999996
Tests  2 failed (2)
```
As it must be: fails, and every failure is at an assertion.

### AP5 with hollow-restart.ts

```
$ cp tasks/AP5/hollow-restart.ts app/src/beacon.ts
$ cp tasks/AP5/check.test.ts app/checks/AP5.test.ts
$ (in app) npx vitest run checks/AP5.test.ts --reporter=default --reporter=json --outputFile.json=../tasks/tools/out/AP5-hollow-restart.ts.json
FAIL flashes once per period, at the strength asked, without shifting the rhythm
     AssertionError: expected 0.5 to be close to +0, received difference is 0.5, but expected 0.000049999999999999996
ok   keeps each beacon on its own period and strength on one manager
Tests  1 failed | 1 passed (2)
```
As it must be: fails, and every failure is at an assertion.

### AP5 with hollow.ts

```
$ cp tasks/AP5/hollow.ts app/src/beacon.ts
$ cp tasks/AP5/check.test.ts app/checks/AP5.test.ts
$ (in app) npx vitest run checks/AP5.test.ts --reporter=default --reporter=json --outputFile.json=../tasks/tools/out/AP5-hollow.ts.json
FAIL flashes once per period, at the strength asked, without shifting the rhythm
     AssertionError: expected 0.4999999701976776 to be close to 0.24999999999999828, received difference is 0.24999997019767933, but expected 0.000049999999999999996
FAIL keeps each beacon on its own period and strength on one manager
     AssertionError: expected 0.3999999761581421 to be close to 0.23999999999999996, received difference is 0.15999997615814213, but expected 0.000049999999999999996
Tests  2 failed (2)
```
As it must be: fails, and every failure is at an assertion.

## AP6 (code task, `src/timeline-loop.ts`)

### AP6 with reference.ts

```
$ cp tasks/AP6/reference.ts app/src/timeline-loop.ts
$ cp tasks/AP6/check.test.ts app/checks/AP6.test.ts
$ (in app) npx vitest run checks/AP6.test.ts --reporter=default --reporter=json --outputFile.json=../tasks/tools/out/AP6-reference.ts.json
ok   starts moving from the first key at once and loops straight back to it
ok   follows each track's own keys and frame rate, several at once
Tests  2 passed (2)
```
As it must be: passes.

### AP6 with other.ts

```
$ cp tasks/AP6/other.ts app/src/timeline-loop.ts
$ cp tasks/AP6/check.test.ts app/checks/AP6.test.ts
$ (in app) npx vitest run checks/AP6.test.ts --reporter=default --reporter=json --outputFile.json=../tasks/tools/out/AP6-other.ts.json
ok   starts moving from the first key at once and loops straight back to it
ok   follows each track's own keys and frame rate, several at once
Tests  2 passed (2)
```
As it must be: passes.

### AP6 with plain.ts

```
$ cp tasks/AP6/plain.ts app/src/timeline-loop.ts
$ cp tasks/AP6/check.test.ts app/checks/AP6.test.ts
$ (in app) npx vitest run checks/AP6.test.ts --reporter=default --reporter=json --outputFile.json=../tasks/tools/out/AP6-plain.ts.json
FAIL starts moving from the first key at once and loops straight back to it
     AssertionError: expected +0 to be close to 1.099999999999999, received difference is 1.099999999999999, but expected 0.0005
FAIL follows each track's own keys and frame rate, several at once
     AssertionError: expected -1 to be close to -1.28, received difference is 0.28, but expected 0.0005
Tests  2 failed (2)
```
As it must be: fails, and every failure is at an assertion.

### AP6 with hollow-hold.ts

```
$ cp tasks/AP6/hollow-hold.ts app/src/timeline-loop.ts
$ cp tasks/AP6/check.test.ts app/checks/AP6.test.ts
$ (in app) npx vitest run checks/AP6.test.ts --reporter=default --reporter=json --outputFile.json=../tasks/tools/out/AP6-hollow-hold.ts.json
FAIL starts moving from the first key at once and loops straight back to it
     AssertionError: expected +0 to be close to 0.900000000000008, received difference is 0.900000000000008, but expected 0.0005
FAIL follows each track's own keys and frame rate, several at once
     AssertionError: expected 0.8999999761581421 to be close to 0.2840000000000002, received difference is 0.6159999761581418, but expected 0.0005
Tests  2 failed (2)
```
As it must be: fails, and every failure is at an assertion.

### AP6 with hollow-rate.ts

```
$ cp tasks/AP6/hollow-rate.ts app/src/timeline-loop.ts
$ cp tasks/AP6/check.test.ts app/checks/AP6.test.ts
$ (in app) npx vitest run checks/AP6.test.ts --reporter=default --reporter=json --outputFile.json=../tasks/tools/out/AP6-hollow-rate.ts.json
FAIL starts moving from the first key at once and loops straight back to it
     AssertionError: expected 2.200000286102295 to be close to 1.099999999999999, received difference is 1.100000286102296, but expected 0.0005
FAIL follows each track's own keys and frame rate, several at once
     AssertionError: expected -1.7000000476837158 to be close to -1.28, received difference is 0.4200000476837158, but expected 0.0005
Tests  2 failed (2)
```
As it must be: fails, and every failure is at an assertion.

### AP6 with hollow.ts

```
$ cp tasks/AP6/hollow.ts app/src/timeline-loop.ts
$ cp tasks/AP6/check.test.ts app/checks/AP6.test.ts
$ (in app) npx vitest run checks/AP6.test.ts --reporter=default --reporter=json --outputFile.json=../tasks/tools/out/AP6-hollow.ts.json
FAIL starts moving from the first key at once and loops straight back to it
     AssertionError: expected +0 to be close to 0.900000000000008, received difference is 0.900000000000008, but expected 0.0005
FAIL follows each track's own keys and frame rate, several at once
     AssertionError: expected 0.8999999761581421 to be close to 0.2840000000000002, received difference is 0.6159999761581418, but expected 0.0005
Tests  2 failed (2)
```
As it must be: fails, and every failure is at an assertion.

## AP7 (question task)

### AP7 proof, expected.json as written

```
$ cp tasks/AP7/proof.test.ts app/checks/AP7.proof.test.ts
$ write the answer above to app/checks/AP7.expected.json
$ (in app) npx vitest run checks/AP7.proof.test.ts --reporter=default --reporter=json --outputFile.json=../tasks/tools/out/AP7-409.json
ok   orientationIsRotation and orientationHalfwayW
ok   rotationQuaternionIsRotation
ok   nestedRotationQuaternionIsRotation
ok   falseOptionMakesRotationQuaternionPlain
Tests  4 passed (4)
```
As it must be: passes.

### AP7 proof, expected.json with `orientationIsRotation` changed from false to true

```
$ cp tasks/AP7/proof.test.ts app/checks/AP7.proof.test.ts
$ write the answer above to app/checks/AP7.expected.json
$ (in app) npx vitest run checks/AP7.proof.test.ts --reporter=default --reporter=json --outputFile.json=../tasks/tools/out/AP7-421.json
FAIL orientationIsRotation and orientationHalfwayW
     AssertionError: expected false to be true // Object.is equality
ok   rotationQuaternionIsRotation
ok   nestedRotationQuaternionIsRotation
ok   falseOptionMakesRotationQuaternionPlain
Tests  1 failed | 3 passed (4)
```
As it must be: fails at an assertion.

### AP7 proof, expected.json with `orientationHalfwayW` changed from 0.5 to 1.5

```
$ cp tasks/AP7/proof.test.ts app/checks/AP7.proof.test.ts
$ write the answer above to app/checks/AP7.expected.json
$ (in app) npx vitest run checks/AP7.proof.test.ts --reporter=default --reporter=json --outputFile.json=../tasks/tools/out/AP7-434.json
FAIL orientationIsRotation and orientationHalfwayW
     AssertionError: expected 0.5 to be close to 1.5, received difference is 1, but expected 0.000049999999999999996
ok   rotationQuaternionIsRotation
ok   nestedRotationQuaternionIsRotation
ok   falseOptionMakesRotationQuaternionPlain
Tests  1 failed | 3 passed (4)
```
As it must be: fails at an assertion.

### AP7 proof, expected.json with `rotationQuaternionIsRotation` changed from true to false

```
$ cp tasks/AP7/proof.test.ts app/checks/AP7.proof.test.ts
$ write the answer above to app/checks/AP7.expected.json
$ (in app) npx vitest run checks/AP7.proof.test.ts --reporter=default --reporter=json --outputFile.json=../tasks/tools/out/AP7-447.json
ok   orientationIsRotation and orientationHalfwayW
FAIL rotationQuaternionIsRotation
     AssertionError: expected true to be false // Object.is equality
ok   nestedRotationQuaternionIsRotation
ok   falseOptionMakesRotationQuaternionPlain
Tests  1 failed | 3 passed (4)
```
As it must be: fails at an assertion.

### AP7 proof, expected.json with `nestedRotationQuaternionIsRotation` changed from true to false

```
$ cp tasks/AP7/proof.test.ts app/checks/AP7.proof.test.ts
$ write the answer above to app/checks/AP7.expected.json
$ (in app) npx vitest run checks/AP7.proof.test.ts --reporter=default --reporter=json --outputFile.json=../tasks/tools/out/AP7-460.json
ok   orientationIsRotation and orientationHalfwayW
ok   rotationQuaternionIsRotation
FAIL nestedRotationQuaternionIsRotation
     AssertionError: expected true to be false // Object.is equality
ok   falseOptionMakesRotationQuaternionPlain
Tests  1 failed | 3 passed (4)
```
As it must be: fails at an assertion.

### AP7 proof, expected.json with `falseOptionMakesRotationQuaternionPlain` changed from false to true

```
$ cp tasks/AP7/proof.test.ts app/checks/AP7.proof.test.ts
$ write the answer above to app/checks/AP7.expected.json
$ (in app) npx vitest run checks/AP7.proof.test.ts --reporter=default --reporter=json --outputFile.json=../tasks/tools/out/AP7-473.json
ok   orientationIsRotation and orientationHalfwayW
ok   rotationQuaternionIsRotation
ok   nestedRotationQuaternionIsRotation
FAIL falseOptionMakesRotationQuaternionPlain
     AssertionError: expected false to be true // Object.is equality
Tests  1 failed | 3 passed (4)
```
As it must be: fails at an assertion.

## AP8 (question task)

### AP8 proof, expected.json as written

```
$ cp tasks/AP8/proof.test.ts app/checks/AP8.proof.test.ts
$ write the answer above to app/checks/AP8.expected.json
$ (in app) npx vitest run checks/AP8.proof.test.ts --reporter=default --reporter=json --outputFile.json=../tasks/tools/out/AP8-487.json
ok   freshAngleAfterHalfSecond
ok   seekedAngleAfterHalfSecond and seekedIsPlayingAfterThreeSeconds
ok   loopingAngleAfterQuarterSecond
Tests  3 passed (3)
```
As it must be: passes.

### AP8 proof, expected.json with `freshAngleAfterHalfSecond` changed from 0 to 1

```
$ cp tasks/AP8/proof.test.ts app/checks/AP8.proof.test.ts
$ write the answer above to app/checks/AP8.expected.json
$ (in app) npx vitest run checks/AP8.proof.test.ts --reporter=default --reporter=json --outputFile.json=../tasks/tools/out/AP8-498.json
FAIL freshAngleAfterHalfSecond
     AssertionError: expected +0 to be close to 1, received difference is 1, but expected 0.0005
ok   seekedAngleAfterHalfSecond and seekedIsPlayingAfterThreeSeconds
ok   loopingAngleAfterQuarterSecond
Tests  1 failed | 2 passed (3)
```
As it must be: fails at an assertion.

### AP8 proof, expected.json with `seekedAngleAfterHalfSecond` changed from 45 to 46

```
$ cp tasks/AP8/proof.test.ts app/checks/AP8.proof.test.ts
$ write the answer above to app/checks/AP8.expected.json
$ (in app) npx vitest run checks/AP8.proof.test.ts --reporter=default --reporter=json --outputFile.json=../tasks/tools/out/AP8-510.json
ok   freshAngleAfterHalfSecond
FAIL seekedAngleAfterHalfSecond and seekedIsPlayingAfterThreeSeconds
     AssertionError: expected 45 to be close to 46, received difference is 1, but expected 0.0005
ok   loopingAngleAfterQuarterSecond
Tests  1 failed | 2 passed (3)
```
As it must be: fails at an assertion.

### AP8 proof, expected.json with `seekedIsPlayingAfterThreeSeconds` changed from true to false

```
$ cp tasks/AP8/proof.test.ts app/checks/AP8.proof.test.ts
$ write the answer above to app/checks/AP8.expected.json
$ (in app) npx vitest run checks/AP8.proof.test.ts --reporter=default --reporter=json --outputFile.json=../tasks/tools/out/AP8-522.json
ok   freshAngleAfterHalfSecond
FAIL seekedAngleAfterHalfSecond and seekedIsPlayingAfterThreeSeconds
     AssertionError: expected true to be false // Object.is equality
ok   loopingAngleAfterQuarterSecond
Tests  1 failed | 2 passed (3)
```
As it must be: fails at an assertion.

### AP8 proof, expected.json with `loopingAngleAfterQuarterSecond` changed from 67.5 to 68.5

```
$ cp tasks/AP8/proof.test.ts app/checks/AP8.proof.test.ts
$ write the answer above to app/checks/AP8.expected.json
$ (in app) npx vitest run checks/AP8.proof.test.ts --reporter=default --reporter=json --outputFile.json=../tasks/tools/out/AP8-534.json
ok   freshAngleAfterHalfSecond
ok   seekedAngleAfterHalfSecond and seekedIsPlayingAfterThreeSeconds
FAIL loopingAngleAfterQuarterSecond
     AssertionError: expected 67.5 to be close to 68.5, received difference is 1, but expected 0.0005
Tests  1 failed | 2 passed (3)
```
As it must be: fails at an assertion.

## After the runs

```
$ ls app/src
(empty)
$ ls app/checks
helpers.ts
```

Every run came out as it must: yes.
