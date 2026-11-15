import type { FreeCamera, SceneContext } from "@babylonjs/lite";

// Movement speed in world units per second, before boost.
const BASE_SPEED = 5;
// Multiplier applied while Shift (left or right) is held. Shift never changes
// the vertical direction; it only scales speed.
const BOOST_FACTOR = 3;
// Radians of camera rotation per pixel of mouse movement.
const LOOK_SENSITIVITY = 0.005;
// Keep pitch just short of straight up/down to avoid gimbal flip.
const PITCH_LIMIT = Math.PI / 2 - 0.01;
// Largest frame step we will integrate, so a stalled tab does not teleport the camera.
const MAX_FRAME_SECONDS = 0.1;

// Key codes are matched on KeyboardEvent.code (physical key), not on keyCode.
const FORWARD_CODES = ["KeyW", "ArrowUp"];
const BACK_CODES = ["KeyS", "ArrowDown"];
const LEFT_CODES = ["KeyA", "ArrowLeft"];
const RIGHT_CODES = ["KeyD", "ArrowRight"];
const RISE_CODES = ["Space"];
const SINK_CODES = ["PageDown"];
const BOOST_CODES = ["ShiftLeft", "ShiftRight"];

const CONTROL_CODES = new Set([
    ...FORWARD_CODES,
    ...BACK_CODES,
    ...LEFT_CODES,
    ...RIGHT_CODES,
    ...RISE_CODES,
    ...SINK_CODES,
]);

function isAnyPressed(pressed: Set<string>, codes: readonly string[]): boolean {
    for (const code of codes) {
        if (pressed.has(code)) return true;
    }
    return false;
}

function isTextEntry(target: EventTarget | null): boolean {
    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) return true;
    return target instanceof HTMLElement && target.isContentEditable;
}

/**
 * Attaches keyboard (WASD / arrows / Space / PageDown, Shift to boost) and
 * mouse-drag look controls to `camera`. Returns a function that removes every
 * listener and stops the per-frame update.
 */
export function attachFlyControls(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    void scene; // The per-frame loop is owned here (requestAnimationFrame), so the scene is not needed.

    const pressed = new Set<string>();
    let dragging = false;
    let dragPointerId = -1;
    let lastX = 0;
    let lastY = 0;
    let running = true;
    let frameId = 0;
    let lastTime: number | undefined;

    const onKeyDown = (e: KeyboardEvent): void => {
        if (isTextEntry(e.target)) return;
        if (CONTROL_CODES.has(e.code)) e.preventDefault();
        pressed.add(e.code);
    };

    const onKeyUp = (e: KeyboardEvent): void => {
        pressed.delete(e.code);
    };

    const onWindowBlur = (): void => {
        // Losing focus can swallow keyup events; do not leave keys stuck down.
        pressed.clear();
        dragging = false;
    };

    const onCanvasPointerDown = (e: PointerEvent): void => {
        if (e.button !== 0) return;
        dragging = true;
        dragPointerId = e.pointerId;
        lastX = e.clientX;
        lastY = e.clientY;
    };

    const endDrag = (e: PointerEvent): void => {
        if (e.pointerId !== dragPointerId) return;
        dragging = false;
        dragPointerId = -1;
    };

    const onWindowPointerMove = (e: PointerEvent): void => {
        if (!dragging || e.pointerId !== dragPointerId) return;
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        lastX = e.clientX;
        lastY = e.clientY;

        camera.rotation.y += dx * LOOK_SENSITIVITY;
        const pitch = camera.rotation.x + dy * LOOK_SENSITIVITY;
        camera.rotation.x = Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, pitch));
    };

    const update = (dt: number): void => {
        const forward = (isAnyPressed(pressed, FORWARD_CODES) ? 1 : 0) - (isAnyPressed(pressed, BACK_CODES) ? 1 : 0);
        const strafe = (isAnyPressed(pressed, RIGHT_CODES) ? 1 : 0) - (isAnyPressed(pressed, LEFT_CODES) ? 1 : 0);
        // Vertical comes only from Space / PageDown. Shift is deliberately not part of this.
        const vertical = (isAnyPressed(pressed, RISE_CODES) ? 1 : 0) - (isAnyPressed(pressed, SINK_CODES) ? 1 : 0);
        if (forward === 0 && strafe === 0 && vertical === 0) return;

        const boost = isAnyPressed(pressed, BOOST_CODES) ? BOOST_FACTOR : 1;
        const step = BASE_SPEED * boost * dt;

        const yaw = camera.rotation.y;
        const pitch = camera.rotation.x;
        // Same axis convention as the camera's view matrix: yaw about Y, pitch about X.
        const fx = Math.sin(yaw) * Math.cos(pitch);
        const fy = -Math.sin(pitch);
        const fz = Math.cos(yaw) * Math.cos(pitch);
        const rx = Math.cos(yaw);
        const rz = -Math.sin(yaw);

        camera.position.x += (fx * forward + rx * strafe) * step;
        camera.position.y += (fy * forward + vertical) * step;
        camera.position.z += (fz * forward + rz * strafe) * step;
    };

    const tick = (now: number): void => {
        if (!running) return;
        const dt = lastTime === undefined ? 0 : Math.min((now - lastTime) / 1000, MAX_FRAME_SECONDS);
        lastTime = now;
        update(dt);
        frameId = requestAnimationFrame(tick);
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onWindowBlur);
    window.addEventListener("pointermove", onWindowPointerMove);
    window.addEventListener("pointerup", endDrag);
    window.addEventListener("pointercancel", endDrag);
    canvas.addEventListener("pointerdown", onCanvasPointerDown);
    frameId = requestAnimationFrame(tick);

    return (): void => {
        running = false;
        cancelAnimationFrame(frameId);
        window.removeEventListener("keydown", onKeyDown);
        window.removeEventListener("keyup", onKeyUp);
        window.removeEventListener("blur", onWindowBlur);
        window.removeEventListener("pointermove", onWindowPointerMove);
        window.removeEventListener("pointerup", endDrag);
        window.removeEventListener("pointercancel", endDrag);
        canvas.removeEventListener("pointerdown", onCanvasPointerDown);
        pressed.clear();
        dragging = false;
    };
}
