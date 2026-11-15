In the app, `goHome()` does this:

```ts
await interpolateArcRotateCamera(camera, scene, { alpha: 0, radius: 4 });
```

The camera has the library's usual controls on it, attached with the same scene: `attachControl(camera, canvas, scene)`. I need to know what that `await` does in three situations, so that I can decide where a try/catch belongs. Nothing else touches the camera in any of them.

(a) The user flicked the camera just before `goHome()` was called, so the camera is still coasting when the call is made. The user touches nothing after that.

(b) The transition is under way, and the user starts to drag the camera.

(c) The transition is under way, and `goHome()` is called a second time. What does the first call's `await` do?

Please write the answer to `notes/go-home.json` in the app, with `"resolves"` or `"rejects"` for each:

```json
{ "a": "...", "b": "...", "c": "..." }
```
