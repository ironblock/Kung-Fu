# Orbit viewer with a zoom range

Our product viewer orbits a 3D model with the library's orbit (arc-rotate) camera. Please write `src/limited-orbit.ts` exporting:

```ts
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

export function attachLimitedOrbit(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext, minDistance: number, maxDistance: number): () => void;
```

It gives the camera the library's usual mouse and touch controls on that canvas: drag to orbit, mouse wheel and two-finger pinch to zoom. Zooming must keep working, but the camera's distance from the point it orbits must stay between `minDistance` and `maxDistance` on every frame, however hard the user scrolls or pinches. If the camera starts outside that range, bring it inside as soon as the function is called.

The returned function removes the controls: no listeners left on the canvas and nothing of ours left running each frame.
