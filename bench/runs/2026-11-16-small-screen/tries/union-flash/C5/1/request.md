I'm working on a small viewer app in /Users/Shared/kf/boxes/e238b6/app. It uses Babylon Lite 1.39.0, imported as "@babylonjs/lite". The library is not on this machine, so there is nothing to look it up in or to run.

What I do have is the library's type declarations for its camera code, in /Users/Shared/kf/boxes/e238b6/app/camera-api.d.ts, and some notes on how that code behaves, in /Users/Shared/kf/boxes/e238b6/app/camera-notes.md. Read them first.

# Code that runs right after a transition starts

`showSpot()` does this between two frames:

```ts
const spot = { x: 1, y: 0, z: 0 };            // scratch vector
const done = interpolateArcRotateCamera(camera, scene, { alpha: 1, target: spot });
camera.radius = 7;                              // layout code
spot.x = 5;                                     // scratch reused for the next marker
```

The orbit (arc-rotate) camera starts at alpha 0, beta 1, radius 10, looking at the origin, no controls attached. Then the render loop runs and nothing else touches the camera or `spot`. I need to know whether those last two lines are safe there or must move.

Please write the answer to `notes/same-frame.json` in the app, in this shape:

```json
{ "rejects": true or false, "finalRadius": 0, "finalTargetX": 0 }
```

`rejects`: does `done` reject? The numbers: the camera's `radius` and `target.x` once `done` has settled.

Please keep every change inside /Users/Shared/kf/boxes/e238b6/app. When you are done, tell me in a sentence or two what you did, and say if there was anything you were not sure of.
