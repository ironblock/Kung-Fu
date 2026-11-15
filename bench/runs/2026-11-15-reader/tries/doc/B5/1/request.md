I'm working on a small viewer app in /tmp/claude-0/-home-user/00000000-0000-0000-0000-000000000000/scratchpad/reader-work/doc/B5/1/app. It uses Babylon Lite, and for various reasons I need the exact version that is checked out at /tmp/claude-0/-home-user/00000000-0000-0000-0000-000000000000/scratchpad/reader-work/doc/B5/1/babylon-lite: nothing older or newer can be used. The app's tsconfig and vitest config already point the import "@babylonjs/lite" at that checkout, and the dev dependencies of both are installed.

The library's own notes on its camera code are in the checkout, at /tmp/claude-0/-home-user/00000000-0000-0000-0000-000000000000/scratchpad/reader-work/doc/B5/1/babylon-lite/docs/lite/architecture/02-camera.md. Read them first.

# Where to draw a map label

We draw HTML labels over our 3D terrain view. Please write `src/label-position.ts` exporting:

```ts
import type { Camera } from "@babylonjs/lite";

export function labelPosition(camera: Camera, canvas: HTMLCanvasElement, point: { x: number; y: number; z: number }): { x: number; y: number; visible: boolean };
```

The camera renders to the whole canvas. `x` and `y` give where the world-space `point` appears, in CSS pixels from the canvas's top-left corner. `visible` means the point is in front of the camera and inside the picture, however far away it is. Distant mountains beyond the camera's far clipping distance count as visible. A point in front of the camera but outside the picture is not visible, and `x` and `y` still say where it would be, past the edge, for an arrow. A point behind the camera is never visible.

Please keep every change inside /tmp/claude-0/-home-user/00000000-0000-0000-0000-000000000000/scratchpad/reader-work/doc/B5/1/app. When you are done, tell me in a sentence or two what you did, and say if there was anything you were not sure of.
