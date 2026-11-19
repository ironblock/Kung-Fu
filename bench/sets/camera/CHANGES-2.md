# Mended checks: B4, B5, B6, C4 and F1

Written on 2026-11-19. Each mend follows `audit/findings.json` and `audit/README.md`. No where.md was changed. B6 has a new version of its ask. No kept try was graded again.

`python3 bench/box.py check-tasks` was run on a copy of the set that held only these five tasks, with `--window stub` and with `--window none`. Both printed "all as they must be". Each reference answer and each other answer passes. Each plain answer and each hollow answer fails at an assertion.

For each task, two other right answers of another design were written outside the repository and run against the mended check. Each one passed. A few wrong answers of other kinds were run too, and each one failed.

## B4

**The check.** Each test keeps the camera's own `pitch`, `yaw`, `radius`, `center` and `worldMatrix` getters before the call, and reads the camera only through them. After each call, and after each later zoom, the real pitch, yaw, radius and centre must be as asked. The eye and the line of sight, read from the kept world matrix, must show the same pose as the library's `computeLookAtFromYawPitch` for that heading and tilt. One test is added: a planet of radius 6000, a heading of 1.0 and a moved centre, tilted to 0.9 and then zoomed to 2.5x and 3.5x the planet radius.

**Hollow answer added.** `hollow.ts`, from `audit/hollow/B4-h1-shadow-pitch-and-position.ts`. It puts its own `pitch` with its own storage on the camera and writes the eye itself. The camera's real pitch stays 0.001. A second wrong answer, one that sets the pose with heading 0, was run and fails the new test. It was not added to the task.

**The ask.** Not changed. It already says the call must not change the zoom, the heading or the centre, whatever the zoom.

## B5

**The check.** Three tests are added. Each compares the answer with the library's own `projectWorldToScreen` in CSS pixels, for a camera off the origin that looks up and to the side, and for points off the centre. The first uses a canvas of 1600 x 1200 backing pixels shown at 800 x 600 CSS pixels. The second uses a wide canvas, 1800 x 600 backing pixels shown at 1200 x 400. The third asks for a point ten million units away straight ahead, which must be visible. The fake canvas's `getBoundingClientRect` reports the CSS size too.

**Hollow answer added.** `hollow.ts`, from `audit/hollow/B5-h1-backing-pixels.ts`. It returns the projection in backing pixels, not CSS pixels. A second wrong answer, one that pushes the far plane to 1e6, was run and fails the new third test. It was not added to the task.

**The ask.** Not changed. It already says "in CSS pixels" and "however far away it is".

## B6

**This is a new version of the task.** The tries already kept answered the old ask. The old ask is kept as `ask-v1.md`, beside the new `ask.md`. Those tries are graded by the check as it stood when they ran.

**The check.** Two tests are added. The first banks a still camera 10 times, with the car's up along the line of sight twice. It reads `getViewMatrix` once before each bank and once after, as a renderer does. The view must follow every bank. The second moves `camera.position` and `camera.target` before each bank, as the new ask says the app does. It goes over a crest to a new line of sight. It banks across that line with an up that has a part along it, then along it both ways. It then turns to a third line of sight, along which the first line of sight is just an ordinary up. Each time the view must look at the target, with the up the library can give that is closest to the car's up, or with the previous roll. The view matrix and the camera's own world matrix must agree.

**Hollow answer added.** `hollow.ts`, from `audit/hollow/B6-h2-sight-fixed-at-creation.ts`. It works out the line of sight once, when the camera is made.

**The other answer.** `other.ts` was wrong for the new ask. It worked out the line of sight once, when the camera was made, as the hollow answer does. It now reads the line of sight from `camera.position` and `camera.target` on each call. It still tests the up by its dot product with that line. The old `other.ts` fails the mended check, as it must.

**The ask.** Changed in its last paragraph. The ask had 144 words, and the new sentence would have taken it past 150, so two other sentences were made shorter. Their meaning is the same.

- Before: "Each frame we call `bank(up)` with the car's up direction (a unit vector)."
- After: "Each frame we move `camera.position` and `camera.target` with the car, then call `bank(up)` with the car's up direction (a unit vector)."
- Before: "as closely as it can while it keeps looking at the target."
- After: "as closely as it can while still looking at the target."
- Before: "On such a call the camera must keep looking at the target and keep its previous roll."
- After: "On such a call it must still look at the target and keep its previous roll."

The new ask has 150 words. It does not say how the library falls back for an up along the line of sight. where.md is still true.

## C4

**The check.** Four tests are added: 0.75, 1 and 2 turns at frames of 16 ms, and 1.5 turns at frames of 33 ms. Each reads alpha through the camera's own getter, kept before the call. The library's easing closes a fixed share of the rest of the way each frame. So within one transition, each frame's step is the same fraction of the step before, and that fraction is below 1. More than 80% of the step ratios must equal the commonest one, and it must lie between 0 and 1. That holds whatever the ease factor and however the turn is cut into legs.

