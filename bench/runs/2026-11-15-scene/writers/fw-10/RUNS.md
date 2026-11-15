# RUNS

## What I did

1. Read `WRITER.md`, the declarations in `names/` for mesh, light, shadow and scene, and the library source
   behind them in `babylon-lite/packages/babylon-lite/src` (mainly `scene/scene-core.ts`, `scene-remove.ts`,
   `set-parent.ts`, `visibility.ts`, `scene-node.ts`, `transform-node.ts`, `scene-ubo-extras.ts`,
   `mesh-scene-registry.ts`, `mesh/thin-instance.ts`, `mesh-factories.ts`, `mesh-world-bounds.ts`,
   `enable-thin-instance-world-bounds.ts`, `mesh-dispose.ts`, `light/*.ts` for the five light kinds,
   `shadow/shadow-base.ts`, `shadow-generator.ts`, `shadow-enabled.ts`, `pcf-directional-shadow-generator.ts`,
   and outside the four parts `frame-graph/shadow-task.ts`, `frame-graph/shadow-inputs.ts`,
   `render/scene-lights-ubo.ts`, `render/mesh-light-selection.ts`, parts of `material/standard/*` and
   `frame-graph/render-task-base.ts` where they decide what the four parts' settings do).
   Looked at a few of the library's unit tests for how they drive scenes without a GPU (`scene-lifecycle`,
   `shadow-enabled`, `area-light-emission-runtime`, `mesh-world-bounds`, `setup-webgpu-globals`).
2. Chose goals from what a scene builder needs first (show a mesh, shadows, hide/remove, parenting, change
   lights) and kept only those where the library does something a Babylon.js user would not guess and that a
   probe could show. Ordered them by how many developers have the goal and how silently it fails.
3. Wrote `app/checks/scene-helpers.ts` (copy: `notes/scene-helpers.ts`). The null engine has no `_device`, so
   mesh factories, shadow generators and `registerScene` cannot run on it as is. The helper keeps
   `createNullEngine()` and attaches a stub device whose objects only record their descriptors and the bytes
   written to them (copied at write time); it defines the WebGPU flag globals before loading the library, can
   give the scene its default render task (stub swapchain target), runs a frame (`scene._update()` then
   `scene._record()`), drains retired GPU resources (`waitForGpuResourceRetirements`, what the end of a real
   frame does), and reads back what is visible: created shader WGSL, lights-buffer uploads, scene-uniform
   uploads, frame-graph task names, a shadow generator's light matrix applied to points.
