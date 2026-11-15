# A4: what an orbit camera does past the pole

**The behaviour.** The arc-rotate camera always looks at its target with world up, so a `beta` below 0 only puts the eye on the far side of the vertical axis, upright: the view is exactly that of `alpha + π` with `-beta`, never upside down.

**What the reader would answer, and why.** It gets the position right from the usual formula (`eyeX = 10·cos 0·sin(-0.5) ≈ -4.79`, `eyeY = 10·cos(-0.5) ≈ 8.78`), but answers `upright: false` and `sameAsOtherSide: false`. In Babylon.js `ArcRotateCamera.allowUpsideDown` defaults to true and the view matrix negates the up vector when `sin(beta) < 0`, so dragging over the top turns the picture upside down, which differs from the camera at `alpha + π`. `names/arc-rotate.d.ts` shows no up vector and no `allowUpsideDown`, so nothing tells the reader that the flip is not there.

**What decides it**, in `babylon-lite/packages/babylon-lite/src/camera/arc-rotate.ts`:
- lines 83-96: `localEyePosition` places the eye at `target + r·(cosα·sinβ, cosβ, sinα·sinβ)`, with no special case for negative `sinβ` (only `sinβ === 0` is nudged).
- lines 101-111: `cameraLocalWorldMatrix` builds the look-at with the constant `Vec3Up` (line 102), whatever the sign of `sinβ`.
- lines 160-178: the `beta` setter stores the value as given; no limit applies unless `setCameraLimits` installed one.

**The makers' unit test that pins it:** none. (A code comment in `arc-rotate-controls.ts`, line 460, notes in passing that "the camera looks at its target with world up" for `sinβ < 0`, in the panning code.)

**comment: no.** No doc comment in `arc-rotate.ts` speaks of a negative `beta`, an up vector or flipping.
