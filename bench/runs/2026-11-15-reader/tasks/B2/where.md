# B2: where the drag speed is decided

**What the plain answer gets wrong.** It doubles `camera.angularSensibility`, reading "sensibility" as "sensitivity". The controls divide the drag distance by that field, so the camera turns half as far, not twice as far.

**What decides it, in `babylon-lite/packages/babylon-lite/src/camera/`:**

- `arc-rotate-controls.ts`, lines 332-336: on pointer-move the rotation offsets change by `dx / angularSensibility` and `dy / angularSensibility`. Lines 438-445: those offsets are applied each frame and decay by `camera.inertia`, so the glide scales with them too. Lines 242-248: the comment that these values are read live at the point of use.
- `arc-rotate.ts`, line 39: the field's doc comment, "Mouse-drag orbit sensitivity (HIGHER = slower rotation). Babylon default 1000". Line 130 sets the default to 1000.

**The makers' unit test that pins it:** `babylon-lite/tests/lite/unit/arc-rotate-controls.test.ts`, the case "reads angularSensibility LIVE, so a value set after attachControl takes effect". It raises the value to 2000, which it calls "2× slower orbit", and expects half the offset of the default.

**Does a comment in `src` say it?** Yes: "HIGHER = slower rotation" on the field in `arc-rotate.ts`.