4. Wrote one probe per recipe in `notes/probes/rNN.test.ts`; each runs the recipe's steps and, per "without"
   sentence, leaves that step out (or does the wrong thing) and asserts what the sentence says. Iterated on
   each until it passed; claims a probe did not show were cut from the recipe (for example "light count change
   also refreshes a mesh's light list", which the code suggests but I did not probe).
5. Two probes (r01, r08) wait for the library's dynamic imports between frames; with too short waits r08
   failed once out of four runs, so they now run 8 frames 5 ms apart; after that every run passed (r08 alone 5 times, r01 with r08 3 times, then the two final runs).
6. Final run: copied all 15 probes into `app/checks/`, ran `npx vitest run checks/` twice (summary and
   verbose), then removed them from `app/checks/` again. `app/checks/scene-helpers.ts` stays.

## Final run (summary lines)

```
 Test Files  15 passed (15)
      Tests  60 passed (60)
   Start at  20:57:26
   Duration  5.48s (import 61%, transform 32%, tests 6%)
```

## Final run (verbose, per test)

```
 ✓ checks/r02.test.ts > r02 directional shadows > all steps: a shadow task, a shadow-map draw, and a receiver shader that samples the map
 ✓ checks/r02.test.ts > r02 directional shadows > without linking light.shadowGenerator: no shadow-map draw and no receiver sampling
 ✓ checks/r02.test.ts > r02 directional shadows > addToScene(scene, generator) neither links it nor lists it
 ✓ checks/r02.test.ts > r02 directional shadows > without setShadowTaskCasterMeshes: the generator renders no shadow map
 ✓ checks/r02.test.ts > r02 directional shadows > with registerScene instead: there is no shadow task and no shadow-map draw
 ✓ checks/r02.test.ts > r02 directional shadows > without receiveShadows (or set only after registering): no shader samples the map
 ✓ checks/r08.test.ts > r08 thin instances on a running scene > set before registerScene: the instance buffer is created
 ✓ checks/r01.test.ts > r01 show a mesh > steps: material, add, register; a mesh added after registration is built on the next frame
 ✓ checks/r01.test.ts > r01 show a mesh > without a material: the mesh is in scene.meshes, no error, and nothing is built for it
 ✓ checks/r01.test.ts > r01 show a mesh > assigning the material later (even after registerScene) builds the mesh on the following frames
 ✓ checks/r08.test.ts > r08 thin instances on a running scene > without markMeshRenderableDirty after setThinInstances on a built mesh: no instance buffer is ever made
 ✓ checks/r08.test.ts > r08 thin instances on a running scene > rebuildSceneRenderables also picks the instances up
 ✓ checks/r08.test.ts > r08 thin instances on a running scene > a new mesh that already has instances, added after registerScene, gets its buffer
 ✓ checks/r08.test.ts > r08 thin instances on a running scene > without markMeshRenderableDirty after the first setThinInstanceColors on a built mesh: colors are never uploaded
 ✓ checks/r10.test.ts > r10 fog > setFog before registerScene: fog in the shader and mode/start/end/density/color in the scene uniforms
 ✓ checks/r10.test.ts > r10 fog > setFog after registerScene: no fog in any shader, until rebuildSceneRenderables
 ✓ checks/r10.test.ts > r10 fog > without setFog (scene.fog = ... before register): fog is compiled in but its uniforms stay 0, and mode 0 is off
 ✓ checks/r10.test.ts > r10 fog > editing the fog object in place is not uploaded; a new object through setFog is
 ✓ checks/r03.test.ts > r03 shadow map coverage > pcf: with the light placed back along its direction, the caster's corners are inside the map
 ✓ checks/r03.test.ts > r03 shadow map coverage > pcf: without placing the light (it stays at the origin), the caster's depth is below 0
 ✓ checks/r03.test.ts > r03 shadow map coverage > pcf: thin instances outside the prototype's bounds fall outside the map unless the bounds are widened
 ✓ checks/r03.test.ts > r03 shadow map coverage > esm: with the light placed back along its direction, the caster's corners are inside the map
 ✓ checks/r03.test.ts > r03 shadow map coverage > esm: without placing the light (it stays at the origin), the caster's depth is below 0
 ✓ checks/r03.test.ts > r03 shadow map coverage > esm: thin instances outside the prototype's bounds fall outside the map unless the bounds are widened
 ✓ checks/r03.test.ts > r03 shadow map coverage > a tilted light placed at -direction × 50 keeps a 1-unit box at the origin inside the map
 ✓ checks/r14.test.ts > r14 shadows on and off > the map is redrawn only when a caster or the light moves, unless forceRefreshEveryFrame
 ✓ checks/r14.test.ts > r14 shadows on and off > setShadowGeneratorEnabled(sg, false) stops shadow-map draws; true brings them back
 ✓ checks/r14.test.ts > r14 shadows on and off > removing the light instead unlinks its generator: light.shadowGenerator is undefined afterwards
 ✓ checks/r12.test.ts > r12 light cap > without setMaxLights: 20 lights are all in scene.lights, but only the first 16 are uploaded
 ✓ checks/r12.test.ts > r12 light cap > setMaxLights(n) before the scene is built uploads all n
 ✓ checks/r13.test.ts > r13 light selection > set before registerScene: excludedMeshes / includedOnlyMeshes decide the mesh's light list
 ✓ checks/r13.test.ts > r13 light selection > includedOnlyMeshIds by name matches nothing: mesh.id is unset unless you set it
 ✓ checks/r13.test.ts > r13 light selection > without a world-matrix change after setting excludedMeshes at runtime, the old list stays
 ✓ checks/r06.test.ts > r06 runtime light changes > setLightIntensity / setLightDiffuseColor / direction.set reach the lights buffer on the next frame
 ✓ checks/r06.test.ts > r06 runtime light changes > without them (plain writes to intensity / diffuse): nothing is uploaded and the old values stay
 ✓ checks/r06.test.ts > r06 runtime light changes > hemispheric light: diffuseColor/groundColor have no setter; a write plus _bumpLightVersion uploads them
 ✓ checks/r06.test.ts > r06 runtime light changes > spot light: writing angle (full cone, radians) uploads cos(angle/2); writing range does not upload
 ✓ checks/r07.test.ts > r07 thin instances > setThinInstances keeps your array; edit it in place then flushThinInstances to mark it for upload
 ✓ checks/r07.test.ts > r07 thin instances > removeThinInstance moves the LAST instance into the removed slot
 ✓ checks/r07.test.ts > r07 thin instances > addThinInstance past capacity replaces the matrices array: later edits to your old array are not seen
 ✓ checks/r07.test.ts > r07 thin instances > addThinInstance on a plain mesh starts a pool with room for 16
 ✓ checks/r07.test.ts > r07 thin instances > on a running scene: an in-place edit is uploaded only after flushThinInstances
 ✓ checks/r05.test.ts > r05 parenting > setParent fills children, keeps the world position, and add/hide/remove of the parent reach the child
 ✓ checks/r05.test.ts > r05 parenting > children.push before addToScene links the parent and keeps the local position
 ✓ checks/r05.test.ts > r05 parenting > without it (child.parent = pivot only): the transform follows, but add/hide/remove of the parent miss the child
 ✓ checks/r05.test.ts > r05 parenting > moving the parent later moves the child's world matrix
 ✓ checks/r04.test.ts > r04 hide instead of remove > setMeshVisible(mesh, false) keeps the mesh in the scene, flags it and its children, and re-showing works
 ✓ checks/r04.test.ts > r04 hide instead of remove > a hidden mesh is left out of createDefaultCamera's framing
 ✓ checks/r04.test.ts > r04 hide instead of remove > writing mesh.visible directly does not reach the children
 ✓ checks/r04.test.ts > r04 hide instead of remove > without it (removeFromScene instead): children go too, and after the next frame the mesh cannot be added back
 ✓ checks/r04.test.ts > r04 hide instead of remove > a mesh held by a second scene is not retired when one scene drops it
 ✓ checks/r15.test.ts > r15 cloning meshes > the clone shares geometry and material, is named <name>_clone, and is not in the scene until added
 ✓ checks/r15.test.ts > r15 cloning meshes > removing the original retires only the original; the clone's buffers survive
 ✓ checks/r15.test.ts > r15 cloning meshes > without cloning before the original is removed: cloning a retired mesh throws
 ✓ checks/r09.test.ts > r09 framing thin instances > with enableThinInstanceWorldBounds the camera targets the instances and scene.camera is set
 ✓ checks/r09.test.ts > r09 framing thin instances > without it the camera frames only the prototype box at the origin
 ✓ checks/r09.test.ts > r09 framing thin instances > the call frames what is in scene.meshes at that moment; meshes added later are not framed
 ✓ checks/r11.test.ts > r11 per-frame callbacks > the callback registered last runs first
 ✓ checks/r11.test.ts > r11 per-frame callbacks > a single callback that calls the steps in order keeps that order
 ✓ checks/r11.test.ts > r11 per-frame callbacks > deltaMs is the frame's delta in milliseconds unless scene.fixedDeltaMs > 0
```

## What a probe does not show

There is no picture. The probes see lists (`scene.meshes`, `scene.lights`, `scene._renderables`, children),
flags (`visible`, `_disposed`, `shadowGenerator`), matrices (world matrices, the shadow light matrix), bounds,
the WGSL text the library asked the stub device to compile, the bytes it uploaded, and draw counts the frame
graph reports. "No shader samples the map" means no compiled shader contains the PCF sampling function;
"not uploaded" means no `writeBuffer` to that buffer happened. Whether a real GPU then shows a shadow or fog
was not seen.

## What I did not look at

- The library's `docs`, `lab` and `reference` directories are absent; I did not use the network.
- PBR, node and shader materials: every probe uses `createStandardMaterial`. Shadow-receiver and fog behaviour
  may differ for PBR (it has its own fog path).
- Cascaded shadows (`createCsmDirectionalShadowGenerator`, CSM static cache, refit gate), spot-light PCF
  shadows, rect-area lights, clustered lights, the shadow-caster material override, skeleton/morph shadows.
- Mesh LOD, GPU culling and LOD partners for thin instances, hierarchy instance pools, mesh-from-storage,
  indexed indirect, CSG, Gaussian splatting, mesh blending, opacity, draw ranges and geometry updates.
- Overlay scenes, multiple surfaces, scene change events (`onSceneChange`), environment rotation/blur,
  image processing, clip planes, right-handed builds, floating origin, device-lost recovery.
- glTF/`.babylon` asset containers (only plain factory meshes and nodes were used).
- Most of the library's own unit tests (I read a handful for set-up patterns only).
