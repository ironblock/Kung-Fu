import type { FreeCamera, SceneContext } from "@babylonjs/lite";

/** Base movement speed in world units per second. Shift multiplies it by BOOST_FACTOR. */
export const FLY_SPEED = 5;
/** Speed multiplier while either Shift key is held. */
export const BOOST_FACTOR = 3;
/** Radians of turn per pixel of mouse drag. */
export const LOOK_SENSITIVITY = 0.003;

// Same limit the library's free-camera controls use: pitch stays 0.01 away from +-pi/2.
const PITCH_LIMIT = Math.PI / 2 - 0.01;
// Ignore long gaps (tab in background, breakpoint) so the camera does not jump.
const MAX_STEP_SECONDS = 0.1;

const MOVE_CODES = new Set([
    "KeyW", "KeyA", "KeyS", "KeyD",
    "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight",
    "Space", "PageDown",
]);
const SHIFT_CODES = new Set(["ShiftLeft", "ShiftRight"]);

type FrameHook = (...args: unknown[]) => void;

/**
 * Keyboard and mouse fly controls for a FreeCamera.
 *
 * W/A/S/D or arrows move along the view direction, dragging with the mouse looks around,
 * Space rises and PageDown sinks (world Y). Shift (left or right) only scales speed by
 * BOOST_FACTOR; it never moves the camera on its own.
 *
 * Returns a disposer that removes every listener from the canvas and takes the per-frame
 * hook out of the scene.
 */
export function attachFlyControls(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    const held = new Set<string>();
    let lookDX = 0;
    let lookDY = 0;
    let dragPointer: number | null = null;
    let lastX = 0;
    let lastY = 0;
    let lastTime: number | null = null;
    let disposed = false;

    // Keyboard events only reach a canvas that can take focus.
    const hadTabIndex = canvas.hasAttribute("tabindex");
    const oldTabIndex = canvas.getAttribute("tabindex");
    if (!hadTabIndex) canvas.tabIndex = 0;

    const onKeyDown = (e: KeyboardEvent): void => {
        // e.code is the physical key, so Shift+W still reports "KeyW".
        if (MOVE_CODES.has(e.code) || SHIFT_CODES.has(e.code)) {
            held.add(e.code);
            if (MOVE_CODES.has(e.code)) e.preventDefault(); // stop Space/PageDown/arrows scrolling the page
        }
    };
    const onKeyUp = (e: KeyboardEvent): void => {
        held.delete(e.code);
    };
    const onBlur = (): void => {
        held.clear();
        lookDX = 0;
        lookDY = 0;
    };
    const onPointerDown = (e: PointerEvent): void => {
        if (dragPointer !== null) return;
        dragPointer = e.pointerId;
        lastX = e.clientX;
        lastY = e.clientY;
        canvas.focus();
        try { canvas.setPointerCapture(e.pointerId); } catch { /* not capturable; drag still works inside the canvas */ }
    };
    const onPointerMove = (e: PointerEvent): void => {
        if (e.pointerId !== dragPointer) return;
        lookDX += e.clientX - lastX;
        lookDY += e.clientY - lastY;
        lastX = e.clientX;
        lastY = e.clientY;
    };
    const onPointerUp = (e: PointerEvent): void => {
        if (e.pointerId !== dragPointer) return;
        dragPointer = null;
        try { canvas.releasePointerCapture(e.pointerId); } catch { /* already released */ }
    };

    canvas.addEventListener("keydown", onKeyDown);
    canvas.addEventListener("keyup", onKeyUp);
    canvas.addEventListener("blur", onBlur);
    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerUp);

    const hook: FrameHook = () => {
        if (disposed) return;
        const now = performance.now();
        const dt = lastTime === null ? 0 : Math.min((now - lastTime) / 1000, MAX_STEP_SECONDS);
        lastTime = now;

        const anyMove = [...held].some((c) => MOVE_CODES.has(c));
        if (!anyMove && lookDX === 0 && lookDY === 0) return;

        const pos = camera.position;
        const tgt = camera.target;

        // Read the view direction back from position/target every frame rather than keeping
        // our own yaw/pitch, so a target set by hand is respected instead of being overwritten.
        let fx = tgt.x - pos.x;
        let fy = tgt.y - pos.y;
        let fz = tgt.z - pos.z;
        const len = Math.hypot(fx, fy, fz) || 1;
        fx /= len; fy /= len; fz /= len;
        let yaw = Math.atan2(fx, fz);
        let pitch = Math.asin(Math.max(-1, Math.min(1, fy)));

        yaw += lookDX * LOOK_SENSITIVITY;
        pitch -= lookDY * LOOK_SENSITIVITY;
        pitch = Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, pitch));
        lookDX = 0;
        lookDY = 0;

        const cp = Math.cos(pitch);
        fx = Math.sin(yaw) * cp;
        fy = Math.sin(pitch);
        fz = Math.cos(yaw) * cp;
        // Left-handed, Y up: right = up x forward.
        const rx = Math.cos(yaw);
        const rz = -Math.sin(yaw);

        let forward = 0;
        let strafe = 0;
        let rise = 0;
        if (held.has("KeyW") || held.has("ArrowUp")) forward += 1;
        if (held.has("KeyS") || held.has("ArrowDown")) forward -= 1;
        if (held.has("KeyD") || held.has("ArrowRight")) strafe += 1;
        if (held.has("KeyA") || held.has("ArrowLeft")) strafe -= 1;
        // Only Space and PageDown change height. Shift is deliberately not in this list.
        if (held.has("Space")) rise += 1;
        if (held.has("PageDown")) rise -= 1;

        const boosted = held.has("ShiftLeft") || held.has("ShiftRight");
        const step = FLY_SPEED * (boosted ? BOOST_FACTOR : 1) * dt;

        const nx = pos.x + (fx * forward + rx * strafe) * step;
        const ny = pos.y + (fy * forward + rise) * step;
        const nz = pos.z + (fz * forward + rz * strafe) * step;

        if (nx !== pos.x || ny !== pos.y || nz !== pos.z) pos.set(nx, ny, nz);
        tgt.set(nx + fx, ny + fy, nz + fz);
    };

    // Camera modules append their hooks at the tail of scene._beforeRender; do the same.
    const hooks = (scene as unknown as { _beforeRender: FrameHook[] })._beforeRender;
    hooks.push(hook);

    return () => {
        if (disposed) return;
        disposed = true;

        canvas.removeEventListener("keydown", onKeyDown);
        canvas.removeEventListener("keyup", onKeyUp);
        canvas.removeEventListener("blur", onBlur);
        canvas.removeEventListener("pointerdown", onPointerDown);
        canvas.removeEventListener("pointermove", onPointerMove);
        canvas.removeEventListener("pointerup", onPointerUp);
        canvas.removeEventListener("pointercancel", onPointerUp);
        if (dragPointer !== null) {
            try { canvas.releasePointerCapture(dragPointer); } catch { /* already released */ }
            dragPointer = null;
        }
        if (!hadTabIndex) canvas.removeAttribute("tabindex");
        else if (oldTabIndex !== null) canvas.setAttribute("tabindex", oldTabIndex);
        held.clear();

        // The scene walks _beforeRender with a live for-of. If this disposer is called from
        // inside a frame hook, splicing now would make the scene skip the hook after ours.
        // So put a no-op in our slot now and take the slot out once the current task is done.
        const i = hooks.indexOf(hook);
        if (i < 0) return;
        const retired: FrameHook = () => {};
        hooks[i] = retired;
        queueMicrotask(() => {
            const j = hooks.indexOf(retired);
            if (j >= 0) hooks.splice(j, 1);
        });
    };
}
