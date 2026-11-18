# Mend, round one

Seven tickets, seven mends: four notes mended in place (a, b, c, d), three new notes (e, f, g). The list goes from 78 notes / 15,260 bytes to 81 notes / 16,523 bytes rendered (limit 85 / 16,786). Nothing was cut to fit and no old notes were merged.

## Ticket e — note 5 (new)

Before: (none; new note)

After: An ArcRotateCamera's eye is target + radius*(cos(alpha)*sin(beta), cos(beta), sin(alpha)*sin(beta)), a sin(beta) of 0 read as 0.0001; a write to alpha or beta is stored as given until setCameraLimits runs. It looks at target with world up (0,1,0): if sin(beta) != 0, (alpha, -beta) views as (alpha + PI, beta).

Bytes added: 310 (310 after, 0 before)

Code: src/camera/arc-rotate.ts — localEyePosition 83-96; look-at with Vec3Up 101-110; alpha/beta/radius setters 160-178

Probe: mended/probes/ticket-e.test.ts

Blind reader's word: (not yet given)

## Ticket a — note 10 (mended)

Before: attachControl's keyboard: true is ignored unless enableArcRotateKeyboardControls() ran first. Keys are heard on the canvas (tabIndex made 0 if no tabindex attribute); held arrows add 1/angularSensitivity (default 100) per frame, normalised.

After: attachControl's keyboard: true is ignored unless enableArcRotateKeyboardControls() ran first. Each frame held keys add to the offsets: plain 1/angularSensitivity, Ctrl (over Alt) 1/panningSensitivity, both divided by hypot when two axes are held; Alt adds a full step on each axis. With Meta held nothing is added.

Bytes added: 74 (314 after, 240 before)

Code: src/camera/arc-rotate-keyboard-controls.ts — applyInput 106-139; key handlers 75-97; blur 99-104, 141-143

Probe: mended/probes/ticket-a.test.ts

Blind reader's word: (not yet given)

## Ticket b — note 14 (mended)

Before: resolveCameraViewport counts camera.viewport.y from the bottom but returns y from the top: {x:0,y:0,width:0.5,height:0.5} on 800x600 gives {x:0,y:300,width:400,height:300}. Edges are clamped to the canvas: {x:-0.5,width:1} gives width 400.

After: resolveCameraViewport counts camera.viewport.y from the bottom but returns y from the top: {x:0,y:0,width:0.5,height:0.5} on 800x600 gives {x:0,y:300,width:400,height:300}. It alone clamps edges to [0,1] ({x:-0.5,width:1} gives width 400); getEffectiveAspectRatio and _applyCameraViewport use raw fields.

Bytes added: 65 (304 after, 239 before)

Code: src/camera/viewport.ts; src/camera/camera.ts — resolveCameraViewport viewport.ts 14-31; getEffectiveAspectRatio camera.ts 236-239; _applyCameraViewport camera.ts 242-253

Probe: mended/probes/ticket-b.test.ts

Blind reader's word: (not yet given)

## Ticket c — note 37 (mended)

Before: getProjectionMatrix does not apply camera.viewport; pass getEffectiveAspectRatio(camera, width, height) as the aspect to match what is rendered.

After: getProjectionMatrix ignores camera.viewport. getEffectiveAspectRatio(camera, w, h) is w/h * viewport.width/viewport.height from the raw fields (w/h with no viewport): the shape of _applyCameraViewport's rectangle up to pixel rounding, not of resolveCameraViewport's when that clamps an edge.

Bytes added: 147 (291 after, 144 before)

Code: src/camera/camera.ts; src/camera/viewport.ts — getEffectiveAspectRatio camera.ts 236-239; _applyCameraViewport 242-253; resolveCameraViewport viewport.ts 20-31

Probe: mended/probes/ticket-c.test.ts

Blind reader's word: (not yet given)

## Ticket d — note 38 (mended)

Before: A change to GeospatialCamera.limits applies at the next yaw/pitch/radius write that changes the value, or at any center assignment (cam.center = cam.center works). limits.pitchDisabledRadiusScale = null allows full pitch at any radius.

