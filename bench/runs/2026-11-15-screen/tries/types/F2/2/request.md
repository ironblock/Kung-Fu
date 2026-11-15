I'm working on a small viewer app in /home/dev/a77066/app. It uses Babylon Lite 1.39.0, imported as "@babylonjs/lite". The library is not on this machine, so there is nothing to look it up in or to run.

What I do have is the library's type declarations for its camera code, in /home/dev/a77066/app/camera-api.d.ts. Read them first.

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

Please keep every change inside /home/dev/a77066/app. When you are done, tell me in a sentence or two what you did, and say if there was anything you were not sure of.
