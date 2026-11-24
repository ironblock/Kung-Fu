I'm working on a small viewer app in /tmp/claude-0/-home-user/00000000-0000-0000-0000-000000000000/scratchpad/reader-work/plain-a/B2/3/app. It uses Babylon Lite, and for various reasons I need the exact version that is checked out at /tmp/claude-0/-home-user/00000000-0000-0000-0000-000000000000/scratchpad/reader-work/plain-a/B2/3/babylon-lite: nothing older or newer can be used. The app's tsconfig and vitest config already point the import "@babylonjs/lite" at that checkout, and the dev dependencies of both are installed.

# Faster orbit drag

Users find our orbit viewer sluggish to turn. Please write `src/fast-orbit.ts` exporting:

```ts
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

export function attachFastOrbit(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void;
```

It gives the orbit (arc-rotate) camera the library's standard mouse and touch controls on that canvas, with one change: a drag must turn the camera twice as far as the library's default controls turn it for the same mouse movement. That holds for left-right and up-down, and it includes the glide after the button is released. Zooming with the wheel stays exactly as the library's default does it.

The returned function removes the controls: no listeners left on the canvas and nothing of ours left running each frame.

Please keep every change inside /tmp/claude-0/-home-user/00000000-0000-0000-0000-000000000000/scratchpad/reader-work/plain-a/B2/3/app. When you are done, tell me in a sentence or two what you did, and say if there was anything you were not sure of.
