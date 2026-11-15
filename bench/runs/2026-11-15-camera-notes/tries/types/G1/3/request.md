I'm working on a small viewer app in /home/dev/131e18/app. It uses Babylon Lite 1.39.0, imported as "@babylonjs/lite". The library is not on this machine, so there is nothing to look it up in or to run.

What I do have is the library's type declarations for its camera code, in /home/dev/131e18/app/camera-api.d.ts. Read them first.

# Zoom and heading limits per map mode

Our globe viewer uses the library's geospatial camera and has several map modes (globe, region, city). For each mode the app keeps one `GeospatialLimits` object, made with the library's `createGeospatialLimits` and then adjusted. Please write `src/mode-limits.ts` exporting:

```ts
import type { GeospatialCamera, GeospatialLimits } from "@babylonjs/lite";

export function useModeLimits(camera: GeospatialCamera, limits: GeospatialLimits): void;
```

Switching mode calls it with that mode's limits. From then on, whatever zoom (`radius`) or heading (`yaw`) the app writes to the camera must be kept inside that mode's zoom range and heading range, and `camera.limits` must report that mode's values. Switching to another mode later must give that mode's ranges instead. The app never changes a mode's limits object after creating it.

Please keep every change inside /home/dev/131e18/app. When you are done, tell me in a sentence or two what you did, and say if there was anything you were not sure of.
