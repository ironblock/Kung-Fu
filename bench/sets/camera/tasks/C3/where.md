# C3: where two held arrow keys are decided

**Right answer:** `{ "rotateFraction": 0.71, "altFraction": 1.0, "ctrlSameDistance": true }`. `proof.test.ts` shows each on the library.

**Behaviour.** The keyboard control normalises a diagonal for plain rotation and for Ctrl-panning (each axis gets 1/√2 of a single key's rate), but not in the Alt branch, where Right still turns alpha at the full rate while Up zooms.

**What the reader would answer, and why.** `{ "rotateFraction": 1, "altFraction": 1, "ctrlSameDistance": false }`. In Babylon.js's `ArcRotateCameraKeyboardMoveInput.checkInputs` each held key adds its own fixed step (`angularSpeed`, `1 / panningSensibility`) independently, so two keys give the full rate on each axis and a Ctrl diagonal pans √2 as far. The names show only sensitivities and key lists, nothing about a diagonal.

**What decides it**, in `babylon-lite/packages/babylon-lite/src/camera/arc-rotate-keyboard-controls.ts`, `applyInput`, lines 106-139:
- lines 117-125: Ctrl branch, `horizontal / magnitude` and `vertical / magnitude` with `magnitude = Math.hypot(...)`, and it returns first, so Ctrl wins over Alt.
- lines 127-131: Alt branch, `inertialAlphaOffset += horizontal / angularSensitivity`, no normalisation.
- lines 133-138: plain branch, normalised like the Ctrl branch.
- The offsets are applied by `applyInertia` in `arc-rotate-controls.ts` (line 432 calls the keyboard input, lines 435-446 and 457-489 apply it), linearly, so the 60-frame ratios equal the per-frame ones.

**The makers' unit tests that pin it** (`tests/lite/unit/arc-rotate-controls.test.ts`, describe "attachControl — keyboard controls"): "normalizes diagonal rotation to the single-axis speed", "normalizes diagonal Ctrl-panning to the single-axis speed", "normalizes custom-mapped rotation and Ctrl-panning diagonals". The Alt diagonal is not pinned; "maps Alt+%s to zoom" pins one key at a time.

comment: no. The doc comments on `ArcRotateKeyboardOptions` give the divisors and defaults only.
