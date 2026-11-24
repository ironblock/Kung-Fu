# C2: where Ctrl + primary drag is decided

**Behaviour.** The pointer controls never read `ctrlKey`: a primary-button drag with Ctrl held orbits exactly like one without it, and only the button (and `pointerMappings`) chooses between orbit and pan.

**What the reader would answer, and why.** It calls `attachControl` and nothing else. Babylon.js's `ArcRotateCameraPointersInput` has `useCtrlForPanning = true` by default, so Ctrl + left drag pans there, and Mac users rely on it. The names show no `useCtrlForPanning` field, but also nothing that says Ctrl is ignored, and the reader assumes parity. Its Ctrl-drag orbits the camera and leaves the target where it was.

**What decides it**, in `babylon-lite/packages/babylon-lite/src/camera/arc-rotate-controls.ts`:
- lines 269-292, `onPointerDown`: lines 279-286 pick the action from `e.button`, `e.pointerType` and `options.pointerMappings` alone; no modifier is read anywhere in the pointer path (lines 269-349).
- lines 183-189: the doc comment says the controls "Match Babylon.js ArcRotateCameraPointersInput behavior" and lists primary-drag rotate and secondary-drag pan, with no word on Ctrl.

**The makers' unit test that pins it:** none. The pointer-mapping cases (describe "attachControl — pointer mappings") use no modifier; Ctrl appears only in the keyboard cases.

comment: no.
