I'm working on a small viewer app in /Users/Shared/kf/boxes/ddbb93/app. It uses Babylon Lite 1.39.0, imported as "@babylonjs/lite". The library is not on this machine, so there is nothing to look it up in or to run.

What I do have is the library's type declarations for its camera code, in /Users/Shared/kf/boxes/ddbb93/app/camera-api.d.ts. Read them first.

# Fly to a place, and say whether we got there

Our globe viewer uses the library's geospatial camera and its fly-to animation. Please write `src/fly-to-place.ts` exporting:

```ts
import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";

export interface Place { yaw: number; pitch: number; radius: number; center: { x: number; y: number; z: number } }
export function flyToPlace(camera: GeospatialCamera, scene: SceneContext, place: Place, durationMs: number): Promise<boolean>;
```

It flies the camera smoothly to `place` over about `durationMs`, driven by the scene's render loop. The promise settles once the flight is over and never rejects: `true` if the camera arrived at the place, `false` if the flight was stopped before it got there, for example because another fly-to started, from this function or anywhere else in the app. We open the place's info panel only on `true`. Our places are always within the camera's limits.

Please keep every change inside /Users/Shared/kf/boxes/ddbb93/app. When you are done, tell me in a sentence or two what you did, and say if there was anything you were not sure of.
