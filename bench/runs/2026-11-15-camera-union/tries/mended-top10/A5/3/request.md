I'm working on a small viewer app in /home/dev/0aad36/app. It uses Babylon Lite 1.39.0, imported as "@babylonjs/lite". The library is not on this machine, so there is nothing to look it up in or to run.

What I do have is the library's type declarations for its camera code, in /home/dev/0aad36/app/camera-api.d.ts, and some notes on how that code behaves, in /home/dev/0aad36/app/camera-notes.md. Read them first.

Our picture-in-picture inset slides in from the right edge of the canvas. Halfway through the slide its camera has `viewport = { x: 0.8, y: 0.1, width: 0.3, height: 0.3 }`, so part of it lies past the canvas edge. The canvas's backing store is 1000 × 500 pixels.

We place an HTML frame over the inset from `resolveCameraViewport(camera, 1000, 500)`, and the inset is drawn with the aspect ratio `getEffectiveAspectRatio(camera, 1000, 500)`. I need both results to decide whether the frame and the picture will line up during the slide, or whether I must animate the inset differently.

Please write them to `notes/inset-slide.json` in the app, in this shape:

```json
{ "x": 0, "y": 0, "width": 0, "height": 0, "aspect": 0 }
```

`x`, `y`, `width` and `height` are the fields of what `resolveCameraViewport` returns, and `aspect` is what `getEffectiveAspectRatio` returns (two decimals are enough).

Please keep every change inside /home/dev/0aad36/app. When you are done, tell me in a sentence or two what you did, and say if there was anything you were not sure of.
