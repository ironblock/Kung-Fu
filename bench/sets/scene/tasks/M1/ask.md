# Update systems in a fixed order

Our game logic is split into update systems (input, movement, follow-camera, HUD, ...). Different modules add their system at different times while the app starts, and some are added later. Please write `src/systems.ts` exporting:

```ts
import type { SceneContext } from "@babylonjs/lite";

export function addSystem(scene: SceneContext, update: (deltaMs: number) => void): void;
```

Every frame, before the scene renders, each system added to that scene is called once with the frame's delta time in milliseconds. The order matters to us: in every frame, systems run in the order in which they were added to that scene, first added first, including systems added after the game has already been running for a while. Each scene runs only the systems added to it.
