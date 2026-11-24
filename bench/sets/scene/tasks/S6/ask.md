# A loading ramp

We need a solid wedge-shaped loading ramp built from our own vertex data. Please write `src/ramp.ts` exporting:

```ts
import type { EngineContext, Mesh, SceneContext } from "@babylonjs/lite";

export function createRamp(engine: EngineContext, scene: SceneContext, width: number, length: number, height: number): Mesh;
```

Its base is the rectangle on y = 0 from x = -width/2 to width/2 and z = 0 to length. Its top slopes from the front edge (z = 0) up to `height` at z = length, where a vertical back face closes it; two triangular sides close it left and right. Five flat faces.

Flat-shaded: each face has its own vertices, with normals pointing straight out of that face. Under the scene's usual back-face culling it must look solid from every side, the outside of every face drawn, like the library's own box. Add it to the scene and return it.
