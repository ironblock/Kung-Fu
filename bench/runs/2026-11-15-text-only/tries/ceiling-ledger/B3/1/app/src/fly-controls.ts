import { attachFreeControl } from "@babylonjs/lite";
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

/** How much faster the camera moves while Shift is held. */
const BOOST = 3;

type FrameHook = () => void;
type Vec3Like = { x: number; y: number; z: number; set(x: number, y: number, z: number): unknown };

function isShift(e: KeyboardEvent): boolean {
    return e.code === "ShiftLeft" || e.code === "ShiftRight" || e.key === "Shift";
}

/**
 * Gives `camera` the library's free-camera fly controls on `canvas`
 * (W/A/S/D or arrows to move, mouse to look, Space up, PageDown down),
 * plus a Shift boost that makes all control-driven movement three times as fast.
 *
 * Shift is kept away from the library's key handling entirely, so whatever the
 * library binds Shift to, holding it can never move the camera up or down.
 *
 * Returns a function that removes everything this attached.
 */
export function attachFlyControls(
    camera: FreeCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
): () => void {
    const hooks = (scene as unknown as { _beforeRender: FrameHook[] })._beforeRender;
    const position = (camera as unknown as { position: Vec3Like }).position;
    const target = (camera as unknown as { target: Vec3Like }).target;

    let shiftLeft = false;
    let shiftRight = false;
    const boosting = (): boolean => shiftLeft || shiftRight;

    // Track Shift ourselves and stop the event before any other listener sees it.
    // This listener is added on window in the capture phase *before* the library's
    // controls are attached, so it runs ahead of the library whether the library
    // listens on the canvas, the document or the window.
    const onShiftKey = (e: Event): void => {
        const ke = e as KeyboardEvent;
        if (!isShift(ke)) return;
        const down = ke.type === "keydown";
        if (ke.code === "ShiftRight") shiftRight = down;
        else shiftLeft = down;
        ke.stopImmediatePropagation();
    };
    const onBlur = (): void => {
        shiftLeft = false;
        shiftRight = false;
    };
    window.addEventListener("keydown", onShiftKey, true);
    window.addEventListener("keyup", onShiftKey, true);
    window.addEventListener("blur", onBlur);

    // Head hook: remember where the camera is before the controls move it this frame.
    // Placed at the head of the list, it runs before every camera control hook.
    let x0 = 0;
    let y0 = 0;
    let z0 = 0;
    const before: FrameHook = () => {
        x0 = position.x;
        y0 = position.y;
        z0 = position.z;
    };
    hooks.unshift(before);

    // The library's own keyboard + mouse fly controls. Its per-frame hook goes
    // to the tail of scene._beforeRender.
    const detachLibrary = attachFreeControl(camera, canvas, scene) as unknown as () => void;

    // Tail hook, added after the library's, so it runs right after the library has
    // applied this frame's movement. While Shift is held, add (BOOST - 1) times the
    // library's displacement, and move the target by the same amount so the view
    // direction (and the controls' _yaw/_pitch) stay consistent.
    const after: FrameHook = () => {
        if (!boosting()) return;
        const k = BOOST - 1;
        const dx = (position.x - x0) * k;
        const dy = (position.y - y0) * k;
        const dz = (position.z - z0) * k;
        if (dx === 0 && dy === 0 && dz === 0) return;
        position.set(position.x + dx, position.y + dy, position.z + dz);
        target.set(target.x + dx, target.y + dy, target.z + dz);
    };
    hooks.push(after);

    let disposed = false;
    return () => {
        if (disposed) return;
        disposed = true;
        detachLibrary();
        for (const hook of [before, after]) {
            const i = hooks.indexOf(hook);
            if (i !== -1) hooks.splice(i, 1);
        }
        window.removeEventListener("keydown", onShiftKey, true);
        window.removeEventListener("keyup", onShiftKey, true);
        window.removeEventListener("blur", onBlur);
        onBlur();
    };
}
