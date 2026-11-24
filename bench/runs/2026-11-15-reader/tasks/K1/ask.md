Please add `src/orbit-camera.ts` to the app. It should export

```ts
export function createOrbitCamera(canvas: HTMLCanvasElement, scene: SceneContext): ArcRotateCamera
```

It makes an orbit camera that looks at the origin from 10 units away, hooks up the library's usual mouse and touch controls on the canvas, and turns on the library's own arrow-key control as well, so that people can turn the camera from the keyboard. It returns the camera. `scene` is a scene I have already created. You don't need to render anything.
