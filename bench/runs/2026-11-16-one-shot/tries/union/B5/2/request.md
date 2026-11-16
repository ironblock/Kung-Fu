I'm working on a small viewer app in /home/dev/41b823/app. It uses Babylon Lite 1.39.0, imported as "@babylonjs/lite". The library is not on this machine, so there is nothing to look it up in or to run.

What I do have is the library's type declarations for its camera code, in /home/dev/41b823/app/camera-api.d.ts, and some notes on how that code behaves, in /home/dev/41b823/app/camera-notes.md. Read them first.

# Where to draw a map label

We draw HTML labels over our 3D terrain view. Please write `src/label-position.ts` exporting:

```ts
import type { Camera } from "@babylonjs/lite";

export function labelPosition(camera: Camera, canvas: HTMLCanvasElement, point: { x: number; y: number; z: number }): { x: number; y: number; visible: boolean };
```

The camera renders to the whole canvas. `x` and `y` give where the world-space `point` appears, in CSS pixels from the canvas's top-left corner. `visible` means the point is in front of the camera and inside the picture, however far away it is. Distant mountains beyond the camera's far clipping distance count as visible. A point in front of the camera but outside the picture is not visible, and `x` and `y` still say where it would be, past the edge, for an arrow. A point behind the camera is never visible.

Please keep every change inside /home/dev/41b823/app. When you are done, tell me in a sentence or two what you did, and say if there was anything you were not sure of.
