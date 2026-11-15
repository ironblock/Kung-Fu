# RUNS

## What I did

- Read WRITER.md, `app/checks/helpers.ts`, the declarations in `names/` for scene, mesh, light and shadow, and
  the library source behind them: `scene/scene-core.ts`, `scene-remove.ts`, `set-parent.ts`, `visibility.ts`,
  `scene-node.ts`, `world-matrix-state.ts`, `scene-ubo-extras.ts`, `scene-camera.ts`, `mesh-scene-registry.ts`;
  `light/*` (the four factories, `light-base.ts`, `types.ts`, `set-light-*.ts`); `shadow/pcf-*`,
  `shadow-enabled.ts`, the ESM/CSM factories' defaults; `mesh/thin-instance.ts`, `mesh-factories.ts`
  (createMeshFromData), `mesh-dispose.ts`; outside the four parts, only what they lean on:
  `frame-graph/shadow-task.ts`, `shadow-inputs.ts`, `render-task-base.ts` (bundles, scene UBO),
  `render/scene-lights-ubo.ts`, `render/mesh-light-selection.ts`, `material/standard/standard-renderable.ts`
  and `standard-group-builder.ts` (what is fixed at build time), `engine/null-engine.ts`,
  `engine/gpu-resource-retirement.ts`. Skimmed unit tests: `remove-from-scene`, `light-parenting`,
  `mesh-light-selection`.
- The null engine alone cannot create a mesh (no device, no WebGPU flag globals). `app/checks/scene-helpers.ts`
  (copy in `notes/scene-helpers.ts`) sets the flag globals before loading the library, gives the null engine a
  stand-in device that keeps buffer bytes, shader code, pipelines, and every draw with its bind-group slots and
  pass number (render bundles are kept and replayed, as on a GPU), and a stand-in 800x600 swapchain target, so
  `registerScene` / `registerSceneWithShadowSupport` and whole frames (update + record + retirement flush) run.
  Nothing is drawn; probes assert on draws, passes, bind-group slots, WGSL text and uploaded buffer contents.
- Tried about twenty hypotheses in scratch tests (deleted), kept twelve recipes, and wrote one probe per
  recipe in `notes/probes/rNN.test.ts`; each probe runs the steps and, for each "without" sentence, leaves
  that step out and asserts what the sentence says.
- Ordered by how many scene builders hit the goal and how silently it fails: drawing at all, shadows,
  grouping, hiding vs removing, runtime light changes, thin instances, fog, light exclusion, late thin
  instances, shadow toggling, late casters, more than 16 lights.
- Final run: copied the 12 probes into `app/checks/`, ran `npx vitest run` in `app/`, removed them again.

Summary lines of the final run:

```
 Test Files  12 passed (12)
      Tests  45 passed (45)
```

## Seen in scratch but not handed in (not probed, or too weak)

- A PBR mesh added to a running scene was not drawn on the first frame and was drawn about 100 ms later;
  a Standard one was drawn on the next frame. Timing-dependent, left out.
- Adding/removing a light at runtime updated the lights buffer and the Standard mesh's light count (worked as
  expected, no recipe).
- Pushing into the same caster array was picked up (kept, as r12).

## What I did not look at

- Any pixel: there is no GPU; "darkness 1", "unshadowed", "no fog" are read from uniforms, not images.
- PBR, node and shader materials (fog, shadows and light counts were probed with Standard material only);
  how PBR bakes its single-/multi-light path when lights are added later.
- ESM and CSM beyond "a shadow pass runs and the ground gets the shadow binding"; spot-light shadows;
  cascades, refit, static cache, skeleton/morph shadow casters, `setShadowCasterMaterial`.
- Mesh geometry updates (`updateMesh*`, capacity, draw ranges, indexed indirect), CSG, ribbons/tubes/extrude,
  mirrored meshes, Gaussian splatting, opacity/blending tags, thin-instance GPU culling and LOD partners,
  `setThinInstanceDrawCount`, `enableThinInstanceWorldBounds`, `computeMaxExtents`.
- Clustered and rect-area lights, light parenting's effect on direction, light cloning.
- Overlay scenes, scene-change events, `disposeScene`, unregister/re-register, scene rebuild, device-lost
  recovery, environment rotation/blur, image processing, `setClipPlane`.
- The library's own unit tests were not run.
