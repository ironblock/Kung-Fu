# F5: what the free-camera mouse-look reads

Right answer: `{ "lockedNoButton": false, "lockedButtonHeld": false, "rightDrag": true, "touchDrag": true }`. `proof.test.ts` shows all four on the library.

**The behaviour.** The free-camera mouse-look turns the camera only during a pointer drag (after a `pointerdown` of button 0, 1 or 2, any pointer type) and measures it from changes of `clientX`/`clientY`; it never reads `movementX`/`movementY`, so under pointer lock nothing turns.

**The answer the reader would give, and why.** `true, true, true, true`. Babylon.js's `FreeCameraMouseInput` checks `engine.isPointerLock` and then turns the camera from `movementX`/`movementY` with no button needed, and it handles touch pointers and buttons 0-2. The reader carries that over to `attachFreeControl`, whose `names/` signature says nothing about it.

**What decides it**, in `babylon-lite/packages/babylon-lite/src/camera/free-camera-controls.ts`:
- Lines 31-38: `pointerdown` starts a drag for buttons 0, 1, 2, whatever the pointer type.
- Lines 40-52: `pointermove` returns unless dragging, and turns by `clientX - lastPX` and `clientY - lastPY`.

**The makers' unit test that pins it:** none.

**comment: no.** The doc comment on `attachFreeControl` (lines 5-16) says the opposite: "Mouse drag or pointer-lock: look around (yaw/pitch)". That comment is not in `names/`.
