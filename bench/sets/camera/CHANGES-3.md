# Mended checks: F2, G1, G2, G3 and K1

Written on 2026-11-19. Each mend follows `audit/findings.json` and `audit/README.md`. No where.md was changed. Two asks gained a few words: G1 and G2. No kept try was graded again.

`python3 bench/box.py check-tasks` was run on a copy of the set that held only these five tasks, with `--window stub` and with `--window none`. Both printed "all as they must be". Each reference answer and each other answer passes. Each plain answer and each hollow answer fails at an assertion.

For each task, one or two other right answers of another design were written outside the repository and run against the mended check. Each one passed.

## F2

**The check.** One test is added. After a jump, the same input goes to the answer and to a fresh library free camera at the new eye and target, given `attachFreeControl` on a canvas and a scene of its own. The input is a W hold, a drag of four moves with frames between them, and a D hold. On every frame the eye and the forward axis, read through the camera's own world matrix, must match the library camera within 1e-6. The ask's words "the library's usual keyboard and mouse controls" and "the controls carry on from that view" are what it tests.

**Hollow answer added.** `hollow.ts`, from `audit/hollow/F2-owncontrols.ts`. Its own fly and look code reads the heading from position and target each frame. Its speed, inertia and turn rate are not the library's.

**The ask.** Not changed.

## G1

**The check.** Two tests are added. Every mode before lay inside the camera's default limits, radius 10 to 4000. The first new test uses a mode of radius 5 to 6000. It writes 5000, 7, 9000 and 1, and a heading of 2, and reads the real values through the camera's own accessors, kept before the call. Then it switches back to a narrow mode. The second writes zoom and heading through `setGeospatialOrientation`, in a narrow mode and then in a wide one, and reads the real values the same way.

**Hollow answers added.**
- `hollow-wrap.ts`, from `audit/hollow/G1-wrap.ts`. It wraps the camera's radius and yaw setters to clamp by the new limits object. The camera still clamps by its own, so a mode wider than the defaults is cut.
- `hollow-own-storage.ts`, new, after the answers the test of 2026-11-18 was written for. It puts its own radius and yaw accessors, with their own storage, on the camera.

**The ask.** The new test needs a write inside the range to be kept as written. The ask did not say so.
- Before: "must be kept inside that mode's zoom range and heading range, and `camera.limits` must report that mode's values."
- After: "must be kept inside that mode's zoom range and heading range (a value already inside them stays as written), and `camera.limits` must report that mode's values."

## G2

**The check.** One test is added. It keeps the camera's own world matrix getter from before the calls. After each of three calls, and after a later heading write, it compares the view with a library camera put at the expected centre by `setGeospatialOrientation`, with the same zoom, heading and tilt. The eye, the three axes and `camera.position` must match. The zoom, heading and tilt are 1700, -0.8 and 0.6, not the defaults.

**Hollow answer added.** `hollow.ts`, from `audit/hollow/G2-inplace.ts`. It uses the right axes, but writes the point into the camera's own centre vector in place. `camera.center` reads right, but the eye and the view stay where they were.

**The ask.** The new test asks that the view moves with the centre. The ask said only that the centre point moves.
- Before: "It moves the camera's centre point to the ground point at that latitude and longitude"
- After: "It moves the camera's centre point, and with it the camera's view, to the ground point at that latitude and longitude"

## G3

**The check.** Five tests are added. They read the real pose through the camera's own accessors, kept before the call.
- A flight to a place with a heading of 3.5 must land there, up to whole turns, and settle true.
- Three flights that each change only the heading, only the tilt or only the zoom, cut short by another fly-to, must each settle false.
- Part way through a flight, four times, the zoom and tilt must lie between the start and the place, and the promise must not have settled. Then it must settle true.

**Hollow answers added.**
- `hollow-no-wrap.ts`, from `audit/hollow/G3-g3-nowrap.ts`. It compares the heading with no wrap, so a place with a heading past π never settles true.
- `hollow-centre-only.ts`, new, after the audit's centre-only answer. It judges arrival by the centre alone.
- `hollow-teleport.ts`, new, after the audit's teleport answer. It puts the camera at the place at once and waits out the time. The audit sorted it contrived. The ask's "flies the camera smoothly" rules it out.

**The ask.** Not changed. A heading of 3.5 is within the camera's default limits, and the ask says the places are within the limits.

## K1

**The check.** Two tests are added. The check never turns on the library's arrow-key control itself. In the first, after `createOrbitCamera`, a second camera attached with `{ keyboard: true }` must turn on ArrowLeft. That holds only when the library's control is on. In the second, the answer's camera and a library camera attached with `{ keyboard: true }` get the same keys: ArrowLeft, ArrowUp, Ctrl with ArrowLeft, Alt with ArrowUp and ArrowRight, each held for eight frames. After each, alpha, beta, radius and target must match within 1e-6, read through the camera's own accessors.

