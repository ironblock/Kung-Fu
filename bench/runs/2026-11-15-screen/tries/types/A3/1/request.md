I'm working on a small viewer app in /home/dev/e23b1d/app. It uses Babylon Lite 1.39.0, imported as "@babylonjs/lite". The library is not on this machine, so there is nothing to look it up in or to run.

What I do have is the library's type declarations for its camera code, in /home/dev/e23b1d/app/camera-api.d.ts. Read them first.

# How far did that point slide?

We draw motion trails behind highlighted points. Please write `src/screen-shift.ts` exporting:

```ts
import type { Camera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };
export interface ShiftTracker { mark(): void; shift(point: Vec): { dx: number; dy: number } }
export function trackScreenShift(camera: Camera, canvas: HTMLCanvasElement): ShiftTracker;
```

`mark()` remembers the camera's view as it is at that moment; `trackScreenShift` marks once when it is created. `shift(point)` says how far the picture of the world-space `point` has moved on the canvas between the last mark and the camera as it is now, in CSS pixels, `dx` to the right and `dy` down. Between the calls the app may move, turn or zoom the camera, including by changing its field of view. The camera renders to the whole canvas; our points are in front of it.

Please keep every change inside /home/dev/e23b1d/app. When you are done, tell me in a sentence or two what you did, and say if there was anything you were not sure of.
