I'm working on a small viewer app in /home/user/work/7a303f/app. It uses Babylon Lite 1.39.0, imported as "@babylonjs/lite". The library is not on this machine, so there is nothing to look it up in or to run.

What I do have is /home/user/work/7a303f/app/camera-ledger.toml, a ledger of facts about the library's camera code, written for this release. A row with `run` and `shows` is a search of the code and a sentence about what it finds; a tool has checked that each search still gives the count its row states. A row with `is` is a note by someone who read the code, and nothing has checked it. Read the ledger first.

# Orbit viewer with a zoom range

Our product viewer orbits a 3D model with the library's orbit (arc-rotate) camera. Please write `src/limited-orbit.ts` exporting:

```ts
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

export function attachLimitedOrbit(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext, minDistance: number, maxDistance: number): () => void;
```

It gives the camera the library's usual mouse and touch controls on that canvas: drag to orbit, mouse wheel and two-finger pinch to zoom. Zooming must keep working, but the camera's distance from the point it orbits must stay between `minDistance` and `maxDistance` on every frame, however hard the user scrolls or pinches. If the camera starts outside that range, bring it inside as soon as the function is called.

The returned function removes the controls: no listeners left on the canvas and nothing of ours left running each frame.

Please keep every change inside /home/user/work/7a303f/app. When you are done, tell me in a sentence or two what you did, and say if there was anything you were not sure of.
