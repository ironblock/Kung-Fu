I'm working on a small viewer app in /home/dev/87901d/app. It uses Babylon Lite 1.39.0, imported as "@babylonjs/lite". The library is not on this machine, so there is nothing to look it up in or to run.

What I do have is some notes on how its camera code behaves, in /home/dev/87901d/app/camera-notes.md. Read them first.

# A turntable spin for the intro

When a user opens a place, our globe viewer turns the view once around it, like a turntable. Please write `src/spin-around.ts` exporting:

```ts
import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";

export function spinAround(camera: GeospatialCamera, scene: SceneContext, durationMs: number): Promise<void>;
```

Over about `durationMs` of the scene's render loop, the camera's heading (`yaw`) turns one full turn eastward, that is, always toward increasing yaw, never backward, and the camera ends with the heading it started with. The centre point, the tilt and the zoom stay as they are. The promise resolves when the turn is complete. Easing in and out is welcome; we pass durations between 1 and 10 seconds.

Please keep every change inside /home/dev/87901d/app. When you are done, tell me in a sentence or two what you did, and say if there was anything you were not sure of.
