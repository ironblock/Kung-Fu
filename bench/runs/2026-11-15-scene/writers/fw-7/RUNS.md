# Runs

## What I did

- Read `WRITER.md`, every file in `names/`, and the library source behind the notes: `scene/scene-core.ts`, `scene-remove.ts`, `set-parent.ts`, `scene-node.ts`, `transform-node.ts`, `visibility.ts`, `world-matrix-state.ts`, `mesh-scene-registry.ts`, `scene-ubo-extras.ts`, `scene-rebuild.ts` (top part), `mesh/mesh.ts`, `mesh-factories.ts` (create and factory functions), `thin-instance.ts`, `thin-instance-gpu.ts` (sync function), `enable-thin-instance-world-bounds.ts`, every light factory plus `light/types.ts`, `light-base.ts`, `light-clone.ts`, `set-light-*.ts`, `shadow/shadow-generator.ts`, `shadow-base.ts`, `shadow-enabled.ts`, `pcf-directional-…`, `pcf-spotlight-…`, the option defaults of `esm-…` and `csm-…`. Outside the four directories I also read: `engine/null-engine.ts`, `engine/gpu-resource-retirement.ts`, `frame-graph/shadow-task.ts`, `frame-graph/shadow-inputs.ts`, `render/scene-lights-ubo.ts`, `render/mesh-light-selection.ts`, the scene-UBO write in `frame-graph/render-task-base.ts`, `FogConfig` in `material/standard/standard-material.ts`, and a few of the library's unit tests to see how they build fake engines.
- Wrote `app/checks/scene-helpers.ts` (copy in `notes/scene-helpers.ts`): WebGPU usage flags on `globalThis` (the library reads them at load, so a probe imports this file first), a fake GPU device whose buffers keep their bytes and whose `queue.writeBuffer` is logged, `attachDevice` to give the null engine that device, and two small readers. It has no runtime import from the library on purpose.
- Wrote one probe per note, `notes/probes/n01.test.ts` … `n35.test.ts`. Each runs real library code on the null engine with the fake device; internal modules (lights UBO writer, light selection, shadow task, directional light matrix, scene-UBO writer, thin-instance GPU sync) are imported by path from the source. Each probe has several cases where the note covers several.
- Dropped or narrowed what the probes did not show. Two first drafts were wrong and were fixed by the probes: removing a mesh does not retire it at once (the disposal is queued, so an early re-add is accepted and still loses its buffers), and `setParent` under a zero-scale parent does not keep the world position (the old world position becomes the local one, so the child moves).
- At the end I copied all 35 probes into `app/checks/`, ran `npx vitest run` in `app/`, and removed them again. `scene-helpers.ts` stays in `app/checks/`.

## Final run (all probes in `app/checks/`)

```
 Test Files  35 passed (35)
      Tests  104 passed (104)
```

Per file: n01 5, n02 5, n03 2, n04 5, n05 2, n06 3, n07 5, n08 2, n09 4, n10 3, n11 3, n12 2, n13 3, n14 3, n15 2, n16 2, n17 3, n18 4, n19 2, n20 4, n21 2, n22 4, n23 2, n24 3, n25 3, n26 2, n27 2, n28 3, n29 3, n30 3, n31 3, n32 2, n33 2, n34 2, n35 4 tests, all passed.

## What I did not look at

- Any real GPU rendering: material shaders, pipelines and draws were never run (the null engine has no device; mine is a stand-in). So nothing here says how a shadow, fog or light looks, only what is uploaded, built or dispatched. n35 uses a fake material builder to see when builders run, not what the real Standard/PBR builders bake.
- Most of `scene-rebuild.ts`, `scene-runtime-mesh-build.ts`, `scene-material-swap.ts`, `scene-change.ts`, `overlay-scene.ts`, `swapchain-overlay.ts`, environment rotation/blur, image processing.
- Shadow internals: `csm-*` (cache, refit gate, task hooks, receiver registry), `esm` blur, `pcf-shadow-task-hooks.ts`, deformable/skeleton/morph shadow casters, `shadow-recovery.ts`, `material-shadow-bindings.ts`.
- Lights: clustered lights, rect-area lights and their emission/LTC files, `lighting-extension.ts`.
- Mesh: Gaussian splatting, opacity, CSG, mesh-from-storage, indexed-indirect, draw ranges, geometry update functions, mirrored meshes, mesh blending, hierarchy instance pool, GPU culling and thin-instance LOD (only the throw of `enableThinInstanceGpuCulling` was probed), most shape generators beyond their defaults.
- The `docs`, `lab` and `reference` directories (not present) and the network (not used).
