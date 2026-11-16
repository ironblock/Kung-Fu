I'm working on a small viewer app in /home/dev/3dd6df/app. It uses Babylon Lite 1.39.0, imported as "@babylonjs/lite". The library is not on this machine, so there is nothing to look it up in or to run.

What I do have is the library's type declarations for the parts I use (meshes, lights, shadows and the scene), in /home/dev/3dd6df/app/scene-api.d.ts, and some notes on how those parts behave, in /home/dev/3dd6df/app/scene-notes.md. Read them first.

# A sun for the whole valley

Our valley terrain is a 2000-unit square centred on the origin in x and z; everything on it (ground, rocks, trees, towers) lies between height 0 and 400. Please write `src/terrain-sun.ts` exporting:

```ts
import type { DirectionalLight, EngineContext, SceneContext, ShadowGenerator } from "@babylonjs/lite";

export function createValleySun(engine: EngineContext, scene: SceneContext, direction: [number, number, number]): { sun: DirectionalLight; shadows: ShadowGenerator };
```

It makes the sun, a directional light shining along `direction` (any length; it always points downwards) with intensity 1.3, puts it in the scene, and gives it a PCF shadow map of 2048 texels. Other code tells the generator which meshes cast.

Anything anywhere in the valley, at any height in that range, must be able to cast a shadow into that map: nothing in the valley may fall outside what the shadow map covers, in any direction.

Please keep every change inside /home/dev/3dd6df/app. When you are done, tell me in a sentence or two what you did, and say if there was anything you were not sure of.
