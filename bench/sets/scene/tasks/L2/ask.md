# Placing street lamps

Our street scene lights its lamps with the library's clustered lights. At startup we make one container holding the first lamps, register it on the scene and start rendering. Later the user places more lamps by clicking. Please write `src/lamps.ts` exporting:

```ts
import type { ClusteredLightContainer, ClusteredPointLight, SceneContext } from "@babylonjs/lite";

export function addLamp(scene: SceneContext, lamps: ClusteredLightContainer, position: [number, number, number], reach: number): ClusteredPointLight;
```

It adds one warm lamp to `lamps`, the container already registered on `scene`: colour `[1, 0.85, 0.6]`, intensity 1, lighting everything within `reach` of `position`. It returns that lamp, which must then be one of `lamps.pointLights`.

From the next frame on, the new lamp must light the scene, and every lamp that was there before must keep lighting it as it did. Frames must keep running without errors.
