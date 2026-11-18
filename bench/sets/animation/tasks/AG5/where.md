# AG5 — where

**Behaviour.** Masking only works once `createAnimationGroupMask` has been called somewhere in the app, because that call installs the resolver the clip uses. Until then a plain object of the `AnimationGroupMask` shape set on `group.mask` (for example one read back from JSON) is ignored, and every node animates.

**What the reader would answer, and why.** It would write `group.mask = saved` (or a copy of it). `AnimationGroupMask` is a plain interface with three data fields, and `saved` already has that exact type, so a factory looks like a convenience only. Babylon.js has a class here (`new AnimationGroupMask(names, mode)`), which suggests nothing either way about a global switch.

**Where it is decided.**
- `babylon-lite/packages/babylon-lite/src/animation/animation-group-mask.ts` lines 79-84: `createAnimationGroupMask` calls `_installAnimationMaskResolver(resolveAnimationMask)` (line 82) before it returns the mask; no other code installs the resolver.
- same file, lines 64-70: the resolver that turns names into skipped nodes.
- `babylon-lite/packages/babylon-lite/src/animation/animation-group.ts` line 135: each step hands `group.mask` to the controller.
- The controller treats a mask as inactive while no resolver is installed: `src/skeleton/skeleton-updater.ts` lines 226-230 (`!_maskResolver` → `maskActive = false`) and line 326 (channels are skipped only when the resolver is set).

**Makers' unit test.** None. The tests that use masks (`tests/lite/unit/weighted-gltf-mixer-blend.test.ts`, `tests/lite/unit/usd-materialize.test.ts`) all build them with `createAnimationGroupMask`.

**comment: no.** The interface comment says "Pure state: create with `createAnimationGroupMask` and read membership with `animationGroupMaskRetainsTarget`", and the factory's comment says "Assign it to `animationGroup.mask`". Neither says that a mask not made by the factory is ignored until the factory has run once. The comment that does say it ("the first call to `createAnimationGroupMask` installs the resolver") is a `//` file comment, which the compiler drops.
