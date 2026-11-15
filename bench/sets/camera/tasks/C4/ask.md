# Turntable tour

Our product page has a "Tour" button. Please write `src/turntable.ts` exporting:

```ts
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

export function spinAround(camera: ArcRotateCamera, scene: SceneContext, turns: number): Promise<void>;
```

The camera is the library's orbit (arc-rotate) camera, and the scene's render loop is running. The call glides the camera around the model by `turns` full turns (we pass values such as 0.75, 1 and 2), always in the direction in which `alpha` grows, with the library's own smooth camera-transition easing and no jump at any frame. Its distance, its height angle and the point it looks at stay as they are. The promise resolves once the camera has arrived, with `alpha` equal to its starting value plus `2π · turns`. Nothing else moves the camera meanwhile.
