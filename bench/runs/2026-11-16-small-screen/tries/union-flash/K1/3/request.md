I'm working on a small viewer app in /Users/Shared/kf/boxes/db51fe/app. It uses Babylon Lite 1.39.0, imported as "@babylonjs/lite". The library is not on this machine, so there is nothing to look it up in or to run.

What I do have is the library's type declarations for its camera code, in /Users/Shared/kf/boxes/db51fe/app/camera-api.d.ts, and some notes on how that code behaves, in /Users/Shared/kf/boxes/db51fe/app/camera-notes.md. Read them first.

Please add `src/orbit-camera.ts` to the app. It should export

```ts
export function createOrbitCamera(canvas: HTMLCanvasElement, scene: SceneContext): ArcRotateCamera
```

It makes an orbit camera that looks at the origin from 10 units away, hooks up the library's usual mouse and touch controls on the canvas, and turns on the library's own arrow-key control as well, so that people can turn the camera from the keyboard. It returns the camera. `scene` is a scene I have already created. You don't need to render anything.

Please keep every change inside /Users/Shared/kf/boxes/db51fe/app. When you are done, tell me in a sentence or two what you did, and say if there was anything you were not sure of.
