I'm working on a small viewer app in /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/reader-work/ledger-cut/B6/3/app. It uses Babylon Lite, and for various reasons I need the exact version that is checked out at /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/reader-work/ledger-cut/B6/3/babylon-lite: nothing older or newer can be used. The app's tsconfig and vitest config already point the import "@babylonjs/lite" at that checkout, and the dev dependencies of both are installed.

/tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/reader-work/ledger-cut/B6/3/app/camera-ledger.toml is a ledger of facts about the library's camera code, written for this release. Its paths start from /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/reader-work/ledger-cut/B6/3/babylon-lite/packages/babylon-lite. A row with `run` and `shows` is a search of the code and a sentence about what it finds; a tool has checked that each search still gives the count its row states. A row with `is` is a note by someone who read the code, and nothing has checked it. Read the ledger first.

# A chase camera that banks with the car

Our roller-coaster game needs a camera that rides behind the car and leans with it. Please write `src/chase-camera.ts` exporting:

```ts
import type { FreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };
export interface ChaseCamera { camera: FreeCamera; bank(up: Vec): void }
export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera;
```

`camera` sits at `eye`, looks at `target` and starts upright. Each frame we call `bank(up)` with the car's up direction (a unit vector). The camera rolls so that up in its picture matches that direction as closely as it can while it keeps looking at the target. On loops the car's up sometimes points exactly along the line of sight, either way. On such a call the camera must keep looking at the target and keep its previous roll.

Please keep every change inside /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/reader-work/ledger-cut/B6/3/app. When you are done, tell me in a sentence or two what you did, and say if there was anything you were not sure of.
