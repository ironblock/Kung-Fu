I'm working on a small viewer app in /Users/Shared/kf/boxes/c342da/app. It uses Babylon Lite 1.39.0, imported as "@babylonjs/lite". The library is not on this machine, so there is nothing to look it up in or to run.

What I do have is the library's type declarations for its camera code, in /Users/Shared/kf/boxes/c342da/app/camera-api.d.ts. Read them first.

# Orbit around the picked part

Our product viewer orbits a model with the library's orbit (arc-rotate) camera. When the user double-clicks a part, the camera should turn around that part instead. Please write `src/focus.ts` exporting:

```ts
import type { ArcRotateCamera } from "@babylonjs/lite";

export function focusOn(camera: ArcRotateCamera, point: { x: number; y: number; z: number }): void;
```

After the call the camera orbits `point`: it keeps its angles and its distance, so it moves by the same offset as from the old centre to `point`, and it looks straight at `point`. This must show at once: our label code runs right after the call, in the same frame, and reads where the camera is and the view it gives. From then on, when the app changes the camera's angles or distance, the camera keeps orbiting `point`. The function may be called many times in a row.

Please keep every change inside /Users/Shared/kf/boxes/c342da/app. When you are done, tell me in a sentence or two what you did, and say if there was anything you were not sure of.
