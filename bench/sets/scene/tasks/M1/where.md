# M1: in what order per-frame callbacks run

**The behaviour.** `onBeforeRender(scene, cb)` puts `cb` at the front of the scene's per-frame list, so callbacks registered one after another run last-registered first.

**What the reader would answer, and why.** It calls `onBeforeRender(scene, update)` once per system and expects them to run first-registered first. The name and the signature `(scene, cb) => void` match Babylon.js `scene.registerBeforeRender` and `onBeforeRenderObservable.add`, which both call callbacks in the order they were added, and nothing in the declaration says otherwise. The systems then run in reverse order.

**The code that decides it.** `babylon-lite/packages/babylon-lite/src/scene/scene-core.ts`, line 437: `_beforeRender.unshift(cb)`. Lines 388-390: `_update` walks `_beforeRender` from index 0.

**The makers' unit test that pins it.** none (no case in `tests/lite/unit` asserts the order of two `onBeforeRender` callbacks).

**comment: no.** The doc comment on `onBeforeRender` (line 435) says only "Register a callback to run before each rendered frame."
