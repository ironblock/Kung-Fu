# RUNS

## What I did

1. Read `WRITER.md`, every file in `names/`, and all 17 files of `babylon-lite/packages/babylon-lite/src/camera`.
   Also read the helpers those files call where they change the behaviour: `math/write-perspective-mat4-lh-into-buffer.ts`
   and `math/write-ortho-off-center-mat4-lh-into-buffer.ts` (both reverse-Z), `math/write-look-at-world-mat4-lh-into-buffer.ts`,
   `math/damp.ts`, `animation/frame-interpolation.ts`, the method list of `math/observable-vec3.ts`, and the
   `_beforeRender` / `disposeScene` lines of `scene/scene-core.ts`. I grepped `src/index.ts` for the camera exports.
2. Wrote one candidate note for each place where the code departs from Babylon.js or does something the declarations
   do not show, then a probe for each in `notes/probes/<id>.test.ts` (ids n01..n43, in the order I wrote them). Probes import
   from `@babylonjs/lite` and `./helpers`, and run from `app/checks/`. The geospatial-controls probes put a fake `window`
   (a `makeCanvas()` object) on `globalThis`, because those controls listen for keys on `window`.
3. Ran the probes. All passed on the first run. Then I cut each note down to what its probe actually saw. For example, n20
   names KeyW, ArrowUp, Space and a middle-button drag, because those are the inputs I fired. It does not mention
   PageUp or Shift.
4. To check that a probe can fail, I made one mutation by hand: I changed the arc-rotate wheel formula to Babylon's
   `deltaY / (wheelPrecision * 40)`, and n06 failed. Then I restored the file from a backup and confirmed with `cmp` that
   it was the same as before. I mutation-tested no other probe.
5. Put the notes in order: first what a developer will depend on most, and where a wrong guess from Babylon.js costs the
   most. That puts the controls doing nothing without a scene, the limit fields, reverse-Z, the defaults, and the
   replaced-target and pitch-order traps near the top. Narrow helpers come last.
6. Copied all 43 probes into `app/checks/`, ran `npx vitest run` once, and then removed the copies (only `helpers.ts`
   remains there).

## Final run (all probes in app/checks)

```
 Test Files  43 passed (43)
      Tests  46 passed (46)
```

## What I did not look at

- The library's own unit tests under `babylon-lite/tests/lite/unit`. I only grepped `geospatial-controls.test.ts` to see how it stubs `window`.
- The right-handed build (`#coordinate-system` -> `coordinate-system-rh.ts`). Every probe ran the default left-handed build,
  so no note covers the sign flips under `_rightHanded`.
- Floating-origin / LWR (`_useFloatingOrigin`), the HPM matrix allocator (F64 storage), parenting of cameras and their
  `children`, and `_applyCameraViewport` (it needs a GPU render pass).
- The scene's own camera handling (`addToScene`, `scene.camera`, `_update`), glTF cameras, and picking (`createPickingRay`)
  beyond its use by the geospatial controls.
- Behaviour I read but did not probe, so it has no note: arc-rotate `isExternalDragActive` / `isExternalPickPending` /
  `shouldHandlePointerDown`, Meta-key suppression, keyboard `preventDefault`, geospatial `checkCollisions`, pinch-to-pan
  promotion at 20 px, Ctrl+arrow tilt and arrow-key pan on the geospatial camera, fly `centerHopScale` and easing, and
  `getEffectivePitchMax` / `clampZoomDistance` / `frameDecay` used on their own.
