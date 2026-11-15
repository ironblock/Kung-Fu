# RUNS

## What I did

- Read `WRITER.md`, every file in `names/`, and all 17 files of `babylon-lite/packages/babylon-lite/src/camera` in full.
- Outside `src/camera` I read only what the camera code calls and a note depends on: `animation/frame-interpolation.ts`, `math/damp.ts`, `math/observable-vec3.ts`, the head of `math/write-look-at-world-mat4-lh-into-buffer.ts`, the camera exports in `src/index.ts`, and the `_beforeRender` lines of `scene/scene-core.ts`. I listed the names of the library's unit tests and grepped `geospatial-controls.test.ts` only to see how it stubs `window`.
- Wrote 33 notes. For each one I wrote a probe at `notes/probes/<id>.test.ts` that drives the library through `@babylonjs/lite` and `./helpers` (the helpers in `app/checks/`). While writing them I copied a few probes at a time into `app/checks/`, ran `npx vitest run checks/`, and removed them again. Every probe passed before its note went into `facts.json`. I took out or narrowed any wording a probe did not cover: `n09` no longer mentions dy, `n30` no longer mentions the viewport offset, `n23` gained a middle-button case, and `n17` now checks the sign of the yaw PI/2 direction.
- Order: notes come first when a developer leaning on Babylon.js would quietly get a camera that does not move, or moves wrongly. That covers needing a scene, a replaced target, how limits are enforced, the defaults, and the geospatial pitch ceiling. Unit and default differences come next, then the less common modules (orthographic, viewport, world-to-screen, banked camera, configurable controls).
- At the end I copied all 33 probes into `app/checks/`, ran `cd app && npx vitest run`, and removed them. `app/checks/` now holds only `helpers.ts`.

## Final run (all probes in app/checks)

```
 Test Files  33 passed (33)
      Tests  78 passed (78)
   Start at  19:43:37
   Duration  12.28s (import 76%, transform 23%, tests 1%, worker 1%)
```

## What I did not look at

- The library's own unit tests under `babylon-lite/tests/lite/unit`. I did not read or run them.
- The rest of the library: render tasks, scene update (where `_useFloatingOrigin` is synced), picking (`createPickingRay`), and the math writers apart from the lookAt head. That leaves the perspective matrix convention (vertical fov, depth range) unchecked against Babylon.js.
- Right-handed builds (`#coordinate-system`). Every probe ran in the default left-handed build. The `_rightHanded` sign flips in the controls are untested.
- HPM/F64 matrix storage, floating origin, and camera parenting (`parent`, `children`).
- Geospatial pan by drag, touch pinch and pan, double-click fly, `checkCollisions`, zoom-to-cursor picking and the keyboard pan and tilt steps. I tested only that keys go to `window`, that the wheel uses the sign of `deltaY`, and that input cancels a flight.
- `projectPointToViewportToRef`, `_applyCameraViewport`, `disableOrthographicCamera`, and `getViewMatrix` caching.
- The arc-rotate options `shouldHandlePointerDown`, `isExternalDragActive` and `isExternalPickPending`, the keyboard `preventDefault` and `metaKey` handling, and how blur clears keys.
- The user's GLM session file on the Mac. This job's instructions say not to read outside this directory or use the network.
