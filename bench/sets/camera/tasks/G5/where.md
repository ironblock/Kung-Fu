# G5: where a tightened limit takes effect

**Behaviour.** Changing `camera.limits` does nothing until the next orientation write, and writing `radius` (or `yaw`, `pitch`) its own current value is not one, because those setters return early on an equal value, while the `center` setter and `setGeospatialOrientation` always re-apply the limits.

Right answer: `{ "asIs": 4000, "radiusSelf": 4000, "centerSelf": 2000, "emptyOrientation": 2000 }`. `proof.test.ts` shows all four on the library (it reads the answer from `checks/G5.expected.json`).

**What the plain answer gives, and why.** Most likely `asIs: 4000` or 2000 (a guess either way), and `radiusSelf: 2000`: `camera.radius = camera.radius` is the usual idiom for "re-run the setter", and every Babylon.js property setter the reader knows re-applies its clamp. It has no reason to think the `center` and `radius` setters differ, so it gives the same value for both self-assignments; at least one of them is then wrong.

**What decides it**, in `babylon-lite/packages/babylon-lite/src/camera/geospatial-camera.ts`:

- lines 313-315: the `center` setter calls `applyOrientation` unconditionally;
- lines 319-339: the `yaw`, `pitch` and `radius` setters call it only `if (v !== scalars.…)`;
- lines 202-205: `setGeospatialOrientation` calls `_setOrientation` with every field, filled from the current values;
- lines 243-245: `applyOrientation` is the only place the limits are applied.

**The makers' unit test that pins it:** none.

**comment: no.** The `limits` field's comment (line 55) gives part of it: "Mutable; clamping applies on the next orientation change." No comment says that assigning a setter its current value is not an orientation change, or that `center` behaves differently.
