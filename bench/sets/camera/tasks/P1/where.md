# P1: where its fact is written

Right answer: a drag and a wheel turn change nothing on that page, and a pinch changes `radius`. `proof.test.ts` shows it on the library.

- **The code that decides it:** `src/camera/arc-rotate-controls.ts`. A drag adds to `inertialAlphaOffset` and `inertialBetaOffset` (lines 334 and 335) and the wheel to `inertialRadiusOffset` (line 356). `applyInertia` adds those to the camera, and it is put on the scene's per-frame list only when a scene was given (lines 495 and 496). The pinch handler writes `camera.radius` itself (line 400).
- **Comments in `src`:** the comment above `attachControl` says "Pinch: zoom (touch, direct — no inertia)" and "a scene is required for inertia". The comment at lines 492 to 494 says that without a scene "the camera is simply static (no inertia)".
- **The makers' test that pins the pinch:** `tests/lite/unit/arc-rotate-controls.test.ts`, the case "clamps the pinch radius write immediately, before any _beforeRender runs".
- **The makers' doc:** `docs/lite/architecture/02-camera.md` says at line 502 that input handlers do not directly modify camera properties, and at lines 526 to 534 that a pinch directly modifies the radius.
- **The ledgers:** the three Opus ledgers of round five each hold a note that says nothing moves the camera without a scene. Each checker marked that note false. The arm `ledger-cut` has those notes taken out.

This task was chosen by the person who ran the mapping rounds, because a ledger says the wrong thing about it.