After: A GeospatialCamera clamps by its original limits object: a field edit on it applies at the next yaw/pitch/radius write that changes the value or any center assignment (cam.center = cam.center works); assigning a new object to camera.limits changes no clamping. pitchDisabledRadiusScale = null allows full pitch.

Bytes added: 76 (311 after, 235 before)

Code: src/camera/geospatial-camera.ts; src/camera/geospatial-limits.ts — limits closure 209; applyOrientation clamps 234-279 (243-245); plain limits property 286; getEffectivePitchMax geospatial-limits.ts 56-70

Probe: mended/probes/ticket-d.test.ts

Blind reader's word: (not yet given)

## Ticket f — note 39 (new)

Before: (none; new note)

After: setGeospatialOrientation always re-applies wrapping and the camera's limits, even given no field; an omitted or null field keeps its current value. The yaw, pitch and radius setters do nothing when the value equals the stored (wrapped, clamped) one; the center setter always re-applies.

Bytes added: 286 (286 after, 0 before)

Code: src/camera/geospatial-camera.ts — setGeospatialOrientation 202-205; applyOrientation 234-279; center/yaw/pitch/radius setters 313-339

Probe: mended/probes/ticket-f.test.ts

Blind reader's word: (not yet given)

## Ticket g — note 43 (new)

Before: (none; new note)

After: attachFreeControl's drag starts on pointerdown with button 0, 1 or 2, any pointerType; each later pointermove turns by its clientX/clientY change from the last (movementX/Y are never read); any pointerup ends it and pointercancel is not heard. The turn is applied in the scene's frame step.

Bytes added: 290 (290 after, 0 before)

Code: src/camera/free-camera-controls.ts — onPointerDown/Move/Up 31-52; update 73-156; listeners 158-171

Probe: mended/probes/ticket-g.test.ts

Blind reader's word: (not yet given)

Total bytes added in note text: 1248; rendered list grows by 1263 bytes (new notes also add their number prefixes).

## Probe run

Copied the seven probes into app/checks, ran `npx vitest run checks/`, then removed them (only helpers.ts is left):

```
 Test Files  7 passed (7)
      Tests  29 passed (29)
```

## After the two readers

Each finding was tried by a test (the readers' reach tests were run once in app/checks, then removed; reach-a, -d and the pitch case of -g passed as the readers said, the parented case of reach-e gave x = 110 and reach-g's total turn was 0.481, both as the readers said). One line a finding:

