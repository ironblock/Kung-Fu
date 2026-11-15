I'm working on a small viewer app in /home/dev/2d7b14/app. It uses Babylon Lite 1.39.0, imported as "@babylonjs/lite". The library is not on this machine, so there is nothing to look it up in or to run.

What I do have is the library's type declarations for its camera code, in /home/dev/2d7b14/app/camera-api.d.ts, and some notes on how that code behaves, in /home/dev/2d7b14/app/camera-notes.md. Read them first.

# A chase camera that banks with the car

Our roller-coaster game needs a camera that rides behind the car and leans with it. Please write `src/chase-camera.ts` exporting:

```ts
import type { FreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };
export interface ChaseCamera { camera: FreeCamera; bank(up: Vec): void }
export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera;
```

`camera` sits at `eye`, looks at `target` and starts upright. Each frame we call `bank(up)` with the car's up direction (a unit vector). The camera rolls so that up in its picture matches that direction as closely as it can while it keeps looking at the target. On loops the car's up sometimes points exactly along the line of sight, either way. On such a call the camera must keep looking at the target and keep its previous roll.

Please keep every change inside /home/dev/2d7b14/app. When you are done, tell me in a sentence or two what you did, and say if there was anything you were not sure of.
