# Runs

## What I did

1. Read `WRITER.md`, every file in `names/`, and `app/checks/helpers.ts`.
2. Read all 17 files of `babylon-lite/packages/babylon-lite/src/camera` in full. Outside `src/camera` I read only what the camera code calls and what I needed for a note: `animation/frame-interpolation.ts`, `math/damp.ts`, `math/observable-vec3.ts`, the perspective and orthographic matrix writers in `math/`, the `_beforeRender` loop in `scene/scene-core.ts`, and the camera exports in `index.ts`.
3. Wrote down candidate notes. Each one is about something the declarations and Babylon.js knowledge leave out or get wrong.
4. Wrote one probe per note, `notes/probes/<id>.test.ts`. Each probe drives the library the way the helpers do: a fake canvas, a real scene on the null engine, and `tick`. Each probe asserts the exact value or behaviour the note states. While writing the probes I ran them from `app/checks/`, and fixed them until they passed. One assertion (n37) was too tight for a pitch of 0.001, so I loosened its precision. Probe n20 also got a button-0 check added, and n18 now tests every key the note names.
5. Cut each note back to what its probe showed. n10 now names only Alt+ArrowUp. n15 now covers only alpha, plus a radius goal at a limit. n23 now covers only upKeys. n30 now names only `projectWorldToScreen`. n37 no longer mentions setGeospatialOrientation.
6. Ordered the notes by how likely a developer is to depend on the thing and how far wrong they would go without the note. The order is: arc-rotate controls and limits first, then pitch clamping on the geospatial camera, reverse-Z depth, defaults, state that can go stale (`target`, `_yaw`), keyboard opt-in, interpolation, matrix caches, the viewport and projection helpers, geospatial, orthographic, free-camera controls, and finer details last.
7. Final run: copied all 50 probes into `app/checks/`, ran `npx vitest run` in `app/`, and removed them again (only `helpers.ts` is left in `app/checks/`).

## Summary lines of the final run

```
 Test Files  50 passed (50)
      Tests  50 passed (50)
   Start at  19:45:29
   Duration  31.85s (import 89%, transform 9%, tests 1%, worker 1%)
```

## What I did not look at

- The library's own unit tests under `babylon-lite/tests/lite/unit`. I neither read nor ran them.
- Right-handed builds (`#coordinate-system` / `_rightHanded`). Every probe ran the default left-handed build, so no note covers the sign flips in right-handed mode.
- Floating origin (`_useFloatingOrigin`), high-precision matrices, `_applyCameraViewport` on a real GPU pass, and rendering in general.
- Parenting a camera (`parent`, `children`) and `getCameraPosition` with a parent.
- `createBankedFreeCamera` beyond reading it. There is no note about it.
- Geospatial details I did not probe: touch pinch and pinch-pan, double-click fly-to, `checkCollisions`, `zoomToCursor: false`, Ctrl+arrow tilt, the +/- zoom keys, `recalculateCenter`, and the pure helpers in `geospatial-movement.ts` and `geospatial-limits.ts` apart from radius clamping and `getEffectivePitchMax` (seen through the camera only).
- The arc-rotate options `shouldHandlePointerDown`, `isExternalDragActive` and `isExternalPickPending`, and keyboard `preventDefault`, blur and Meta handling.
- `projectPointToViewportToRef`, and the `worldOrigin` option of `projectWorldToScreen`.
- I made no claims about what Babylon.js itself does beyond what I remember of it. I checked nothing against Babylon.js source.
