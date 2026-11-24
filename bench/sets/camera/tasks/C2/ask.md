# Ctrl-drag to pan

Our viewer orbits the model with the library's orbit (arc-rotate) camera. Please write `src/mac-pan.ts` exporting:

```ts
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

export function attachOrbitWithCtrlPan(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void;
```

It gives the camera the library's usual mouse and touch controls on that canvas: primary-button drag to orbit, right-button drag to pan, wheel and pinch to zoom, all exactly as the library's defaults do them. Many of our users are on Mac laptops with no right button, so holding Ctrl while dragging with the primary button must pan the camera, by just as much as a right-button drag of the same mouse movement, glide included, and must not orbit it. A primary-button drag without Ctrl still orbits.

The returned function removes the controls: no listeners left on the canvas and nothing of ours left running each frame.