**Hollow answers added.**
- `hollow-own-keys.ts`, from `audit/hollow/K1-k1-ownkeys.ts`. Its own key handlers and a per-frame hook turn the camera. The library's control stays off.
- `hollow-keydown.ts`, new, after the audit's second answer. A bare keydown handler writes alpha.

**The ask.** Not changed. It already says "turns on the library's own arrow-key control".

## After a fresh attack

Written on 2026-11-19. A fresh adversary wrote new wrong answers for F2, G1, G2, G3 and K1. Each one below passed the mended check, and a probe showed it wrong on the library. Each was run again here, and passed before this mend. Each is now a hollow answer of its task, and fails at an assertion. No ask, where.md, reference or other answer was changed. No kept try was graded again.

`python3 bench/box.py check-tasks` was run on a copy of the set that held only these five tasks, with `--window stub` and with `--window none`. Both printed "all as they must be". The adversary's own right answers of another design were run against each mended check outside the repository. Each one passed.

### F2

**The check.** One test is added. The same input goes to the answer and to a library free camera given `attachFreeControl`. Before any jump, that camera is at the first eye and target. After the jump, it is a fresh camera at the new eye and target. The input holds W, ArrowUp, Space and ShiftLeft, and drags. Part of it comes in frames of 33 ms. The jump comes while the view still glides from a W hold. On every frame the eye and the forward axis must match. For 60 idle frames after the jump the eye must rest at the new eye. "The library's usual keyboard and mouse controls" and "jumpTo puts the viewer at the new eye" are what it tests.

**Hollow answers added.**
- `hollow-yawset.ts`. One camera. A jump writes the pose and the heading, and leaves the controls on, so the old glide carries the view off the new eye.
- `hollow-lazy.ts`. It attaches the controls only at the first jump, so before it W does nothing.
- `hollow-own.ts`. Its own WASD and drag controls, with a fixed step of 16 ms and no arrow keys, Space or Shift.

A fresh camera at each jump that keeps the default speed and field of view still passes. The adversary called it debatable. The ask does not say the speed carries across a jump.

### G1

**The check.** One test is added. Two modes have their own pitch range and pitch fade: null in one, an object in the other. After each switch, `camera.limits` must equal the mode in every field. "`camera.limits` must report that mode's values" is what it tests.

**Hollow answers added.**
- `hollow-four.ts`. It copies only the zoom and heading fields into the camera's own limits.
- `hollow-numeric.ts`. It copies only the number fields, and keeps the default pitch fade.

The check does not test that pitch is clamped by the mode. The ask names only zoom and heading.

### G2

**The check.** One test is added. It loads the library's right-handed build, by putting the right-handed `coordinate-system` module in place of the default one, and the answer afresh with it. That build's own east at the start is the other way. On planets of radius 1000 and 2500, from a camera whose centre is off the ground, three calls must put the centre on the surface, at the place the camera's own east, north and up give. "North and east must be the camera's own" and "a sphere of the camera's planet radius" are what it tests.

**Hollow answers added.**
- `hollow-fixed.ts`. It writes the default build's axes as numbers.
- `hollow-hypot.ts`. It takes the radius from the distance of the centre from the origin.

### G3

**The check.** Two tests are added.
- With `attachGeospatialControls` on a canvas, one wheel event at frame 8 stops the flight. The promise must settle false. Those controls listen on the window too, so with `--window none` the test puts a small stand-in window in place for itself, and takes it away after.
- A flight across 2.4 rad of longitude runs beside a library flight to the same place, on a camera and a scene of their own. On every frame the heading, tilt, zoom and centre must match, and the centre must stay on the sphere. The promise must not settle while the library flight is still going, and it must then settle true. "The library's ... fly-to animation" and "settles once the flight is over" are what it tests.

**Hollow answers added.**
- `hollow-cancelhook.ts`. It judges arrival by whether the camera's fly hook is empty.
- `hollow-owntween.ts`. Its own tween, with a straight-line centre that dips inside the planet.
- `hollow-poll.ts`. It settles true one frame before the flight is over.

### K1

**The check.** The last test now loads the library and the answer afresh, with `vi.resetModules()`, so the answer's `createOrbitCamera` is the first call ever. The library camera it is compared with comes from the same fresh load.

**Hollow answer added.** `hollow-late.ts`. It attaches with `{ keyboard: true }` first and turns the library's arrow-key control on after, so the first camera gets no keyboard.
