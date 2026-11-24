I'm working on a small viewer app in /home/user/work/7e7fd0/app. It uses Babylon Lite 1.39.0, imported as "@babylonjs/lite". The library is not on this machine, so there is nothing to look it up in or to run.

What I do have is /home/user/work/7e7fd0/app/camera-ledger.toml, a ledger of facts about the library's camera code, written for this release. A row with `run` and `shows` is a search of the code and a sentence about what it finds; a tool has checked that each search still gives the count its row states. A row with `is` is a note by someone who read the code, and nothing has checked it. Read the ledger first.

# Fly-through controls with a boost key

Our architecture walkthrough uses the library's free camera. Please write `src/fly-controls.ts` exporting:

```ts
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

export function attachFlyControls(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void;
```

It gives the camera the library's keyboard and mouse fly controls on that canvas: W/A/S/D or the arrow keys to move, the mouse to look around, Space to rise and PageDown to sink. Holding Shift (left or right) makes the camera move three times as fast. Shift is only a speed key. Holding it, alone or together with other keys, must never move the camera up or down by itself.

The returned function removes the controls: no listeners left on the canvas and nothing of ours left running each frame.

Please keep every change inside /home/user/work/7e7fd0/app. When you are done, tell me in a sentence or two what you did, and say if there was anything you were not sure of.
