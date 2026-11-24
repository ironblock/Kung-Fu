# AM6: where it turns

**Behaviour.** Under skeletal blending a bone's translation (and scale) is the plain sum of weight times clip value, so a total weight below 1 pulls the bone toward zero, not toward its rest pose, and a total above 1 is not scaled back; only rotation is blended against the rest pose and normalised.

**What the reader would write, and why.** `{ "aloneHalfY": 3, "aloneHalfTurnDegrees": 45, "bothHalfY": 4, "bothThreeQuartersY": 4 }`. This is Babylon.js's rule for weighted animations: when the weights add up to less than 1 the rest goes to the original value (here the rest pose, y = 4), and when they add up to more than 1 they are normalised. Nothing in the declarations says Babylon Lite does otherwise, and the reader gets the rotation right by the same rule. Babylon Lite gives y = 1 for the lone clip and y = 6 for the two clips at 0.75.

**Where it is decided.** `babylon-lite/packages/babylon-lite/src/animation/weighted-gltf-mixer.ts`, lines 364-375: the first translation contribution zeroes the slot, then each clip adds `sample * weight`; scale does the same at lines 376-387. Rotation is blended clip by clip at lines 388-414, and `uploadTarget`, lines 458-475, slerps a rotation whose total weight is under 1 from the rest rotation, or normalises it. No such step exists for translation or scale.

**Makers' unit test.** None.

**comment: no.** `AnimationGroup.weight`: "Weighted contribution used by AnimationManager mixing (default 1)." `enableAnimationBlending`: "Enable advanced animation blending for a manager." The only comment on blending against the rest pose is on the mixer's private target type, and it speaks of rotation only.
