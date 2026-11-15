# S3: where a directional light's shadow depth range starts

**The behaviour.** The directional shadow view starts at the light's world position, which defaults to the origin, and keeps only depths from `orthoMinZ` (default 1) to `orthoMaxZ` (default 10000) in front of it; only x and y are fitted to the casters, so a caster behind the light's position (or nearer than 1 unit in front of it) falls out of the map.

**What the reader would write, and why.** `createDirectionalLight(direction, 1.3)` with no position, and a PCF generator with default options. Directional light is "light from infinitely far away"; the signature `createDirectionalLight(direction, intensity?)` takes no position, and the generator's config has an `orthoMinZ`/`orthoMaxZ` pair the reader has no cause to change, since Babylon Lite's PCF map is described (in Babylon.js terms) as auto-fitting to the casters. A reader who knows Babylon.js may know that position matters there, but also that a Babylon.js `DirectionalLight` starts at `-direction` and that Babylon.js fits shadow depth to the camera range or with `autoCalcShadowZBounds`; neither carries over. The real model (1.35.0) left the light at the origin of a 2 km scene and lost 22 turns.

**What decides it**, in `babylon-lite/packages/babylon-lite/src/`:
- `light/directional-light.ts` line 23: `createLightBase([0, 0, 0])`, the light starts at the origin.
- `shadow/shadow-base.ts` lines 90-149, `computeDirectionalLightMatrix`: the view is built from the light's world translation (lines 99-104); x and y are fitted to the caster corners (lines 109-140); depth is mapped from `orthoMinZ..orthoMaxZ` with no fit (lines 142-148).
- `shadow/pcf-directional-shadow-generator.ts` lines 53-54: defaults 1 and 10000; line 98 passes them on.

**Makers' unit test:** none (no test under `tests/lite/unit` calls `computeDirectionalLightMatrix` or checks the depth range against casters).

**comment: no.** The config fields say only "Ortho near plane. Default 1." and "Ortho far plane. Default 10000."; nothing says the range is measured from the light's position or that it is not fitted. (Comments are removed from `names/`.)
