I'm working on a small viewer app in /tmp/claude-0/-home-user/00000000-0000-0000-0000-000000000000/scratchpad/reader-work/ledger/P1/2/app. It uses Babylon Lite, and for various reasons I need the exact version that is checked out at /tmp/claude-0/-home-user/00000000-0000-0000-0000-000000000000/scratchpad/reader-work/ledger/P1/2/babylon-lite: nothing older or newer can be used. The app's tsconfig and vitest config already point the import "@babylonjs/lite" at that checkout, and the dev dependencies of both are installed.

/tmp/claude-0/-home-user/00000000-0000-0000-0000-000000000000/scratchpad/reader-work/ledger/P1/2/app/camera-ledger.toml is a ledger of facts about the library's camera code, written for this release. Its paths start from /tmp/claude-0/-home-user/00000000-0000-0000-0000-000000000000/scratchpad/reader-work/ledger/P1/2/babylon-lite/packages/babylon-lite. A row with `run` and `shows` is a search of the code and a sentence about what it finds; a tool has checked that each search still gives the count its row states. A row with `is` is a note by someone who read the code, and nothing has checked it. Read the ledger first.

One page of the app shows a static preview. It makes its camera with `createArcRotateCamera` and calls `attachControl(camera, canvas)` with no scene, because nothing on that page runs a render loop.

Before QA tries that page on a laptop and on a tablet, I want to tell them what to expect. On that page, which of these change the camera's `alpha`, `beta` or `radius`?

1. dragging with the mouse
2. turning the mouse wheel
3. a two-finger pinch

Please write the answer to `notes/preview-controls.json` in the app, in this shape, with `true` where the input changes the camera and `false` where it does not:

```json
{ "drag": true or false, "wheel": true or false, "pinch": true or false }
```

Please keep every change inside /tmp/claude-0/-home-user/00000000-0000-0000-0000-000000000000/scratchpad/reader-work/ledger/P1/2/app. When you are done, tell me in a sentence or two what you did, and say if there was anything you were not sure of.
