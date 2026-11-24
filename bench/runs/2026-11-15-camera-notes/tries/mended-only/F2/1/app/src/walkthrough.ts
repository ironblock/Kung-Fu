import { createFreeCamera } from "@babylonjs/lite";
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface Walkthrough {
    readonly camera: FreeCamera;
    jumpTo(eye: Vec, target: Vec): void;
    dispose(): void;
}

// Radians turned per dragged pixel (close to the library's default angular sensitivity of 1000).
const RADIANS_PER_PIXEL = 1 / 1000;
// World units walked per millisecond (the library's default free-camera speed, 2 / sqrt(100000)).
const UNITS_PER_MS = 2 / Math.sqrt(100000);
// Same pitch limit the library uses for free cameras.
const PITCH_LIMIT = Math.PI / 2 - 0.01;
// Longest frame step used for movement, so a stalled tab does not launch the camera.
const MAX_STEP_MS = 100;

const FORWARD_KEYS = ["KeyW", "ArrowUp"];
const BACK_KEYS = ["KeyS", "ArrowDown"];
const LEFT_KEYS = ["KeyA", "ArrowLeft"];
const RIGHT_KEYS = ["KeyD", "ArrowRight"];
const UP_KEYS = ["Space"];
const HANDLED_KEYS = new Set([...FORWARD_KEYS, ...BACK_KEYS, ...LEFT_KEYS, ...RIGHT_KEYS, ...UP_KEYS]);

/**
 * Walkthrough controls.
 *
 * The view is kept here as yaw and pitch rather than read back from the camera. The library's
 * attachFreeControl rebuilds the target from the yaw and pitch it captured at creation, so a target
 * written later would be overwritten on the first key press. Driving the camera directly avoids that.
 *
 * Yaw 0 looks along +Z; the forward direction is (sin yaw cos pitch, sin pitch, cos yaw cos pitch).
 */
export function createWalkthrough(canvas: HTMLCanvasElement, scene: SceneContext, eye: Vec, target: Vec): Walkthrough {
    const camera = createFreeCamera("walkthrough", { x: eye.x, y: eye.y, z: eye.z }, scene);
    scene.camera = camera;

    let yaw = 0;
    let pitch = 0;
    const held = new Set<string>();
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let rafId = 0;
    let lastTime: number | undefined;

    function aimAt(from: Vec, to: Vec): void {
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const dz = to.z - from.z;
        const len = Math.hypot(dx, dy, dz);
        if (len === 0) {
            return;
        }
        yaw = Math.atan2(dx, dz);
        pitch = Math.asin(dy / len);
    }

    function forwardDir(): Vec {
        const cp = Math.cos(pitch);
        return { x: Math.sin(yaw) * cp, y: Math.sin(pitch), z: Math.cos(yaw) * cp };
    }

    function writeTarget(): void {
        const p = camera.position;
        const f = forwardDir();
        const t = camera.target;
        t.x = p.x + f.x;
        t.y = p.y + f.y;
        t.z = p.z + f.z;
    }

    function setView(e: Vec, t: Vec): void {
        const p = camera.position;
        p.x = e.x;
        p.y = e.y;
        p.z = e.z;
        aimAt(e, t);
        writeTarget();
    }

    function axis(keys: string[]): number {
        return keys.some((k) => held.has(k)) ? 1 : 0;
    }

    function step(ms: number): void {
        const forwardAmount = axis(FORWARD_KEYS) - axis(BACK_KEYS);
        const strafeAmount = axis(RIGHT_KEYS) - axis(LEFT_KEYS);
        const upAmount = axis(UP_KEYS);
        if (forwardAmount !== 0 || strafeAmount !== 0 || upAmount !== 0) {
            const d = UNITS_PER_MS * ms;
            const f = forwardDir();
            // Horizontal right vector for this yaw.
            const rx = Math.cos(yaw);
            const rz = -Math.sin(yaw);
            const p = camera.position;
            p.x += (f.x * forwardAmount + rx * strafeAmount) * d;
            p.y += (f.y * forwardAmount + upAmount) * d;
            p.z += (f.z * forwardAmount + rz * strafeAmount) * d;
        }
        writeTarget();
    }

    function frame(now: number): void {
        const ms = lastTime === undefined ? 16 : Math.min(Math.max(now - lastTime, 1), MAX_STEP_MS);
        lastTime = now;
        step(ms);
        rafId = requestAnimationFrame(frame);
    }

    function onPointerDown(e: PointerEvent): void {
        if (e.button !== 0 && e.button !== 1) {
            return;
        }
        dragging = true;
        lastX = e.clientX;
        lastY = e.clientY;
        canvas.setPointerCapture?.(e.pointerId);
    }

    function onPointerMove(e: PointerEvent): void {
        if (!dragging) {
            return;
        }
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        lastX = e.clientX;
        lastY = e.clientY;
        yaw += dx * RADIANS_PER_PIXEL;
        // Dragging down lowers the pitch, as the library's free camera does.
        pitch = Math.min(PITCH_LIMIT, Math.max(-PITCH_LIMIT, pitch - dy * RADIANS_PER_PIXEL));
    }

    function onPointerUp(e: PointerEvent): void {
        dragging = false;
        canvas.releasePointerCapture?.(e.pointerId);
    }

    function onMouseDown(e: MouseEvent): void {
        // Stop middle-click autoscroll while dragging.
        if (e.button === 1) {
            e.preventDefault();
        }
    }

    function onKeyDown(e: KeyboardEvent): void {
        if (HANDLED_KEYS.has(e.code)) {
            held.add(e.code);
            e.preventDefault();
        }
    }

    function onKeyUp(e: KeyboardEvent): void {
        held.delete(e.code);
    }

    function onBlur(): void {
        held.clear();
        dragging = false;
    }

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerUp);
    canvas.addEventListener("mousedown", onMouseDown);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);

    setView(eye, target);
    rafId = requestAnimationFrame(frame);

    return {
        camera,
        jumpTo(newEye: Vec, newTarget: Vec): void {
            setView(newEye, newTarget);
        },
        dispose(): void {
            cancelAnimationFrame(rafId);
            canvas.removeEventListener("pointerdown", onPointerDown);
            canvas.removeEventListener("pointermove", onPointerMove);
            canvas.removeEventListener("pointerup", onPointerUp);
            canvas.removeEventListener("pointercancel", onPointerUp);
            canvas.removeEventListener("mousedown", onMouseDown);
            window.removeEventListener("keydown", onKeyDown);
            window.removeEventListener("keyup", onKeyUp);
            window.removeEventListener("blur", onBlur);
            held.clear();
            dragging = false;
        },
    };
}
