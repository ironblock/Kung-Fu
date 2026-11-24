# RUNS

## What I did

1. Read the library source for the four parts (`src/mesh`, `src/light`, `src/shadow`, `src/scene`), mainly:
   `scene-core`, `scene-remove`, `mesh-scene-registry`, `scene-node`, `world-matrix-state`, `set-parent`,
   `transform-node`, `visibility`, `scene-ubo-extras`, `scene-rebuild` (header), `scene-camera`; `mesh`,
   `mesh-factories`, `mesh-dispose`, `thin-instance`, `create-*` defaults, `enable-mirrored-meshes`,
   `mesh-world-bounds`; every light factory, `light-base`, `types`, `set-light-*`, `light-clone`; `shadow-generator`,
   `shadow-base`, the PCF/ESM/CSM generators' setup code, `shadow-enabled`. Followed calls out of those parts where a
   behaviour depended on them: `frame-graph/shadow-task.ts`, `frame-graph/shadow-inputs.ts`,
   `render/scene-lights-ubo.ts`, `render/mesh-light-selection.ts`, `engine/gpu-resource-retirement.ts`,
   `engine/null-engine.ts`, `material/standard/standard-group-builder.ts`, `material/mesh-features.ts`,
   `material/standard/std-mirrored-support.ts`.
2. Explored candidate behaviours with throw-away tests, then wrote one probe per note in `notes/probes/<id>.test.ts`.
   Every note was seen in a probe run; candidates I could not see were dropped.
3. Probe setup (`app/checks/scene-helpers.ts`, copy in `notes/scene-helpers.ts`): installs the WebGPU flag globals
   before the library loads (probes import it first), and gives the null engine a fake `_device` whose buffers,
   textures, writes and shader sources are recorded. With it the real mesh factories, shadow generators, the lights
   uniform refresh, Standard material group builds (`registerScene*`, `rebuildSceneRenderables`) and renderable
   `bind` (pipeline creation, so the WGSL can be inspected) all run without a GPU.
   Some probes call internal modules directly (the shadow task, `computeDirectionalLightMatrix`,
   `refreshSceneLightsUBO`, `lightAffectsMesh`, `syncThinInstanceGpuData`, `_computeMeshFeatures`) to observe what a
   frame would do.
4. Checked that a probe fails when the library changes: flipping `onBeforeRender` from `unshift` to `push` made
   `n06` fail (2 of 2); the source was restored and re-checked.
5. Copied all 36 probes into `app/checks/`, ran `npx vitest run checks/`, and removed them again.
   `scene-helpers.ts` stays in `app/checks/`.

## Summary lines of the final run

```
 ✓ checks/n29.test.ts (1 test)
 ✓ checks/n15.test.ts (2 tests)
 ✓ checks/n13.test.ts (3 tests)
 ✓ checks/n10.test.ts (2 tests)
 ✓ checks/n24.test.ts (2 tests)
 ✓ checks/n09.test.ts (3 tests)
 ✓ checks/n04.test.ts (2 tests)
 ✓ checks/n18.test.ts (3 tests)
 ✓ checks/n03.test.ts (3 tests)
 ✓ checks/n21.test.ts (2 tests)
 ✓ checks/n20.test.ts (4 tests)
 ✓ checks/n19.test.ts (2 tests)
 ✓ checks/n31.test.ts (2 tests)
 ✓ checks/n34.test.ts (3 tests)
 ✓ checks/n17.test.ts (2 tests)
 ✓ checks/n36.test.ts (1 test)
 ✓ checks/n32.test.ts (1 test)
 ✓ checks/n25.test.ts (2 tests)
 ✓ checks/n01.test.ts (2 tests)
 ✓ checks/n33.test.ts (2 tests)
 ✓ checks/n28.test.ts (2 tests)
 ✓ checks/n23.test.ts (3 tests)
 ✓ checks/n14.test.ts (3 tests)
 ✓ checks/n22.test.ts (4 tests)
 ✓ checks/n06.test.ts (2 tests)
 ✓ checks/n30.test.ts (2 tests)
 ✓ checks/n08.test.ts (2 tests)
 ✓ checks/n16.test.ts (4 tests)
 ✓ checks/n02.test.ts (1 test)
 ✓ checks/n12.test.ts (3 tests)
 ✓ checks/n27.test.ts (1 test)
 ✓ checks/n35.test.ts (2 tests)
 ✓ checks/n26.test.ts (1 test)
 ✓ checks/n05.test.ts (2 tests)
 ✓ checks/n11.test.ts (2 tests)
 ✓ checks/n07.test.ts (1 test)
 Test Files  36 passed (36)
      Tests  79 passed (79)
```

## What I did not look at

- No real GPU or browser: nothing was drawn. Claims are about the data the library builds and uploads
  (uniform contents, shader source, task scheduling, buffer lifetimes), not about pixels.
- PBR and Node materials: the fog/shadow "fixed at registration" notes were seen for Standard material only.
- CSM internals (`csm-*` files beyond the generator's config), ESM blur, shadow recovery, device-lost paths,
  clustered lights, rect-area lights, Gaussian splatting, mesh LOD, GPU thin-instance culling and LOD partners,
  CSG, line systems, geometry update/resize functions, mesh-from-storage, overlay scenes, scene image processing,
  scene-change events beyond a glance, material swap internals.
- The frame graph's render task (`render-task-base`), so `visible === false` skipping draws and hidden meshes
  casting shadows were not probed.
- I did not check the Babylon.js side by running it; comparisons rest on my knowledge of Babylon.js
  (yaw-pitch-roll quaternion formula, DirectionalLight position = -direction, 4 lights per material).
