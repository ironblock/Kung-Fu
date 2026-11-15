I'm working on a small viewer app in /tmp/claude-0/-home-user/00000000-0000-0000-0000-000000000000/scratchpad/reader-work/plain-a/K1/1/app. It uses Babylon Lite, and for various reasons I need the exact version that is checked out at /tmp/claude-0/-home-user/00000000-0000-0000-0000-000000000000/scratchpad/reader-work/plain-a/K1/1/babylon-lite: nothing older or newer can be used. The app's tsconfig and vitest config already point the import "@babylonjs/lite" at that checkout, and the dev dependencies of both are installed.

Please add `src/orbit-camera.ts` to the app. It should export

```ts
export function createOrbitCamera(canvas: HTMLCanvasElement, scene: SceneContext): ArcRotateCamera
```

It makes an orbit camera that looks at the origin from 10 units away, hooks up the library's usual mouse and touch controls on the canvas, and turns on the library's own arrow-key control as well, so that people can turn the camera from the keyboard. It returns the camera. `scene` is a scene I have already created. You don't need to render anything.

Please keep every change inside /tmp/claude-0/-home-user/00000000-0000-0000-0000-000000000000/scratchpad/reader-work/plain-a/K1/1/app. When you are done, tell me in a sentence or two what you did, and say if there was anything you were not sure of.
