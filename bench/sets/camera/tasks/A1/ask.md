# Orbit around the picked part

Our product viewer orbits a model with the library's orbit (arc-rotate) camera. When the user double-clicks a part, the camera should turn around that part instead. Please write `src/focus.ts` exporting:

```ts
import type { ArcRotateCamera } from "@babylonjs/lite";

export function focusOn(camera: ArcRotateCamera, point: { x: number; y: number; z: number }): void;
```

After the call the camera orbits `point`: it keeps its angles and its distance, so it moves by the same offset as from the old centre to `point`, and it looks straight at `point`. This must show at once: our label code runs right after the call, in the same frame, and reads where the camera is and the view it gives. From then on, when the app changes the camera's angles or distance, the camera keeps orbiting `point`. The function may be called many times in a row.
