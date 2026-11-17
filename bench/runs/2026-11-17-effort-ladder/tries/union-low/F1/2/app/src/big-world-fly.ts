import type { FreeCamera, SceneContext } from "@babylonjs/lite";

const SPEED_MULTIPLIER = 20;

const MOVE_KEYS = new Set([
    "KeyW", "KeyA", "KeyS", "KeyD",
    "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight",
    "Space", "PageUp", "PageDown",
    "ShiftLeft", "ShiftRight",
]);

export function attachBigWorldFly(
    camera: FreeCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
): () => void {
    let disposed = false;

    const heldKeys = new Set<string>();
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let yawVel = 0;
    let pitchVel = 0;
    let mvX = 0;
    let mvY = 0;
    let mvZ = 0;
    let lastTime = performance.now();

    if (!canvas.hasAttribute("tabindex")) {
        canvas.setAttribute("tabindex", "0");
    }

    // --- Keyboard ---
    const onKeyDown = (e: KeyboardEvent) => {
        if (disposed) return;
        if (MOVE_KEYS.has(e.code)) {
            heldKeys.add(e.code);
            e.preventDefault();
        }
    };

    const onKeyUp = (e: KeyboardEvent) => {
        if (disposed) return;
        heldKeys.delete(e.code);
    };

    const onBlur = () => {
        heldKeys.clear();
    };

    // --- Pointer (mouse look) ---
    const onPointerDown = (e: PointerEvent) => {
        if (disposed) return;
        if (e.button === 0 || e.button === 1 || e.button === 2) {
            dragging = true;
            lastX = e.clientX;
            lastY = e.clientY;
            canvas.setPointerCapture(e.pointerId);
        }
    };

    const onPointerMove = (e: PointerEvent) => {
        if (disposed || !dragging) return;
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        lastX = e.clientX;
        lastY = e.clientY;
        yawVel += dx / camera.angularSensitivity;
        pitchVel -= dy / camera.angularSensitivity;
    };

    const onPointerUp = (e: PointerEvent) => {
        if (disposed) return;
        dragging = false;
        if (canvas.hasPointerCapture(e.pointerId)) {
            canvas.releasePointerCapture(e.pointerId);
        }
    };

    canvas.addEventListener("keydown", onKeyDown);
    canvas.addEventListener("keyup", onKeyUp);
    canvas.addEventListener("blur", onBlur);
    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerUp);

    // --- Per-frame step ---
    const onFrame = () => {
        if (disposed) return;

        const now = performance.now();
        const deltaMs = Math.max(now - lastTime, 1);
        lastTime = now;

        // Look: apply velocity, clamp, decay, stop below threshold
        camera._yaw += yawVel;
        camera._pitch += pitchVel;

        const maxPitch = Math.PI / 2 - 0.01;
        if (camera._pitch > maxPitch) camera._pitch = maxPitch;
        if (camera._pitch < -maxPitch) camera._pitch = -maxPitch;

        yawVel *= camera.inertia;
        pitchVel *= camera.inertia;

        const threshold = camera.speed * 0.001;
        if (Math.abs(yawVel) < threshold && Math.abs(pitchVel) < threshold) {
            yawVel = 0;
            pitchVel = 0;
        }

        // Direction from yaw/pitch (yaw 0 = +Z)
        const cosP = Math.cos(camera._pitch);
        const dirX = Math.sin(camera._yaw) * cosP;
        const dirY = Math.sin(camera._pitch);
        const dirZ = Math.cos(camera._yaw) * cosP;

        // Rebuild target 1 unit ahead
        camera.target.x = camera.position.x + dirX;
        camera.target.y = camera.position.y + dirY;
        camera.target.z = camera.position.z + dirZ;

        // Keyboard movement at 20× speed
        const speed = camera.speed * SPEED_MULTIPLIER;
        const step = (speed * deltaMs) / Math.sqrt(100000);

        let mx = 0;
        let my = 0;
        let mz = 0;

        if (heldKeys.has("KeyW") || heldKeys.has("ArrowUp")) {
            mx += dirX; my += dirY; mz += dirZ;
        }
        if (heldKeys.has("KeyS") || heldKeys.has("ArrowDown")) {
            mx -= dirX; my -= dirY; mz -= dirZ;
        }

        // Right vector = up × forward = (fz, 0, −fx)
        const rX = dirZ;
        const rZ = -dirX;

        if (heldKeys.has("KeyD") || heldKeys.has("ArrowRight")) {
            mx += rX; mz += rZ;
        }
        if (heldKeys.has("KeyA") || heldKeys.has("ArrowLeft")) {
            mx -= rX; mz -= rZ;
        }

        if (heldKeys.has("Space") || heldKeys.has("PageUp")) {
            my += 1;
        }
        if (heldKeys.has("ShiftLeft") || heldKeys.has("ShiftRight") || heldKeys.has("PageDown")) {
            my -= 1;
        }

        const len = Math.sqrt(mx * mx + my * my + mz * mz);
        if (len > 0) {
            mx /= len; my /= len; mz /= len;
        }

        mvX += mx * step;
        mvY += my * step;
        mvZ += mz * step;

        // Translate both position and target so the view direction is preserved
        camera.position.x += mvX;
        camera.position.y += mvY;
        camera.position.z += mvZ;
        camera.target.x += mvX;
        camera.target.y += mvY;
        camera.target.z += mvZ;

        // Decay movement velocity
        mvX *= camera.inertia;
        mvY *= camera.inertia;
        mvZ *= camera.inertia;
    };

    const disposeFrame = scene._beforeRender.add(onFrame);

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
        disposeFrame();
    };
}
