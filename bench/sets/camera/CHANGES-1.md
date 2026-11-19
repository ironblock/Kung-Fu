# Mended checks: A1, A3, B1, B2 and B3

Written on 2026-11-19. Each mend follows `audit/findings.json` and `audit/README.md`. No ask and no where.md was changed. No kept try was graded again.

`python3 bench/box.py check-tasks` was run on a copy of the set that held only these five tasks. It printed "all as they must be". Each reference answer and each other answer passes. Each plain answer and each hollow answer fails at an assertion.

For each task, two or more other right answers of another design were written outside the repository and run against the mended check. Each one passed.

## A1

**The check.** Each test keeps the camera's own `worldMatrix` getter before `focusOn` runs. It reads the eye, and where the point lands in view space, through that kept getter. It does this after the first call, after the second call, after the app writes `alpha` and `radius`, and after a new write to `beta`. The step with `beta` is new.

**Hollow answer added.** `hollow.ts`, from `audit/hollow/A1-shadow-world.ts`. It puts its own `worldMatrix` and `worldMatrixVersion` on the camera, and they report a second camera. The camera itself never moves.

**The ask.** Not changed.

## A3

**The check.** Two tests are added. The first uses a canvas of 1600 x 1200 backing pixels shown at 800 x 600 CSS pixels, with the window's pixel ratio set to 2 while it runs. The camera turns and zooms. Then it is marked, tilted and given a new field of view. The second uses a free camera that moves and turns, with a mark between two steps. Each shift is compared with the library's own projection in CSS pixels. The helper that gives the library's projection now passes the CSS size too.

**Hollow answer added.** `hollow.ts`, from `audit/hollow/A3-backing-px.ts`. It copies the matrices but measures in backing pixels. On the new canvas it reports twice the CSS shift.

**The ask.** Not changed. It already says "in CSS pixels" and takes any `Camera`.

## B1

**The check.** The setup keeps the camera's own `radius` and `worldMatrix` getters before the call. After every frame, and right after the call, the radius read through the kept getter must equal `camera.radius`. The eye's distance from the target, read through the kept world matrix, must equal it too and stay between 2 and 6. Each wheel test sends a second wheel event after ten frames. The pinch test runs more frames after each move. The zoom must show in the eye, not only in `camera.radius`.

**Hollow answer added.** `hollow.ts`, from `audit/hollow/B1-own-radius.ts`. It puts a clamping `radius` with its own storage on the camera. The camera's own radius setter never runs, so the eye never moves.

**The ask.** Not changed.

## B2

**The check.** The setup keeps the camera's own `alpha`, `beta` and `worldMatrix` getters before the controls are attached. The turn is read through them. The eye in the kept world matrix must agree with those angles; for `alpha`, up to whole turns. A drag is now ten moves with a frame after each, then the glide. A new test drags twice on a diagonal and asks for twice the turn both ways. The moves are kept big enough that the library's own cut-off of a small glide does not change the ratio for a right answer.

**Hollow answers added.**
- `hollow-own-angles.ts`, from `audit/hollow/B2-own-angles.ts`. Its own `alpha` and `beta` with their own storage double each change, and the camera never turns.
- `hollow-double-offsets.ts`, new, after the second answer the audit names. It doubles the glide offsets on each pointer move. That is twice the turn for a drag of one move, and far more than twice for a drag of many moves.

**The ask.** Not changed.

## B3

**The check.** The setup keeps the camera's own `worldMatrix` getter before the controls are attached. On every frame the eye read through it must be where `camera.position` says. Two tests are added. In the first, a mouse drag of six moves, with a frame after each, must turn the view's forward axis as the library's own mouse look turns it. Then W must move the eye along that forward axis. In the second, a camera faces +X: W moves it along +X at the same height, and Shift with W moves it three times as far.