**Hollow answer added.** `hollow.ts`, from `audit/hollow/C4-h1-own-tween.ts`. It runs its own smoothstep tween, so its steps grow and then shrink.

**The ask.** Not changed. It already names the library's own smooth camera-transition easing. "Values such as 0.75, 1 and 2" admits 1.5.

## F1

**The check.** Each movement key is now held in its own test: W, A, S, D, the four arrows, Space, PageUp, ShiftLeft, ShiftRight and PageDown. Before, only five were. Two tests are added, one at frames of 16 ms and one at 33 ms. Each holds W, drags while W is held, flies on, lets go and ticks to rest. It reads the look from the camera's own world matrix after every frame. The look must end within 1e-3 rad of where the library's default controls leave it after the same input.

**Hollow answer added.** `hollow.ts`, from `audit/hollow/F1-boostheld.ts`. It raises `camera.speed` 20 times while a movement key is held. That cuts off the glide of a drag made while W is held.

**The ask.** Not changed. It already says the same drag must turn the camera by the same total amount, and it names every movement key.

## After a fresh attack

Written on 2026-11-19. A fresh adversary wrote new wrong answers for these five tasks after the mends above. Each one below passed the mended check, and a probe showed it wrong on the library. Each check was mended again, and each such answer was added to its task as a `hollow-<name>.ts` answer. No ask, reference answer, other answer or where.md was changed. No kept try was graded again.

`python3 bench/box.py check-tasks` was run on a copy of the set that held only these five tasks, with `--window stub` and with `--window none`. Both printed "all as they must be". The adversary's own right answer of another design for each task was run against each mended check outside the repository, and each one passed.

### B4

**Hollow answers added.** `hollow-fade-off-when-short.ts` turns off the pitch fade only when the tilt is out of reach at the current zoom. A camera tilted close up then loses the tilt when it is moved out. `hollow-fade-to-radius-max.ts` moves the fade out to the camera's farthest zoom. When the app asks for a zoom past that, the library clamps the pitch before it clamps the radius, so the tilt is lost. `hollow-wrap-radius-setter.ts` wraps the camera's radius setter. A zoom through `setGeospatialOrientation` does not go through it, so the tilt is lost.

**The check.** Three tests are added, each from "the camera must also stay at that tilt when the app later moves it nearer to or farther from the globe". The first tilts a camera at 1.5x the planet radius, then moves it out to 3.5x and 4x. The second asks for 6x, past the farthest zoom. The pose must hold at whatever radius the camera then has. The third zooms with `setGeospatialOrientation`, out and back in.

### B5

**Hollow answers added.** `hollow-any-past-far.ts` counts any point past the far plane as visible, even outside the picture, and hides a point nearer than the near plane. `hollow-push-far-plane.ts` pushes the far plane out for the call and uses the library's `clipped` flag, so it hides a point nearer than the near plane. `hollow-own-perspective.ts` does its own perspective from `camera.fov`, which is wrong for an orthographic camera.

**The check.** Three tests are added. A point past the far plane and outside the picture must not be visible, from "a point in front of the camera but outside the picture is not visible". A point in the picture and nearer than the near plane must be visible, from "in front of the camera and inside the picture". For a camera made orthographic with `enableOrthographicCamera`, the place and the visibility of three points must be the library's own `projectWorldToScreen`.

### B6

**Hollow answers added.** `hollow-wide-along-band.ts` keeps the previous roll for any up within about 8 degrees of the line of sight. `hollow-tiny-threshold.ts` keeps it only when the up is within 1e-14 of the line. An up 1e-12 off the line then makes the library fall back to an identity rotation, and the camera stops looking at the target.

**The check.** One test is added. It banks with ups 2 to 5 degrees off the line of sight, leaning sideways. The view must roll to the picture-up nearest each, from "rolls so that up in its picture matches that direction as closely as it can". It then banks with ups 1e-12 off the line, either way. The camera must still look at the target, with its previous roll or with the nearest picture-up.

### C4

**Hollow answers added.** `hollow-fixed-share-per-frame.ts` runs its own loop that closes a tenth of the rest of the way each frame, whatever the frame length. `hollow-fixed-60fps-step.ts` uses the library's damping, but for a fixed 60 fps frame.

**The check.** One test is added. It runs one turn at frames of 16 ms and at frames of 33 ms, and finds the step ratio most frames share at each. The library's easing keeps the same share per unit of time, so ln(r33)/ln(r16) must be about 33/16. That holds whatever the ease factor, so `other.ts`, with its factor of 0.15, still passes. The ask names the library's own easing.

### F1

**Hollow answers added.** `hollow-stretch-any-move.ts` stretches by 20 any change of position since its last frame, so it stretches a move the app makes itself. `hollow-fixed-16ms-push.ts` adds its own push worked out for frames of 16 ms, so at 33 ms it moves about 10 times as far as the default, not 20.

**The check.** Five tests are added. Four hold W, the left arrow, Space and PageDown at frames of 33 ms, and the distance must be 20 times the default's. The fifth has the app move the camera itself, with no key held. The position and target must stay where the app put them, as the default leaves them, from "with one change".
