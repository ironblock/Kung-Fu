# AP4 where

**Behaviour.** A property group lists each track in `targetedAnimations` against the object that owns the last segment of its path, under that last segment alone: a `"position.x"` track on `crate` is listed as `{ target: crate.position, path: "x" }`.

**What the reader would write, and why.** It would go through `getAnimationGroups(manager)` and stop each group with a `targetedAnimations` entry whose `target === target` and `path === path`. In Babylon.js a `TargetedAnimation` pairs the object the animation was started on (the mesh) with an `Animation` whose `targetProperty` is the full dotted path, so "this group animates `position.x` of the crate" reads as `target === crate` and `"position.x"`. The d.ts names the fields `target` and `path`, which fit that reading. Here no entry ever matches a dotted path, so nothing is stopped and the property keeps being written.

**Where it is decided.** `babylon-lite/packages/babylon-lite/src/animation/property-animation.ts`: line 128 resolves each track's binding; `resolvePropertyBinding` (lines 293-304) splits the path, resolves the owner of the last segment and returns it as `mixTarget` with `mixProperty` set to the last segment (line 303); line 210 builds `targetedAnimations` from exactly those two.

**Makers' unit test.** `tests/lite/unit/property-animation.test.ts`, "updates a Babylon-style position.x frame animation without a scene or engine": `expect(group.targetedAnimations).toEqual([{ target: target.position, path: "x" }])`.

**comment: no.** `TargetedAnimation.target`: "Runtime target object when one is directly addressable." `TargetedAnimation.path`: "Animated path, e.g. `translation`, `rotation`, `scale`, `weights`, or a manual property path." If anything, "a manual property path" suggests the full path.
