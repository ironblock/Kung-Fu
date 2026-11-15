I'm working on a small viewer app in /home/dev/a84948/app. It uses Babylon Lite 1.39.0, imported as "@babylonjs/lite". The library is not on this machine, so there is nothing to look it up in or to run.

What I do have is the library's type declarations for the parts I use (meshes, lights, shadows and the scene), in /home/dev/a84948/app/scene-api.d.ts, and some recipes for building a scene with it, in /home/dev/a84948/app/scene-recipes.md. Read them first.

# Update systems in a fixed order

Our game logic is split into update systems (input, movement, follow-camera, HUD, ...). Different modules add their system at different times while the app starts, and some are added later. Please write `src/systems.ts` exporting:

```ts
import type { SceneContext } from "@babylonjs/lite";

export function addSystem(scene: SceneContext, update: (deltaMs: number) => void): void;
```

Every frame, before the scene renders, each system added to that scene is called once with the frame's delta time in milliseconds. The order matters to us: in every frame, systems run in the order in which they were added to that scene, first added first, including systems added after the game has already been running for a while. Each scene runs only the systems added to it.

Please keep every change inside /home/dev/a84948/app. When you are done, tell me in a sentence or two what you did, and say if there was anything you were not sure of.