**Hollow answers added.**
- `hollow-yaw-without-target.ts`, from `audit/hollow/B3-h3-yaw-without-target.ts`. Its own controls turn `_yaw` and `_pitch` on a drag, but never move `camera.target`, so the view never turns.
- `hollow-keys-only.ts`, new, after the audit's keyboard-only answer. It has right keys and no mouse look.

**The ask.** Not changed. It already asks for "the library's keyboard and mouse fly controls" and "the mouse to look around".

## After a fresh attack

Written on 2026-11-19. A fresh adversary wrote new wrong answers for these five tasks. Each one passed the mended check. Each was run again here against the check, and a probe of the library's real state showed it wrong. Then each check was mended again. No ask and no where.md was changed. No kept try was graded again.

`python3 bench/box.py check-tasks` was run on a copy of the set that held only these five tasks. It printed "all as they must be". The adversary's right answer of another design for each task was also run against the mended check. Each one passed.

### A1

**The check.** One test is added. The library's default controls are attached, and `focusOn` runs. The camera's own `target` must then read the point. A right-drag pans with the library's controls. On every frame the eye in the kept world matrix must follow the moved target, and the camera must still look at it.

**Hollow answers added.**
- `hollow-replace-nudge.ts`. It puts a new plain object on `camera.target` and nudges `alpha` so the camera rebuilds. The camera no longer sees writes to its target, so a pan moves the target and not the eye.
- `hollow-alias-nudge.ts`. The same, with the caller's own point as the target.
- `hollow-pivot-parent.ts`. It parents the camera to a node that it moves. The camera's own target stays at the old centre.

### A3

**The check.** Two tests are added. The first uses a canvas of 400 x 300 backing pixels shown at 800 x 600 CSS pixels, with the pixel ratio at 2, and a canvas of 400 x 400 backing pixels shown at 800 x 600. The second uses an orthographic camera whose half height changes. Each shift is compared with the library's projection in CSS pixels.

**Hollow answers added.**
- `hollow-own-perspective.ts`. Its own pinhole projection with the CSS aspect. It is wrong for an orthographic camera and on a stretched canvas.
- `hollow-dpr.ts`. It divides the backing-pixel shift by the pixel ratio. It is wrong when the backing size is not the ratio times the CSS size.
- `hollow-clone-pose.ts`. It marks by building a fresh camera from the pose, and so loses orthographic mode.

### B1

**The check.** One test is added. The wheel pushes hard against the far limit. Then a small turn back in must bring the eye inside the far limit within two frames. The ask says zooming must keep working.

**Hollow answers added.**
- `hollow-frame-clamp.ts`. It clamps the radius each frame. The zoom's momentum is not stopped at the wall, so a turn back in is lost.
- `hollow-wrap-setter.ts`. It wraps the camera's own radius setter to clamp. It has the same fault.

The adversary also asked that the radius be checked right after a pinch move, before any frame. That was not added. The ask speaks of every frame, and both hollow answers already fail.

### B2

**The check.** Two tests are added. A right-drag must pan exactly as the default controls pan. The ask allows one change, the drag's turn. After the controls are attached, the app's own writes to `alpha` and `beta` must read back exactly through the kept getters.

**Hollow answers added.**
- `hollow-all-sens.ts`. It halves the pan's sensibility too, so a pan goes twice as far.
- `hollow-double-setters.ts`. It wraps the camera's angle setters to double each change. The app's own writes are doubled too.

### B3

**The check.** One test is added. A, D, S, the four arrow keys, Shift with D, both Shifts with W, and a held Shift's repeated key downs with W are each played on the subject's controls and on the library's fly controls with Shift as the fast key and a multiplier of 3. It is done for a camera facing +Z and one facing +X. The eye must move the same way in each.

**Hollow answers added.**
- `hollow-speed-toggle.ts`. It multiplies `camera.speed` by 3 on each Shift key down. Both Shifts give 9 times, and repeats give more.
- `hollow-own-keys.ts`. Its own controls, with the right vector the wrong way for this library. D and the right arrow move left.
