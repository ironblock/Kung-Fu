# S1: where the fog reaches the shaders

**The behaviour.** Fog is written into the scene uniforms only by a writer that `setFog` registers; assigning `scene.fog` alone turns the Standard fog shader code on but leaves its uniforms at zero, which is mode 0, "off".

**What the reader would write, and why.** `scene.fog = { mode: 3, start: 30, end: 120, ... }`. In Babylon.js fog is a plain scene property (`scene.fogMode`, `fogStart`, ...), and `names/scene/scene-core.d.ts` shows `fog: FogConfig | null` as a plain writable field of `SceneContext`. Nothing in the types says that the field is read only by a writer that must be installed. `setFog(scene, config)` is in `names/scene/scene-ubo-extras.d.ts`, but a reader who has already found a writable field has no reason to look for a setter, and its signature reads as a convenience that sets that same field. The real model did this (it used 1.35.0), twice, and a screenshot with fog was byte-identical to one without.

**What decides it**, in `babylon-lite/packages/babylon-lite/src/`:
- `scene/scene-ubo-extras.ts` lines 10-21 (`writeFogUbo` copies `scene.fog` into floats 80-86) and lines 70-73 (`setFog` sets `scene.fog` and registers `writeFogUbo` on `scene._sceneUboContributors`).
- `frame-graph/render-task-base.ts` line 656: the render task runs only the registered contributors over the scene uniforms; nothing else writes floats 80-86.
- `material/standard/standard-group-builder.ts` lines 111 and 129: `scene.fog` being non-null is enough to add the fog fragment, so the shader reads the zeroed slice.

**Makers' unit test:** none (no test under `tests/lite/unit` calls `setFog`).

**comment: no.** The doc comment on `setFog` says fog is opt-in and that "importing `setFog` is what pulls the fog UBO writer into the bundle", but it does not say that assigning `scene.fog` without it leaves fog off; and comments are removed from `names/` anyway. The `fog` field's comment, "Fog configuration. Null = no fog.", suggests the opposite.

**Verifier's note on the comment line.** `setFog`'s own doc comment, which the compiler keeps on the declaration, opens "Enable scene fog and register its scene-uniform contributor" and calls fog "an opt-in feature". It does not say in so many words that assigning `scene.fog` alone leaves fog off, but it says that `setFog` is what enables it. Read as `comment: yes, in part`.
