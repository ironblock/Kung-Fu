I'm working on a small viewer app in /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/reader-work/doc/I1/1/app. It uses Babylon Lite, and for various reasons I need the exact version that is checked out at /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/reader-work/doc/I1/1/babylon-lite: nothing older or newer can be used. The app's tsconfig and vitest config already point the import "@babylonjs/lite" at that checkout, and the dev dependencies of both are installed.

The library's own notes on its camera code are in the checkout, at /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/reader-work/doc/I1/1/babylon-lite/docs/lite/architecture/02-camera.md. Read them first.

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

Please keep every change inside /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/reader-work/doc/I1/1/app. When you are done, tell me in a sentence or two what you did, and say if there was anything you were not sure of.
