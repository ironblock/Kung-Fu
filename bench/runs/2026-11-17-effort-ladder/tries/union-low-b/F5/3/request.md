I'm working on a small viewer app in /Users/Shared/kf/boxes/a4341c/app. It uses Babylon Lite 1.39.0, imported as "@babylonjs/lite". The library is not on this machine, so there is nothing to look it up in or to run.

What I do have is the library's type declarations for its camera code, in /Users/Shared/kf/boxes/a4341c/app/camera-api.d.ts, and some notes on how that code behaves, in /Users/Shared/kf/boxes/a4341c/app/camera-notes.md. Read them first.

# Mouse-look under pointer lock?

Our walkthrough uses the library's usual free-camera controls, `attachFreeControl(camera, canvas, scene)`, with a render loop running. We want a shooter-style mode: a click locks the pointer to the canvas (we call `requestPointerLock`). While locked, the browser keeps `clientX`/`clientY` fixed and reports motion in `movementX`/`movementY`. Before I decide whether to write our own mouse-look, I need to know, with those controls as they are, whether the camera turns:

- `lockedNoButton`: while locked, moving the mouse with no button held;
- `lockedButtonHeld`: while locked, moving the mouse with the left button held;
- `rightDrag`: with no lock, dragging with the right button;
- `touchDrag`: on a tablet, a one-finger drag across the canvas.

Please write the answer to `notes/pointer-lock.json`:

```json
{ "lockedNoButton": true or false, "lockedButtonHeld": true or false, "rightDrag": true or false, "touchDrag": true or false }
```

Please keep every change inside /Users/Shared/kf/boxes/a4341c/app. When you are done, tell me in a sentence or two what you did, and say if there was anything you were not sure of.
