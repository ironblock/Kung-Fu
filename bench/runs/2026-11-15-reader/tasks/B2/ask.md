# Faster orbit drag

Users find our orbit viewer sluggish to turn. Please write `src/fast-orbit.ts` exporting:

```ts
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

export function attachFastOrbit(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void;
```

It gives the orbit (arc-rotate) camera the library's standard mouse and touch controls on that canvas, with one change: a drag must turn the camera twice as far as the library's default controls turn it for the same mouse movement. That holds for left-right and up-down, and it includes the glide after the button is released. Zooming with the wheel stays exactly as the library's default does it.

The returned function removes the controls: no listeners left on the canvas and nothing of ours left running each frame.
