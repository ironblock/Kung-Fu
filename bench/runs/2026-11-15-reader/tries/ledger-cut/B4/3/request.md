I'm working on a small viewer app in /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/reader-work/ledger-cut/B4/3/app. It uses Babylon Lite, and for various reasons I need the exact version that is checked out at /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/reader-work/ledger-cut/B4/3/babylon-lite: nothing older or newer can be used. The app's tsconfig and vitest config already point the import "@babylonjs/lite" at that checkout, and the dev dependencies of both are installed.

/tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/reader-work/ledger-cut/B4/3/app/camera-ledger.toml is a ledger of facts about the library's camera code, written for this release. Its paths start from /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/reader-work/ledger-cut/B4/3/babylon-lite/packages/babylon-lite. A row with `run` and `shows` is a search of the code and a sentence about what it finds; a tool has checked that each search still gives the count its row states. A row with `is` is a note by someone who read the code, and nothing has checked it. Read the ledger first.

# Tilt the globe view

Our globe viewer uses the library's geospatial camera. Please write `src/globe-tilt.ts` exporting:

```ts
import type { GeospatialCamera } from "@babylonjs/lite";

export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void;
```

`pitch` is in radians, measured from looking straight down at the ground (0) toward the horizon. We pass values between 0.1 and 1.2. After the call the camera must really look at its centre point at that tilt, whatever the zoom. That includes the zoom a newly created camera starts at, which is fully zoomed out. Getting there must not change the zoom, the heading or the centre point. The camera must also stay at that tilt when the app later moves it nearer to or farther from the globe.

Please keep every change inside /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/reader-work/ledger-cut/B4/3/app. When you are done, tell me in a sentence or two what you did, and say if there was anything you were not sure of.
