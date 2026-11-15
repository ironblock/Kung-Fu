I'm working on a small viewer app in /home/dev/2daab8/app. It uses Babylon Lite 1.39.0, imported as "@babylonjs/lite". The library is not on this machine, so there is nothing to look it up in or to run.

What I do have is the library's type declarations for its camera code, in /home/dev/2daab8/app/camera-api.d.ts, and some notes on how that code behaves, in /home/dev/2daab8/app/camera-notes.md. Read them first.

# Faster orbit drag

Users find our orbit viewer sluggish to turn. Please write `src/fast-orbit.ts` exporting:

```ts
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

export function attachFastOrbit(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void;
```

It gives the orbit (arc-rotate) camera the library's standard mouse and touch controls on that canvas, with one change: a drag must turn the camera twice as far as the library's default controls turn it for the same mouse movement. That holds for left-right and up-down, and it includes the glide after the button is released. Zooming with the wheel stays exactly as the library's default does it.

The returned function removes the controls: no listeners left on the canvas and nothing of ours left running each frame.

Please keep every change inside /home/dev/2daab8/app. When you are done, tell me in a sentence or two what you did, and say if there was anything you were not sure of.