- Flag, note 5 (e), gives values: mended. The derived (alpha, -beta) / (alpha + PI, beta) equivalence is dropped; the note states the formula and the up vector (0,1,0) only.
- Flag, note 38 (d), gives values: mended. "(cam.center = cam.center works)" is dropped; "any center assignment" stays.
- Wider, note 10 (a), Alt's vertical step: right (Alt+Up/Down left inertialBetaOffset at 0 and moved inertialRadiusOffset by +-1/zoomingSensitivity). Mended: "Alt alone: alpha as plain, Up 1/zoomingSensitivity to inertialRadiusOffset, no hypot". Probe a: "Alt Up/Down go to inertialRadiusOffset...".
- Wider, note 10 (a), arrow pressed under Meta: right (arrow-keydown with metaKey is not recorded, line 83; after Meta's keyup it adds nothing; its next keydown adds 0.01). Mended: "Keys down under Meta are void." Probe a: two new cases, including an arrow held before Meta, which counts again once Meta is released.
- Wider, note 38 (d), attachGeospatialControls reads the new camera.limits: right (wheel zoom-in stopped at a new radiusMin of 3990; geospatial-camera-controls.ts 140, 322-358, 393). Mended: "A new camera.limits object is read by attachGeospatialControls (zoom, planetRadius), not by it" (by the camera's clamp). Probe d: new case; also shows a wider new radiusMax still ends at the original 4R.
- Wider, note 5 (e), parent: right (getCameraPosition reads worldMatrix[12..14], camera.ts 230-233, which is the local matrix carried by the parent). Mended: the formula is "in its parent's space (getCameraPosition gives world space)" and the look-at with up (0,1,0) is "there". Probe e: turned and moved parent, eye and whole world matrix.
- Wider, note 43 (g), inertia, pitch clamp and sign: right (default inertia 0.9: steps 0.05, 0.045, ... total 0.481 because the accumulator is zeroed under speed*0.001; _pitch -= dy part, clamped to +-(PI/2 - 0.01); free-camera-controls.ts 103-156). Mended: "each frame of its scene adds x to _yaw (left-handed), y to -_pitch, within +-(PI/2-0.01), then scales both by inertia, 0 under speed*0.001". The right-handed build negates the yaw step (line 106) and is named as the case the note does not hold for. Probe g: two new cases.
- Unclear, note 10 (a), which offsets and the vertical step: mended, the fields are named (inertialAlpha/BetaOffset, inertialPanningX/Y, inertialRadiusOffset) and Alt's vertical step is given.
- Unclear, note 10 (a), signs: not mended. The signs (plain Up lowers beta's offset, Ctrl+Up raises inertialPanningY, Alt+Up raises inertialRadiusOffset) are those of Babylon.js's keyboard input, which the reader knows, and the note had no room left within 320 bytes.
- Unclear, note 14 (b), "it alone" and "raw fields": mended, now "It clamps edges to [0,1] ...; getEffectiveAspectRatio and _applyCameraViewport clamp nothing". That getEffectiveAspectRatio reads only width and height is in note 37's formula.
- Unclear, note 37 (c), "shape": mended, now "the width/height ratio of _applyCameraViewport's rectangle".
- Unclear, note 38 (d), "original limits object" and the controls' zoom: mended, now "the limits object it was made with", and the controls are named as readers of camera.limits.
- Unclear, note 5 (e), "eye" and "views as": mended, the space is named and "views as" is gone with the equivalence.
- Unclear, note 39 (f), "wrapping" and "the camera's limits": mended, now "wraps yaw and pitch to [-PI, PI)"; "the camera's limits" is the object note 38 now names. Probe f: new case for pitch wrapping.
- Unclear, note 43 (g), names, division, signs, inertia, pitch clamp, scene: mended, all are now in the note; "each frame of its scene" says the turn needs the scene passed. Probe g covers each (the no-scene case was already there).

Notes after: 5: 300 bytes (-10), 10: 317 (+3), 14: 297 (-7), 37: 304 (+13), 38: 316 (+5), 39: 310 (+24), 43: 317 (+27). The list is 81 notes and 16,578 bytes rendered (limit 85 / 16,786). Nothing outside the seven notes was touched.

Probe run, after the change (probes copied into app/checks, run, removed; only helpers.ts left):

```
 Test Files  7 passed (7)
      Tests  37 passed (37)
```

## A last pass for plain words

This pass mends two faults of the pass above: old words that no ticket faulted had been lost from the notes of tickets a, b, c and d, and several notes had become shorthand. Each old note's "was" was set beside its ticket, every unfaulted clause was put back word for word (none was found false), and every mended and new note was rewritten in whole sentences. Ticket a's note was split into two notes that stand next to each other (10 and 11, both "mended": "a"). No note outside the seven was touched; old notes moved down by one from 11 on.

Numbers below are those of mended.md now.

### Ticket a, notes 10 and 11 (note 10 before)

Before: attachControl keys need enableArcRotateKeyboardControls(). Per frame held arrows add 1/angularSensitivity to inertialAlpha/BetaOffset, with Ctrl 1/panningSensitivity to inertialPanningX/Y, over hypot; Alt alone: alpha as plain, Up 1/zoomingSensitivity to inertialRadiusOffset, no hypot. Keys down under Meta are void.

After, note 10: attachControl's keyboard: true is ignored unless enableArcRotateKeyboardControls() ran first. Keys are heard on the canvas (tabIndex made 0 if no tabindex attribute); held arrows add 1/angularSensitivity (default 100) per frame. While Meta is held, no key adds anything.

After, note 11: With Ctrl held, and Alt or not, held arrows add 1/panningSensitivity instead, to inertialPanningX/Y. With no modifier or with Ctrl, each step is divided by sqrt(2) while one arrow on each axis is held; with Alt and no Ctrl, it is never divided.

Put back: the first sentence exactly, "Keys are heard on the canvas (tabIndex made 0 if no tabindex attribute)", "held arrows add 1/angularSensitivity (default 100) per frame". Only "normalised" was faulted, and it is replaced by note 11's second sentence.

Left out: that the plain step goes to inertialAlphaOffset and inertialBetaOffset (note 42: ArrowUp lowers beta, ArrowRight raises alpha); that with Alt and no Ctrl Up/Down add 1/zoomingSensitivity to inertialRadiusOffset (note 42 states it for ArrowUp, with default 25); that an arrow pressed while Meta is held adds nothing after Meta is released until it is pressed again (none states it; it is the detail furthest from what the ticket named, which is the normalising and the divisor of each branch).

Probe a: two new cases, keys heard on the canvas with tabIndex 0 only when no tabindex attribute, and Left+Right+Up held (the cancelled axis does not divide the step).

### Ticket b, note 15 (note 14 before)

Before: resolveCameraViewport counts camera.viewport.y from the bottom but returns y from the top: {x:0,y:0,width:0.5,height:0.5} on 800x600 gives {x:0,y:300,width:400,height:300}. It clamps edges to [0,1] ({x:-0.5,width:1} gives width 400); getEffectiveAspectRatio and _applyCameraViewport clamp nothing.

After: resolveCameraViewport counts camera.viewport.y from the bottom but returns y from the top: {x:0,y:0,width:0.5,height:0.5} on 800x600 gives {x:0,y:300,width:400,height:300}. Its edges are clamped to the canvas: {x:-0.5,width:1} gives width 400. getEffectiveAspectRatio and _applyCameraViewport clamp nothing.

Put back: "Edges are clamped to the canvas: {x:-0.5,width:1} gives width 400", with "Its" for the scope the ticket faulted. Left out: nothing.

### Ticket c, note 38 (note 37 before)

Before: getProjectionMatrix ignores camera.viewport. getEffectiveAspectRatio(camera, w, h) is w/h * viewport.width/viewport.height from the raw fields (w/h with no viewport): the width/height ratio of _applyCameraViewport's rectangle up to pixel rounding, not of resolveCameraViewport's when that clamps an edge.

After: getProjectionMatrix does not apply camera.viewport; pass getEffectiveAspectRatio(camera, width, height) as the aspect to match what is rendered. That ratio is width/height * viewport.width/viewport.height, or width/height with no viewport, unrounded, and differs from resolveCameraViewport's when that clamps an edge.

Put back: the whole old sentence, which the ticket does not fault (the render passes set their rectangle with _applyCameraViewport, whose ratio the probe shows it matches). Left out: the name _applyCameraViewport as the rectangle it matches (said by the restored "to match what is rendered"; note 15 names _applyCameraViewport and says it clamps nothing).

### Ticket d, note 39 (note 38 before)

Before: A GeospatialCamera clamps by the limits object it was made with: a field edit applies at the next yaw/pitch/radius write that changes the value or any center assignment. A new camera.limits object is read by attachGeospatialControls (zoom, planetRadius), not by it. pitchDisabledRadiusScale = null allows full pitch.

After: An edit to a field of GeospatialCamera.limits applies at the next yaw/pitch/radius write that changes the value, or at any center assignment (cam.center = cam.center works). A new object assigned to limits is never used by the camera's clamps. limits.pitchDisabledRadiusScale = null allows full pitch at any radius.

Put back: "applies at the next yaw/pitch/radius write that changes the value, or at any center assignment (cam.center = cam.center works)", "limits.pitchDisabledRadiusScale = null allows full pitch at any radius". Only "A change to" was faulted; it is now "An edit to a field of", and the new second sentence says what an assigned object does. Left out: that attachGeospatialControls reads the newly assigned object for its zoom range and planetRadius (none states it; it is furthest from what the ticket named, the camera's own clamping).

### Ticket e, note 5

Before: An ArcRotateCamera's eye in its parent's space (getCameraPosition gives world space) is target + radius*(cos(alpha)*sin(beta), cos(beta), sin(alpha)*sin(beta)), a sin(beta) of 0 read as 0.0001; alpha and beta are stored as written until setCameraLimits runs. It looks at target there with up (0,1,0).

After: An ArcRotateCamera puts its eye at target + radius * (cos(alpha)*sin(beta), cos(beta), sin(alpha)*sin(beta)) in its parent's space, using 0.0001 for sin(beta) when it is exactly 0. The camera looks at target with up (0,1,0). alpha and beta stay as written until setCameraLimits runs.

Left out: "getCameraPosition gives world space" (note 79: getCameraPosition reads the world matrix translation, so it includes the camera's parent transform). Probe e: one new case, the right axis is level and the forward axis points from eye to target for many alpha and beta.

### Ticket f, note 40 (note 39 before)

Before: setGeospatialOrientation always wraps yaw and pitch to [-PI, PI) and re-applies the camera's limits, even given no field; an omitted or null field keeps its current value. The yaw, pitch and radius setters do nothing when the value equals the stored (wrapped, clamped) one; the center setter always re-applies.

After: setGeospatialOrientation always wraps yaw and pitch to [-PI, PI) and applies the camera's limits again, even when given no field; an omitted or null field keeps its current value. The yaw, pitch and radius setters do nothing when the value written equals the stored, wrapped and clamped value.

Left out: "the center setter always re-applies" (note 39: "or at any center assignment (cam.center = cam.center works)").

### Ticket g, note 44 (note 43 before)

Before: attachFreeControl drags from pointerdown (button 0-2, any pointerType) to any pointerup, not pointercancel. A move adds its clientX/Y change/angularSensitivity, not movementX/Y; each frame of its scene adds x to _yaw (left-handed), y to -_pitch, within +-(PI/2-0.01), then scales both by inertia, 0 under speed*0.001.

After: attachFreeControl's drag starts on a pointerdown with button 0, 1 or 2 of any pointerType and ends on any pointerup, not on pointercancel. Each pointermove in it, whatever its buttons, pointerType or pointerId, turns by its clientX and clientY change divided by angularSensitivity; movementX and movementY are not read.

Left out: that the turn needs the scene and is applied in its frames (note 32: without a scene the free controls never move the camera, all motion is in their _beforeRender step; note 43: a turn velocity applied each frame); the signs on _yaw and _pitch (note 43: right drag turns right, down looks down; note 81: the right-handed build flips yaw); the pitch clamp to +-(PI/2-0.01) (note 43); the inertia scaling (note 43: then times inertia, so it coasts); the zeroing under speed * 0.001 (note 69). Added: the pointermove is not checked for buttons, pointerType or pointerId (the ticket names it; probe g already ran a move with buttons 0, another pointerType and pointerId 9).

### Bounds and probe run

The list is 82 notes and 16,770 bytes rendered (limit 85 / 16,786); every note is at most 320 bytes. Probes copied into app/checks, run with `npx vitest run checks/`, then removed (only helpers.ts is left):

```
 Test Files  7 passed (7)
      Tests  40 passed (40)
```

## One sentence taken out by the owning session, 2026-11-18

Note 5 ended "alpha and beta stay as written until setCameraLimits runs." Note 9 of the same list says that attachControl's frame step clamps beta on frames where an inertial offset is not zero. So the sentence said more than is true, and the two notes could be read as disagreeing. Note 2 already says that the limit fields clamp no write until setCameraLimits runs. The sentence is deleted and nothing is added. The owning session has seen the tasks, which the mender had not: this is the one change to the list made by a reader who had.
