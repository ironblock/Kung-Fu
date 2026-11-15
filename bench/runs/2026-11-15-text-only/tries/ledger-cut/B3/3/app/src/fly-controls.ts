import type { FreeCamera, SceneContext } from "@babylonjs/lite";

const BASE_SPEED = 5; // units per second
const BOOST_FACTOR = 3; // Shift multiplies speed by this, nothing else
const LOOK_SENSITIVITY = 0.002; // radians per pointer pixel
const PITCH_LIMIT = Math.PI / 2 - 0.01;
const MAX_STEP_SECONDS = 0.1; // clamp so a stalled tab does not jump the camera

const FORWARD_CODES = new Set(["KeyW", "ArrowUp"]);
const BACK_CODES = new Set(["KeyS", "ArrowDown"]);
const RIGHT_CODES = new Set(["KeyD", "ArrowRight"]);
const LEFT_CODES = new Set(["KeyA", "ArrowLeft"]);
const RISE_CODES = new Set(["Space"]);
const SINK_CODES = new Set(["PageDown"]);
const SHIFT_CODES = new Set(["ShiftLeft", "ShiftRight"]);

const HANDLED_CODES = new Set<string>([
    ...FORWARD_CODES,
    ...BACK_CODES,
    ...RIGHT_CODES,
    ...LEFT_CODES,
    ...RISE_CODES,
    ...SINK_CODES,
]);

/**
 * Attaches keyboard and mouse fly controls to a free camera.
 *
 * W/A/S/D or arrow keys move, drag with the primary mouse button to look,
 * Space rises and PageDown sinks. Holding Shift multiplies speed by three;
 * Shift never contributes to vertical movement.
 *
 * Returns a function that removes every listener and stops the per-frame loop.
 */
export function attachFlyControls(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    void scene; // per-frame work is driven by requestAnimationFrame here; see notes

    const held = new Set<string>();
    let shiftHeld = false;
    let dragging = false;
    let dragPointerId = -1;
    let lastX = 0;
    let lastY = 0;

    let yaw = camera.rotation.y;
    let pitch = clampPitch(camera.rotation.x);

    let frameId = 0;
    let lastTime = 0;
    let attached = true;

    const onKeyDown = (e: KeyboardEvent): void => {
        if (SHIFT_CODES.has(e.code)) {
            shiftHeld = true;
            return;
        }
        if (HANDLED_CODES.has(e.code)) {
            held.add(e.code);
            e.preventDefault();
        }
    };

    const onKeyUp = (e: KeyboardEvent): void => {
        if (SHIFT_CODES.has(e.code)) {
            shiftHeld = false;
            return;
        }
        held.delete(e.code);
    };

    const onBlur = (): void => {
        held.clear();
        shiftHeld = false;
        dragging = false;
    };

    const onPointerDown = (e: PointerEvent): void => {
        if (e.button !== 0) return;
        dragging = true;
        dragPointerId = e.pointerId;
        lastX = e.clientX;
        lastY = e.clientY;
        canvas.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent): void => {
        if (!dragging || e.pointerId !== dragPointerId) return;
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        lastX = e.clientX;
        lastY = e.clientY;
        yaw += dx * LOOK_SENSITIVITY;
        pitch = clampPitch(pitch + dy * LOOK_SENSITIVITY);
    };

    const onPointerUp = (e: PointerEvent): void => {
        if (e.pointerId !== dragPointerId) return;
        dragging = false;
        dragPointerId = -1;
        if (canvas.hasPointerCapture(e.pointerId)) {
            canvas.releasePointerCapture(e.pointerId);
        }
    };

    const tick = (now: number): void => {
        if (!attached) return;
        const dt = lastTime === 0 ? 0 : Math.min((now - lastTime) / 1000, MAX_STEP_SECONDS);
        lastTime = now;

        let forward = 0;
        let strafe = 0;
        let vertical = 0;
        for (const code of held) {
            if (FORWARD_CODES.has(code)) forward += 1;
            else if (BACK_CODES.has(code)) forward -= 1;
            else if (RIGHT_CODES.has(code)) strafe += 1;
            else if (LEFT_CODES.has(code)) strafe -= 1;
            else if (RISE_CODES.has(code)) vertical += 1;
            else if (SINK_CODES.has(code)) vertical -= 1;
        }

        const speed = BASE_SPEED * (shiftHeld ? BOOST_FACTOR : 1) * dt;

        // Left-handed frame: yaw 0 looks along +Z, right is +X. Pitch is positive when looking down.
        const cosPitch = Math.cos(pitch);
        const fx = Math.sin(yaw) * cosPitch;
        const fy = Math.sin(pitch);
        const fz = Math.cos(yaw) * cosPitch;
        const rx = Math.cos(yaw);
        const rz = -Math.sin(yaw);

        const p = camera.position;
        p.x += (fx * forward + rx * strafe) * speed;
        p.y += (fy * forward + vertical) * speed;
        p.z += (fz * forward + rz * strafe) * speed;

        camera.rotation.x = pitch;
        camera.rotation.y = yaw;

        frameId = requestAnimationFrame(tick);
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerUp);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);

    frameId = requestAnimationFrame(tick);

    return () => {
        if (!attached) return;
        attached = false;
        cancelAnimationFrame(frameId);
        canvas.removeEventListener("pointerdown", onPointerDown);
        canvas.removeEventListener("pointermove", onPointerMove);
        canvas.removeEventListener("pointerup", onPointerUp);
        canvas.removeEventListener("pointercancel", onPointerUp);
        window.removeEventListener("keydown", onKeyDown);
        window.removeEventListener("keyup", onKeyUp);
        window.removeEventListener("blur", onBlur);
        held.clear();
        shiftHeld = false;
        dragging = false;
    };
}

function clampPitch(value: number): number {
    return Math.min(PITCH_LIMIT, Math.max(-PITCH_LIMIT, value));
}
