I'm working on a small viewer app in /home/dev/1d91dd/app. It uses Babylon Lite 1.39.0, imported as "@babylonjs/lite". The library is not on this machine, so there is nothing to look it up in or to run.

What I do have is the library's type declarations for its camera code, in /home/dev/1d91dd/app/camera-api.d.ts. Read them first.

# Wheel zoom that moves by distance

Our site-plan viewer orbits the model with the library's orbit (arc-rotate) camera. Please write `src/steady-zoom.ts` exporting:

```ts
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

export function attachSteadyZoom(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void;
```

It gives the camera the library's usual mouse and touch controls on that canvas: drag to orbit, right-drag to pan, wheel to zoom, pinch to zoom. Every wheel notch must move the camera the same distance toward or away from the point it orbits, near or far, however the app has moved it since. That distance is the one a notch gives with the library's default controls on the camera as it is when the function is called.

The returned function removes the controls: no listeners left on the canvas and nothing of ours left running each frame.

Please keep every change inside /home/dev/1d91dd/app. When you are done, tell me in a sentence or two what you did, and say if there was anything you were not sure of.
