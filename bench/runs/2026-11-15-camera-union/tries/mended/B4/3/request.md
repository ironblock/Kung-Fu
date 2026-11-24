I'm working on a small viewer app in /home/dev/d127f2/app. It uses Babylon Lite 1.39.0, imported as "@babylonjs/lite". The library is not on this machine, so there is nothing to look it up in or to run.

What I do have is the library's type declarations for its camera code, in /home/dev/d127f2/app/camera-api.d.ts, and some notes on how that code behaves, in /home/dev/d127f2/app/camera-notes.md. Read them first.

# Tilt the globe view

Our globe viewer uses the library's geospatial camera. Please write `src/globe-tilt.ts` exporting:

```ts
import type { GeospatialCamera } from "@babylonjs/lite";

export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void;
```

`pitch` is in radians, measured from looking straight down at the ground (0) toward the horizon. We pass values between 0.1 and 1.2. After the call the camera must really look at its centre point at that tilt, whatever the zoom. That includes the zoom a newly created camera starts at, which is fully zoomed out. Getting there must not change the zoom, the heading or the centre point. The camera must also stay at that tilt when the app later moves it nearer to or farther from the globe.

Please keep every change inside /home/dev/d127f2/app. When you are done, tell me in a sentence or two what you did, and say if there was anything you were not sure of.
