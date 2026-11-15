# Zoom and heading limits per map mode

Our globe viewer uses the library's geospatial camera and has several map modes (globe, region, city). For each mode the app keeps one `GeospatialLimits` object, made with the library's `createGeospatialLimits` and then adjusted. Please write `src/mode-limits.ts` exporting:

```ts
import type { GeospatialCamera, GeospatialLimits } from "@babylonjs/lite";

export function useModeLimits(camera: GeospatialCamera, limits: GeospatialLimits): void;
```

Switching mode calls it with that mode's limits. From then on, whatever zoom (`radius`) or heading (`yaw`) the app writes to the camera must be kept inside that mode's zoom range and heading range, and `camera.limits` must report that mode's values. Switching to another mode later must give that mode's ranges instead. The app never changes a mode's limits object after creating it.
