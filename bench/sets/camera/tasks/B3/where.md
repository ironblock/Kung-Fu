# B3: where the Shift key's meaning is decided

**What the plain answer gets wrong.** It passes only `fastKeys` and `fastMultiplier`. The library's default down keys are ShiftLeft, ShiftRight and PageDown, so with those defaults Shift both boosts and sinks. Shift+W moves forward three times as fast and also drops the camera, and Shift alone moves the camera down.

**What decides it**, in `babylon-lite/packages/babylon-lite/src/camera/configurable-free-camera-controls.ts`:

- Line 29: `const downKeys = options.downKeys ?? ["ShiftLeft", "ShiftRight", "PageDown"];`. Line 28 sets the up keys the same way (Space and PageUp).
- Lines 30-31: `fastKeys` defaults to none and `fastMultiplier` to 1.
- Line 82: the move speed is multiplied while a fast key is held.
- Lines 99-101: a held down key subtracts from the vertical direction, whether or not it is also a fast key.
- Lines 7-9: the doc comments on `upKeys` and `downKeys` give these defaults.

**The makers' unit test that pins it:** `babylon-lite/tests/lite/unit/free-camera-controls.test.ts`, the case "applies custom vertical keys and a held-key speed multiplier". It uses ShiftLeft as the fast key, and it overrides `downKeys` (`["KeyQ"]`) and `upKeys` so that Shift does not also move the camera vertically.

**Does a comment in `src` say it?** Yes: the doc comment on `downKeys` ("Defaults to ShiftLeft, ShiftRight, and PageDown").
