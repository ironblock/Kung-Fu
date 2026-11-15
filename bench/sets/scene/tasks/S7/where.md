# S7: when the PCF shadow map is re-rendered

**The behaviour.** A PCF shadow map is rendered on the first frame and afterwards only when the sum of its casters' world-matrix and thin-instance versions, or the light's version (its direction or its node transform), has changed since the last render; otherwise the pass returns 0 draws. A change of intensity or colour does not count, nor does a write into the thin-instance array that bypasses the library's setters.

**What the reader would give, and why.** `{ "rendersInFirstThreeFrames": 3, "afterDirectionChange": true, "afterIntensityChange": true, "afterInPlaceMatrixEdit": true }`, or with 1 in the first field. A Babylon.js `ShadowGenerator`'s map has `refreshRate` `RENDER_EVERYFRAME` by default, so every frame redraws it and every change shows; a reader who notices `forceRefreshEveryFrame?: boolean` in `names/shadow/pcf-directional-shadow-generator.d.ts` may guess the first field right, but has nothing to tell it which changes the cache looks at. `ThinInstanceData` in `names/mesh/thin-instance.d.ts` exposes `matrices` as a plain array with a `_version` beside it, but no type says the version is what is compared. The real model (1.35.0) counted `engine.drawCallCount` after frame one to look for shadow draws, never saw any, and concluded wrongly that thin-instanced receivers take no shadows (83 turns).

**What decides it**, in `babylon-lite/packages/babylon-lite/src/`:
- `shadow/pcf-shadow-task-hooks.ts` lines 291-328, `renderPcfShadowMap`: line 309 returns 0 when `_forceRefreshEveryFrame` is false and the caster version, light version and floating-origin state are unchanged.
- `shadow/shadow-base.ts` lines 201-208, `casterVersionSum`: `mesh.worldMatrixVersion + thinInstances._version`.
- `light/light-base.ts` lines 22-27 and 46-49: `_lightVersion` is bumped by the light's observable vectors (direction) and adds the node's `worldMatrixVersion`; intensity is a plain field (`light/directional-light.ts` line 31).
- `mesh/thin-instance.ts`: every setter (`setThinInstances` line 125, `setThinInstanceMatrix` line 235, ...) bumps `_version`; a raw write does not.

**Makers' unit test:** `tests/lite/unit/shadow-caster-dirty.test.ts`, the case "redraws a cached shadow map after count-only and same-buffer geometry updates", pins the cache and its version keys.

**comment: no** on the rule as a whole. The config field says only "Force the shadow map to be regenerated every frame. Default false."; nothing says what triggers a render without it. (Comments are removed from `names/`.)
