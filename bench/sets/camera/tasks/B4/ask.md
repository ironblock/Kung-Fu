# Tilt the globe view

Our globe viewer uses the library's geospatial camera. Please write `src/globe-tilt.ts` exporting:

```ts
import type { GeospatialCamera } from "@babylonjs/lite";

export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void;
```

`pitch` is in radians, measured from looking straight down at the ground (0) toward the horizon. We pass values between 0.1 and 1.2. After the call the camera must really look at its centre point at that tilt, whatever the zoom. That includes the zoom a newly created camera starts at, which is fully zoomed out. Getting there must not change the zoom, the heading or the centre point. The camera must also stay at that tilt when the app later moves it nearer to or farther from the globe.
