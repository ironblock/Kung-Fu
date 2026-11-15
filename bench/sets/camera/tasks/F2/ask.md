# Walkthrough viewpoints

Our walkthrough flies a free camera with the library's usual keyboard and mouse controls; buttons jump to saved viewpoints. Please write `src/walkthrough.ts` exporting:

```ts
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };
export interface Walkthrough { readonly camera: FreeCamera; jumpTo(eye: Vec, target: Vec): void; dispose(): void }
export function createWalkthrough(canvas: HTMLCanvasElement, scene: SceneContext, eye: Vec, target: Vec): Walkthrough;
```

`camera` is the camera to show, at `eye` looking at `target`, and is also `scene.camera`. `jumpTo` puts the viewer at the new `eye`, looking at the new `target`, and the controls carry on from that view: W flies toward the new target, and a small mouse drag turns the view a little from there.

`dispose` removes the controls: no canvas listeners and nothing of ours running each frame.
