import type { FreeCamera, SceneContext } from "@babylonjs/lite";

/** Base fly speed in world units per second. */
const MOVE_SPEED = 5;
/** Multiplier applied while Shift (left or right) is held. */
const BOOST_FACTOR = 3;
/** Radians of camera rotation per pixel of mouse drag. */
const LOOK_SENSITIVITY = 0.003;
/** Keep pitch just short of straight up/down to avoid gimbal flip. */
const PITCH_LIMIT = Math.PI / 2 - 0.01;
/** Clamp the per-frame time step so a stalled tab does not teleport the camera. */
const MAX_FRAME_SECONDS = 0.1;

const FORWARD_CODES = ["KeyW", "ArrowUp"];
const BACK_CODES = ["KeyS", "ArrowDown"];
const LEFT_CODES = ["KeyA", "ArrowLeft"];
const RIGHT_CODES = ["KeyD", "ArrowRight"];
const UP_CODES = ["Space"];
const DOWN_CODES = ["PageDown"];
const SHIFT_CODES = ["ShiftLeft", "ShiftRight"];

const MOVEMENT_CODES = new Set<string>([
    ...FORWARD_CODES,
    ...BACK_CODES,
    ...LEFT_CODES,
    ...RIGHT_CODES,
    ...UP_CODES,
    ...DOWN_CODES,
]);

/**
 * Attaches keyboard and mouse fly controls to a free camera.
 *
 * - W/A/S/D or arrow keys: move forward/left/back/right (W/S follow the view direction).
 * - Mouse drag on the canvas: look around.
 * - Space: rise. PageDown: sink.
 * - Shift (either side): three times the speed. Shift never moves the camera vertically.
 *
 * Returns a function that removes all listeners and stops the per-frame update.
 */
export function attachFlyControls(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    const pressed = new Set<string>();

    let yaw = camera.rotation.y;
    let pitch = camera.rotation.x;

    let dragging = false;
    let activePointerId = -1;
    let lastX = 0;
    let lastY = 0;

    const onKeyDown = (event: KeyboardEvent): void => {
        if (MOVEMENT_CODES.has(event.code)) {
            pressed.add(event.code);
            event.preventDefault();
        } else if (SHIFT_CODES.includes(event.code)) {
            pressed.add(event.code);
        }
    };

    const onKeyUp = (event: KeyboardEvent): void => {
        pressed.delete(event.code);
    };

    const onBlur = (): void => {
        // Key-up events are missed when focus leaves the window; avoid stuck keys.
        pressed.clear();
        endDrag();
    };

    const onPointerDown = (event: PointerEvent): void => {
        if (dragging) return;
        dragging = true;
        activePointerId = event.pointerId;
        lastX = event.clientX;
        lastY = event.clientY;
        canvas.setPointerCapture(event.pointerId);
    };

    const onPointerMove = (event: PointerEvent): void => {
        if (!dragging || event.pointerId !== activePointerId) return;
        const dx = event.clientX - lastX;
        const dy = event.clientY - lastY;
        lastX = event.clientX;
        lastY = event.clientY;

        yaw += dx * LOOK_SENSITIVITY;
        pitch += dy * LOOK_SENSITIVITY;
        pitch = Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, pitch));

        camera.rotation.x = pitch;
        camera.rotation.y = yaw;
    };

    const onPointerUp = (event: PointerEvent): void => {
        if (event.pointerId !== activePointerId) return;
        endDrag();
    };

    function endDrag(): void {
        if (!dragging) return;
        try {
            canvas.releasePointerCapture(activePointerId);
        } catch {
            // Capture may already be released by the browser.
        }
        dragging = false;
        activePointerId = -1;
    }

    const isAnyPressed = (codes: string[]): boolean => codes.some((code) => pressed.has(code));

    const update = (dt: number): void => {
        // Camera basis for the current look direction (Babylon: left-handed, Y up, yaw about Y).
        const cosPitch = Math.cos(pitch);
        const forward = {
            x: Math.sin(yaw) * cosPitch,
            y: -Math.sin(pitch),
            z: Math.cos(yaw) * cosPitch,
        };
        const right = { x: Math.cos(yaw), y: 0, z: -Math.sin(yaw) };

        const along = (isAnyPressed(FORWARD_CODES) ? 1 : 0) - (isAnyPressed(BACK_CODES) ? 1 : 0);
        const strafe = (isAnyPressed(RIGHT_CODES) ? 1 : 0) - (isAnyPressed(LEFT_CODES) ? 1 : 0);
        // Vertical input comes only from Space/PageDown; Shift is intentionally not read here.
        const vertical = (isAnyPressed(UP_CODES) ? 1 : 0) - (isAnyPressed(DOWN_CODES) ? 1 : 0);

        let dirX = forward.x * along + right.x * strafe;
        let dirY = forward.y * along + vertical;
        let dirZ = forward.z * along + right.z * strafe;

        const length = Math.hypot(dirX, dirY, dirZ);
        if (length < 1e-6) return;
        dirX /= length;
        dirY /= length;
        dirZ /= length;

        const boost = isAnyPressed(SHIFT_CODES) ? BOOST_FACTOR : 1;
        const step = MOVE_SPEED * boost * dt;

        camera.position.x += dirX * step;
        camera.position.y += dirY * step;
        camera.position.z += dirZ * step;
    };

    let frameId = 0;
    let running = true;
    let last = performance.now();

    const tick = (now: number): void => {
        if (!running) return;
        const dt = Math.min((now - last) / 1000, MAX_FRAME_SECONDS);
        last = now;
        update(dt);
        frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerUp);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);

    return (): void => {
        if (!running) return;
        running = false;
        cancelAnimationFrame(frameId);

        canvas.removeEventListener("pointerdown", onPointerDown);
        canvas.removeEventListener("pointermove", onPointerMove);
        canvas.removeEventListener("pointerup", onPointerUp);
        canvas.removeEventListener("pointercancel", onPointerUp);
        window.removeEventListener("keydown", onKeyDown);
        window.removeEventListener("keyup", onKeyUp);
        window.removeEventListener("blur", onBlur);

        endDrag();
        pressed.clear();
    };
}
