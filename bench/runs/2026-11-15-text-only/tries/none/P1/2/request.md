I'm working on a small viewer app in /home/user/work/819b71/app. It uses Babylon Lite 1.39.0, imported as "@babylonjs/lite". The library is not on this machine, so there is nothing to look it up in or to run.

One page of the app shows a static preview. It makes its camera with `createArcRotateCamera` and calls `attachControl(camera, canvas)` with no scene, because nothing on that page runs a render loop.

Before QA tries that page on a laptop and on a tablet, I want to tell them what to expect. On that page, which of these change the camera's `alpha`, `beta` or `radius`?

1. dragging with the mouse
2. turning the mouse wheel
3. a two-finger pinch

Please write the answer to `notes/preview-controls.json` in the app, in this shape, with `true` where the input changes the camera and `false` where it does not:

```json
{ "drag": true or false, "wheel": true or false, "pinch": true or false }
```

Please keep every change inside /home/user/work/819b71/app. When you are done, tell me in a sentence or two what you did, and say if there was anything you were not sure of.
