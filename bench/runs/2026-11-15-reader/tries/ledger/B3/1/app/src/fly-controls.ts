import type { FreeCamera, SceneContext } from "@babylonjs/lite";

/** Speed multiplier while either Shift key is held. Shift is a speed key only and never moves the camera. */
const SHIFT_SPEED_FACTOR = 3;

const MAX_PITCH = Math.PI / 2 - 0.01;

/** Key codes this controller reads. Other keys are left alone. */
const MOVE_CODES = new Set<string>([
    "KeyW",
    "KeyA",
    "KeyS",
    "KeyD",
    "ArrowUp",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "Space",
    "PageDown",
    "ShiftLeft",
    "ShiftRight",
]);

/**
 * Attach fly-through controls to a FreeCamera on the given canvas.
 *
 * - W/A/S/D or arrow keys: move forward, back, left, right.
 * - Space: rise. PageDown: sink.
 * - Drag with a mouse button on the canvas: look around.
 * - Holding Shift (left or right): move three times as fast. Shift alone never moves the camera.
 *
 * Motion runs in a per-frame hook on the scene, so the scene argument is required.
 *
 * The returned function removes the canvas listeners and the frame hook. Call it between frames,
 * not from inside another frame callback: the scene walks its hook list with for-of, so removing a
 * hook that runs earlier than the current one can skip the next hook for that frame.
 */
export function attachFlyControls(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    // Camera-local accumulators, decayed by camera.inertia each frame (same model as the library's free camera).
    let cdX = 0;
    let cdY = 0;
    let cdZ = 0;
    let crX = 0;
    let crY = 0;

    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    const keys = new Set<string>();

    const addedTabIndex = !canvas.hasAttribute("tabindex");
    if (addedTabIndex) {
        canvas.tabIndex = 0;
    }

    // ─── Mouse ───────────────────────────────────────────────────────────
    function onPointerDown(e: PointerEvent): void {
        if (e.button < 0 || e.button > 2) {
            return;
        }
        canvas.setPointerCapture(e.pointerId);
        dragging = true;
        lastX = e.clientX;
        lastY = e.clientY;
    }

    function onPointerMove(e: PointerEvent): void {
        if (!dragging) {
            return;
        }
        crY += (e.clientX - lastX) / camera.angularSensitivity;
        crX += (e.clientY - lastY) / camera.angularSensitivity;
        lastX = e.clientX;
        lastY = e.clientY;
    }

    function onPointerUp(e: PointerEvent): void {
        if (canvas.hasPointerCapture(e.pointerId)) {
            canvas.releasePointerCapture(e.pointerId);
        }
        dragging = false;
    }

    function onContextMenu(e: Event): void {
        e.preventDefault();
    }

    // ─── Keyboard ────────────────────────────────────────────────────────
    function onKeyDown(e: KeyboardEvent): void {
        if (!MOVE_CODES.has(e.code)) {
            return;
        }
        keys.add(e.code);
        e.preventDefault();
    }

    function onKeyUp(e: KeyboardEvent): void {
        keys.delete(e.code);
    }

    // Losing focus can swallow the keyup, which would leave a key stuck down.
    function onBlur(): void {
        keys.clear();
        dragging = false;
    }

    // ─── Per-frame update (deltaMs from the scene loop) ──────────────────
    function update(deltaMs: number): void {
        const dt = Math.max(deltaMs, 1);
        const step = camera.speed * Math.sqrt((dt * dt) / 100000);
        const shift = keys.has("ShiftLeft") || keys.has("ShiftRight");
        const moveSpeed = shift ? step * SHIFT_SPEED_FACTOR : step;

        if (keys.has("KeyW") || keys.has("ArrowUp")) {
            cdZ += moveSpeed;
        }
        if (keys.has("KeyS") || keys.has("ArrowDown")) {
            cdZ -= moveSpeed;
        }
        if (keys.has("KeyA") || keys.has("ArrowLeft")) {
            cdX -= moveSpeed;
        }
        if (keys.has("KeyD") || keys.has("ArrowRight")) {
            cdX += moveSpeed;
        }
        if (keys.has("Space")) {
            cdY += moveSpeed;
        }
        if (keys.has("PageDown")) {
            cdY -= moveSpeed;
        }

        const hasMovement = cdX !== 0 || cdY !== 0 || cdZ !== 0;
        const hasRotation = crX !== 0 || crY !== 0;

        // Left-handed convention, as in the library's free camera.
        if (hasRotation) {
            camera._yaw += crY;
            camera._pitch = Math.max(-MAX_PITCH, Math.min(MAX_PITCH, camera._pitch - crX));
        }

        if (hasMovement) {
            const cosY = Math.cos(camera._yaw);
            const sinY = Math.sin(camera._yaw);
            const cosP = Math.cos(camera._pitch);
            const sinP = Math.sin(camera._pitch);
            camera.position.x += sinY * cosP * cdZ + cosY * cdX;
            camera.position.y += sinP * cdZ + cdY;
            camera.position.z += cosY * cosP * cdZ - sinY * cdX;
        }

        if (hasMovement || hasRotation) {
            const cosY = Math.cos(camera._yaw);
            const sinY = Math.sin(camera._yaw);
            const cosP = Math.cos(camera._pitch);
            camera.target.set(camera.position.x + sinY * cosP, camera.position.y + Math.sin(camera._pitch), camera.position.z + cosY * cosP);
        }

        const inertia = camera.inertia;
        const moveEpsilon = camera.speed * 0.001;
        cdX *= inertia;
        cdY *= inertia;
        cdZ *= inertia;
        crX *= inertia;
        crY *= inertia;
        if (Math.abs(cdX) < moveEpsilon) {
            cdX = 0;
        }
        if (Math.abs(cdY) < moveEpsilon) {
            cdY = 0;
        }
        if (Math.abs(cdZ) < moveEpsilon) {
            cdZ = 0;
        }
        if (Math.abs(crX) < moveEpsilon) {
            crX = 0;
        }
        if (Math.abs(crY) < moveEpsilon) {
            crY = 0;
        }
    }

    // ─── Register ────────────────────────────────────────────────────────
    scene._beforeRender.push(update);
    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerUp);
    canvas.addEventListener("contextmenu", onContextMenu);
    canvas.addEventListener("keydown", onKeyDown);
    canvas.addEventListener("keyup", onKeyUp);
    canvas.addEventListener("blur", onBlur);

    let detached = false;
    return function detachFlyControls(): void {
        if (detached) {
            return;
        }
        detached = true;
        const idx = scene._beforeRender.indexOf(update);
        if (idx >= 0) {
            scene._beforeRender.splice(idx, 1);
        }
        canvas.removeEventListener("pointerdown", onPointerDown);
        canvas.removeEventListener("pointermove", onPointerMove);
        canvas.removeEventListener("pointerup", onPointerUp);
        canvas.removeEventListener("pointercancel", onPointerUp);
        canvas.removeEventListener("contextmenu", onContextMenu);
        canvas.removeEventListener("keydown", onKeyDown);
        canvas.removeEventListener("keyup", onKeyUp);
        canvas.removeEventListener("blur", onBlur);
        keys.clear();
        dragging = false;
        if (addedTabIndex) {
            canvas.removeAttribute("tabindex");
        }
    };
}
