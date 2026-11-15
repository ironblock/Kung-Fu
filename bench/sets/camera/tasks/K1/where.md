# K1: where its fact is written

The plain answer passes `{ keyboard: true }` to `attachControl` and never calls `enableArcRotateKeyboardControls()`. It runs without an error, and the arrow keys do nothing.

- **The code that decides it:** `src/camera/arc-rotate-controls.ts`, line 262: `_arcRotateKeyboardFactory?.(camera, canvas, options?.keyboard)`. The factory is unset until `enableArcRotateKeyboardControls()` in `src/camera/arc-rotate-keyboard-controls.ts` installs it.
- **A comment in `src` says it:** the comment above `attachControl` says "Keyboard input is a separate opt-in installed by `enableArcRotateKeyboardControls`".
- **The makers' test that pins it:** `tests/lite/unit/arc-rotate-controls.test.ts`, the case "does not register or apply keyboard controls unless requested".
- **The makers' doc says it:** `docs/lite/architecture/02-camera.md`, lines 152 and 153.

This task was chosen by the person who ran the mapping rounds, knowing the ledgers and the doc. It is the kind where every arm can find the fact, so it can show a difference in what is spent and is not expected to show one in passing.
