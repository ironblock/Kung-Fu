I'm working on a small viewer app in /home/dev/3c6068/app. It uses Babylon Lite 1.39.0, imported as "@babylonjs/lite". The library is not on this machine, so there is nothing to look it up in or to run.

What I do have is the library's type declarations for its camera code, in /home/dev/3c6068/app/camera-api.d.ts. Read them first.

We took the elevation limits off our orbit (arc-rotate) camera so that users can drag right over the top of the model. I need to know what the camera does past the top, to decide whether our code must flip anything.

Take `const camera = createArcRotateCamera(0, 0.5, 10, { x: 0, y: 0, z: 0 })`, then set `camera.beta = -0.5` directly, with no controls and no frame rendered.

Please write the answer to `notes/over-the-top.json` in the app, in this shape:

```json
{ "eyeX": 0, "eyeY": 0, "upright": true, "sameAsOtherSide": true }
```

- `eyeX`, `eyeY`: the camera's world position afterwards.
- `upright`: `true` if the world's up direction still points up in the camera's picture, `false` if the picture is upside down.
- `sameAsOtherSide`: `true` if the camera then shows exactly the same view as a fresh `createArcRotateCamera(Math.PI, 0.5, 10, { x: 0, y: 0, z: 0 })`.

Please keep every change inside /home/dev/3c6068/app. When you are done, tell me in a sentence or two what you did, and say if there was anything you were not sure of.
