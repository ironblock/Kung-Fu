I'm working on a small viewer app in /home/user/work/92d54b/app. It uses Babylon Lite 1.39.0, imported as "@babylonjs/lite". The library is not on this machine, so there is nothing to look it up in or to run.

What I do have is /home/user/work/92d54b/app/camera-ledger.toml, a ledger of facts about the library's camera code, written for this release. A row with `run` and `shows` is a search of the code and a sentence about what it finds; a tool has checked that each search still gives the count its row states. A row with `is` is a note by someone who read the code, and nothing has checked it. Read the ledger first.

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

Please keep every change inside /home/user/work/92d54b/app. When you are done, tell me in a sentence or two what you did, and say if there was anything you were not sure of.
