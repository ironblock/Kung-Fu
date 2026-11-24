# A chase camera that banks with the car

Our roller-coaster game needs a camera that rides behind the car and leans with it. Please write `src/chase-camera.ts` exporting:

```ts
import type { FreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };
export interface ChaseCamera { camera: FreeCamera; bank(up: Vec): void }
export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera;
```

`camera` sits at `eye`, looks at `target` and starts upright. Each frame we move `camera.position` and `camera.target` with the car, then call `bank(up)` with the car's up direction (a unit vector). The camera rolls so that up in its picture matches that direction as closely as it can while still looking at the target. On loops the car's up sometimes points exactly along the line of sight, either way. On such a call it must still look at the target and keep its previous roll.
