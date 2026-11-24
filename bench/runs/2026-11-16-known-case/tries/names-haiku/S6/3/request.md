I'm working on a small viewer app in /home/dev/b9680e/app. It uses Babylon Lite 1.39.0, imported as "@babylonjs/lite". The library is not on this machine, so there is nothing to look it up in or to run.

What I do have is the library's type declarations for the parts I use (meshes, lights, shadows and the scene), in /home/dev/b9680e/app/scene-api.d.ts. Read them first.

# A loading ramp

We need a solid wedge-shaped loading ramp built from our own vertex data. Please write `src/ramp.ts` exporting:

```ts
import type { EngineContext, Mesh, SceneContext } from "@babylonjs/lite";

export function createRamp(engine: EngineContext, scene: SceneContext, width: number, length: number, height: number): Mesh;
```

Its base is the rectangle on y = 0 from x = -width/2 to width/2 and z = 0 to length. Its top slopes from the front edge (z = 0) up to `height` at z = length, where a vertical back face closes it; two triangular sides close it left and right. Five flat faces.

Flat-shaded: each face has its own vertices, with normals pointing straight out of that face. Under the scene's usual back-face culling it must look solid from every side, the outside of every face drawn, like the library's own box. Add it to the scene and return it.

Please keep every change inside /home/dev/b9680e/app. When you are done, tell me in a sentence or two what you did, and say if there was anything you were not sure of.
