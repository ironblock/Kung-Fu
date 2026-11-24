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
