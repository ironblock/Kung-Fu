# S2: how the scene finds a shadow generator

**The behaviour.** The scene's shadow pass renders only generators hung on a scene light's `shadowGenerator` field; `addToScene(scene, generator)` accepts a generator by type but does nothing with it.

**What the reader would write, and why.** `addToScene(scene, sun); addToScene(scene, generator);`. In `names/scene/scene-core.d.ts`, `SceneEntity` is `Mesh | LightBase | Camera | ShadowGenerator | TransformNode | AssetContainer`, `addToScene(scene, entity: SceneEntity)` takes it, and `SceneContext` has a `shadowGenerators: ShadowGenerator[]` list, so handing the generator to the scene looks like the intended route, the way Babylon Lite routes everything else through `addToScene`. In Babylon.js a `ShadowGenerator` attaches itself to its light in its constructor, so a reader who knows Babylon.js expects the light to know its generator already, and has no reason to set `light.shadowGenerator`. The real model did exactly this (on 1.35.0) and lost 13 turns.

**What decides it**, in `babylon-lite/packages/babylon-lite/src/`:
- `scene/scene-core.ts` lines 497-555: `addToScene` handles asset containers (`"entities" in`), meshes (`"_gpu" in` and `"material" in`), lights (`"lightType" in`) and cameras (`"fov" in`); a generator matches none and falls through, touching neither `scene.shadowGenerators` nor the light. Line 120 lists `ShadowGenerator` in `SceneEntity`.
- `shadow/pcf-directional-shadow-generator.ts` lines 70-86: the generator keeps the light (`_light`) but does not set `light.shadowGenerator`.
- `frame-graph/shadow-task.ts` lines 31-34, 47-52, 61-69: the shadow task reads `light.shadowGenerator` for each `scene.lights` entry. `scene/scene-remove.ts` line 195 says so in a comment.

**Makers' unit test:** none for adding. `tests/lite/unit/remove-from-scene.test.ts` sets `light.shadowGenerator` by hand in its fixture.

**comment: yes**, and it says the opposite: the doc comment of `addToScene` reads "Adds an entity (mesh, light, camera, transform node, shadow generator, or asset container) to the scene, dispatching on its type." No comment says that a generator is ignored there. (Comments are removed from `names/`.)

**Verifier's note on the comment line.** The `shadowGenerator` field of the light (`light/types.ts` line 28) carries "Shadow generator attached to this light. Set this to make the light cast shadows.", which the compiler keeps on the declaration and which states the right use. So `comment: yes`, and it states the behaviour, beside the misleading `addToScene` comment.
