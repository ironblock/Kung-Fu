# Fly to a place, and say whether we got there

Our globe viewer uses the library's geospatial camera and its fly-to animation. Please write `src/fly-to-place.ts` exporting:

```ts
import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";

export interface Place { yaw: number; pitch: number; radius: number; center: { x: number; y: number; z: number } }
export function flyToPlace(camera: GeospatialCamera, scene: SceneContext, place: Place, durationMs: number): Promise<boolean>;
```

It flies the camera smoothly to `place` over about `durationMs`, driven by the scene's render loop. The promise settles once the flight is over and never rejects: `true` if the camera arrived at the place, `false` if the flight was stopped before it got there, for example because another fly-to started, from this function or anywhere else in the app. We open the place's info panel only on `true`. Our places are always within the camera's limits.
