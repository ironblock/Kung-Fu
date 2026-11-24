I'm working on a small viewer app in /Users/Shared/kf/boxes/4e9bb4/app. It uses Babylon Lite 1.39.0, imported as "@babylonjs/lite". The library is not on this machine, so there is nothing to look it up in or to run.

What I do have is the library's type declarations for its camera code, in /Users/Shared/kf/boxes/4e9bb4/app/camera-api.d.ts. Read them first.

# Fast fly camera for a big world

Our open-world map is huge, and the library's free camera crawls across it. Please write `src/big-world-fly.ts` exporting:

```ts
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

export function attachBigWorldFly(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void;
```

It gives the camera the library's keyboard and mouse fly controls on that canvas, with one change: every movement key (W/A/S/D, the arrows, and the keys that rise and sink) moves the camera 20 times as far as the library's default controls move it while the key is held. Mouse look must stay exactly as the library's default: the same drag turns the camera by the same total amount once it has come to rest.

The returned function removes the controls: no listeners left on the canvas and nothing of ours left running each frame.

Please keep every change inside /Users/Shared/kf/boxes/4e9bb4/app. When you are done, tell me in a sentence or two what you did, and say if there was anything you were not sure of.
