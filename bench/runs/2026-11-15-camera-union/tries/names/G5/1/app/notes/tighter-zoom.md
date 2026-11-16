# Tighter zoom limit: unverified values

`tighter-zoom.json` holds predicted values, NOT verified against Babylon Lite 1.39.0 runtime behavior.
The library is not available on the machine, so nothing was run.

Basis: `camera-api.d.ts` declares `radius`, `center` and `limits` as plain fields on `GeospatialCamera`,
so no setter-side clamping is visible there. It declares `setGeospatialOrientation`, which routes through
the internal `_setOrientation`, the most likely place a limit would be applied. `clampZoomDistance` is
declared too, but it is a helper that takes a zoom distance, so it probably only runs on zoom input.

Predictions:
- asIs: 4000 (no clamp unless something runs a frame or input update)
- radiusSelf: 4000 (plain assignment, assumed no setter clamp)
- centerSelf: 4000 (assigning center does not touch radius)
- emptyOrientation: 2000 (assumed to re-apply the limit through `_setOrientation`)

To confirm, log `camera.radius` right after each statement in a test scene, before using these values.
