I'm working on a small viewer app in /Users/Shared/kf/boxes/ec5920/app. It uses Babylon Lite 1.39.0, imported as "@babylonjs/lite". The library is not on this machine, so there is nothing to look it up in or to run.

What I do have is the library's type declarations for its camera code, in /Users/Shared/kf/boxes/ec5920/app/camera-api.d.ts, and some notes on how that code behaves, in /Users/Shared/kf/boxes/ec5920/app/camera-notes.md. Read them first.

In the app, `goHome()` does this:

```ts
await interpolateArcRotateCamera(camera, scene, { alpha: 0, radius: 4 });
```

The camera has the library's usual controls on it, attached with the same scene: `attachControl(camera, canvas, scene)`. I need to know what that `await` does in three situations, so that I can decide where a try/catch belongs. Nothing else touches the camera in any of them.

(a) The user flicked the camera just before `goHome()` was called, so the camera is still coasting when the call is made. The user touches nothing after that.

(b) The transition is under way, and the user drags the camera with the mouse.

(c) The transition is about half way, and `goHome()` is called a second time. What does the first call's `await` do?

Please write the answer to `notes/go-home.json` in the app, with `"resolves"` or `"rejects"` for each:

```json
{ "a": "...", "b": "...", "c": "..." }
```

Please keep every change inside /Users/Shared/kf/boxes/ec5920/app. When you are done, tell me in a sentence or two what you did, and say if there was anything you were not sure of.
