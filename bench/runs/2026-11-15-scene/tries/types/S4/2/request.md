I'm working on a small viewer app in /home/dev/a0471e/app. It uses Babylon Lite 1.39.0, imported as "@babylonjs/lite". The library is not on this machine, so there is nothing to look it up in or to run.

What I do have is the library's type declarations for the parts I use (meshes, lights, shadows and the scene), in /home/dev/a0471e/app/scene-api.d.ts. Read them first.

# A yard full of crates

Our freight yard has thousands of identical crates, each a cube 1 unit on a side. Please write `src/crate-field.ts` exporting:

```ts
import type { EngineContext, Mesh, SceneContext } from "@babylonjs/lite";

export function createCrateField(engine: EngineContext, scene: SceneContext, centres: [number, number, number][]): Mesh;
```

It draws one crate centred on each given point, all as a single mesh using thin instances (one instance per crate, in the order given, unrotated), adds that mesh to the scene and returns it.

The yard is lit by a sun, a directional light with a single (not cascaded) PCF shadow map, and other code of ours passes the returned mesh to it as a shadow caster. Every crate must fall inside what that shadow map covers, however far apart the crates are, so that each one casts its shadow.

Please keep every change inside /home/dev/a0471e/app. When you are done, tell me in a sentence or two what you did, and say if there was anything you were not sure of.
