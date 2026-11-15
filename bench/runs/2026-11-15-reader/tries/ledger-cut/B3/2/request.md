I'm working on a small viewer app in /tmp/claude-0/-home-user/00000000-0000-0000-0000-000000000000/scratchpad/reader-work/ledger-cut/B3/2/app. It uses Babylon Lite, and for various reasons I need the exact version that is checked out at /tmp/claude-0/-home-user/00000000-0000-0000-0000-000000000000/scratchpad/reader-work/ledger-cut/B3/2/babylon-lite: nothing older or newer can be used. The app's tsconfig and vitest config already point the import "@babylonjs/lite" at that checkout, and the dev dependencies of both are installed.

/tmp/claude-0/-home-user/00000000-0000-0000-0000-000000000000/scratchpad/reader-work/ledger-cut/B3/2/app/camera-ledger.toml is a ledger of facts about the library's camera code, written for this release. Its paths start from /tmp/claude-0/-home-user/00000000-0000-0000-0000-000000000000/scratchpad/reader-work/ledger-cut/B3/2/babylon-lite/packages/babylon-lite. A row with `run` and `shows` is a search of the code and a sentence about what it finds; a tool has checked that each search still gives the count its row states. A row with `is` is a note by someone who read the code, and nothing has checked it. Read the ledger first.

# Fly-through controls with a boost key

Our architecture walkthrough uses the library's free camera. Please write `src/fly-controls.ts` exporting:

```ts
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

export function attachFlyControls(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void;
```

It gives the camera the library's keyboard and mouse fly controls on that canvas: W/A/S/D or the arrow keys to move, the mouse to look around, Space to rise and PageDown to sink. Holding Shift (left or right) makes the camera move three times as fast. Shift is only a speed key. Holding it, alone or together with other keys, must never move the camera up or down by itself.

The returned function removes the controls: no listeners left on the canvas and nothing of ours left running each frame.

Please keep every change inside /tmp/claude-0/-home-user/00000000-0000-0000-0000-000000000000/scratchpad/reader-work/ledger-cut/B3/2/app. When you are done, tell me in a sentence or two what you did, and say if there was anything you were not sure of.
