# Shadows from the sun

Our courtyard scene has a sun, a directional light that other code has already made and placed but not yet put in the scene. Please write `src/sun-shadows.ts` exporting:

```ts
import type { DirectionalLight, EngineContext, SceneContext, ShadowGenerator } from "@babylonjs/lite";

export function addSunShadows(engine: EngineContext, scene: SceneContext, sun: DirectionalLight): ShadowGenerator;
```

It puts the sun in the scene (once) and gives it a percentage-closer-filtered (PCF) shadow map, 2048 texels square, made for that sun. It returns that shadow generator; other code of ours tells it which meshes cast and marks the receivers, so leave that out.

Once the scene is running, its shadow pass must render this shadow map every time it renders shadows.
