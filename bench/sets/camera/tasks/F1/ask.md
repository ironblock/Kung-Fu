# Fast fly camera for a big world

Our open-world map is huge, and the library's free camera crawls across it. Please write `src/big-world-fly.ts` exporting:

```ts
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

export function attachBigWorldFly(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void;
```

It gives the camera the library's keyboard and mouse fly controls on that canvas, with one change: every movement key (W/A/S/D, the arrows, and the keys that rise and sink) moves the camera 20 times as far as the library's default controls move it while the key is held. Mouse look must stay exactly as the library's default: the same drag turns the camera by the same total amount once it has come to rest.

The returned function removes the controls: no listeners left on the canvas and nothing of ours left running each frame.
