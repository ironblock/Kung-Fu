import { attachFreeControl, onBeforeRender } from "@babylonjs/lite";
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

/** How much faster the camera moves while Shift is held. */
const BOOST = 3;

type Vec3 = { x: number; y: number; z: number };

/**
 * Gives `camera` the library's free-camera fly controls on `canvas`
 * (W/A/S/D or arrows to move, mouse to look, Space up, PageDown down),
 * plus a Shift boost that triples movement speed.
 *
 * Shift is kept away from the library's keyboard handling, so it can never
 * be read as a "move down" (or any other) key. The boost is applied by
 * measuring how far the library moved the camera since the previous frame
 * and adding (BOOST - 1) times that movement while Shift is held. Shift on
 * its own therefore never moves the camera: with no other movement there is
 * nothing to scale.
 *
 * Returns a function that removes the library controls, our key listeners
 * and our per-frame hook.
 */
export function attachFlyControls(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    let shiftLeft = false;
    let shiftRight = false;
    const boosting = () => shiftLeft || shiftRight;

    // Shift events aimed at the canvas (or at nothing focusable) are consumed
    // here, in the capture phase on window, before any listener the library
    // put on the canvas, document or window can see them.
    const isOurs = (e: KeyboardEvent) => {
        const t = e.target;
        return t === canvas || t === document.body || t === document.documentElement || t === document || t === window;
    };
    const onKey = (e: KeyboardEvent) => {
        if (e.code !== "ShiftLeft" && e.code !== "ShiftRight") return;
        if (!isOurs(e)) return;
        const down = e.type === "keydown";
        if (e.code === "ShiftLeft") shiftLeft = down;
        else shiftRight = down;
        e.stopImmediatePropagation();
    };
    const onBlur = () => {
        shiftLeft = false;
        shiftRight = false;
    };
    window.addEventListener("keydown", onKey, true);
    window.addEventListener("keyup", onKey, true);
    window.addEventListener("blur", onBlur);

    // The library's controls. They need the scene to apply input each frame.
    const detachLibrary = attachFreeControl(camera, canvas, scene);

    // Per-frame boost. The delta between two of our ticks is the movement the
    // library applied in one frame (our own addition is excluded because we
    // snapshot after adding it).
    const pos = (camera as unknown as { position: Vec3 }).position;
    let last: Vec3 = { x: pos.x, y: pos.y, z: pos.z };
    const tick = () => {
        const p = (camera as unknown as { position: Vec3 }).position;
        if (boosting()) {
            const k = BOOST - 1;
            const dx = p.x - last.x;
            const dy = p.y - last.y;
            const dz = p.z - last.z;
            if (dx !== 0 || dy !== 0 || dz !== 0) {
                // Assign a fresh object so a setter (and the camera's
                // world-matrix version) sees the change.
                (camera as unknown as { position: Vec3 }).position = {
                    ...p,
                    x: p.x + dx * k,
                    y: p.y + dy * k,
                    z: p.z + dz * k,
                } as Vec3;
            }
        }
        const q = (camera as unknown as { position: Vec3 }).position;
        last = { x: q.x, y: q.y, z: q.z };
    };
    const offFrame = (onBeforeRender as unknown as (s: SceneContext, cb: () => void) => unknown)(scene, tick);

    let disposed = false;
    return () => {
        if (disposed) return;
        disposed = true;
        window.removeEventListener("keydown", onKey, true);
        window.removeEventListener("keyup", onKey, true);
        window.removeEventListener("blur", onBlur);
        detachLibrary();
        if (typeof offFrame === "function") {
            (offFrame as () => void)();
        } else {
            // Fallback if onBeforeRender returns no disposer: take our hook
            // out of the scene's per-frame list directly.
            const list = (scene as unknown as { _beforeRender?: Array<() => void> })._beforeRender;
            const i = list ? list.indexOf(tick) : -1;
            if (list && i >= 0) list.splice(i, 1);
        }
    };
}
