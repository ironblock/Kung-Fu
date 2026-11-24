I'm working on a small viewer app in /Users/Shared/kf/boxes/d1abfc/app. It uses Babylon Lite 1.39.0, imported as "@babylonjs/lite". The library is not on this machine, so there is nothing to look it up in or to run.

What I do have is the library's type declarations for its camera code, in /Users/Shared/kf/boxes/d1abfc/app/camera-api.d.ts. Read them first.

# Fly-through controls with a boost key

Our architecture walkthrough uses the library's free camera. Please write `src/fly-controls.ts` exporting:

```ts
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

export function attachFlyControls(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void;
```

It gives the camera the library's keyboard and mouse fly controls on that canvas: W/A/S/D or the arrow keys to move, the mouse to look around, Space to rise and PageDown to sink. Holding Shift (left or right) makes the camera move three times as fast. Shift is only a speed key. Holding it, alone or together with other keys, must never move the camera up or down by itself.

The returned function removes the controls: no listeners left on the canvas and nothing of ours left running each frame.

Please keep every change inside /Users/Shared/kf/boxes/d1abfc/app. When you are done, tell me in a sentence or two what you did, and say if there was anything you were not sure of.
