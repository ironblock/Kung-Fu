import { attachFreeControl } from "@babylonjs/lite";
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

/**
 * How much farther the camera moves per frame, while a movement key is held,
 * compared with the library's default fly controls.
 */
const KEY_MOVE_MULTIPLIER = 20;

/**
 * Key codes (KeyboardEvent.code) that move the camera: W/A/S/D, the arrows,
 * the keys that rise (Space, PageUp) and the keys that sink (Shift, PageDown).
 */
const MOVE_KEY_CODES = new Set<string>([
    "KeyW",
    "KeyA",
    "KeyS",
    "KeyD",
    "ArrowUp",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "Space",
    "PageUp",
    "PageDown",
    "ShiftLeft",
    "ShiftRight",
]);

/**
 * Attaches the library's free fly controls (keyboard and mouse look) to the camera,
 * with movement keys boosted by KEY_MOVE_MULTIPLIER.
 *
 * Mouse look and the library's own movement are not changed: the library's
 * controls run exactly as they do by default, and this function only adds
 * the extra movement on top, one frame at a time.
 *
 * Returns a function that removes every listener and stops the per-frame work.
 */
export function attachBigWorldFly(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    const heldMoveKeys = new Set<string>();

    const onKeyDown = (event: KeyboardEvent): void => {
        if (MOVE_KEY_CODES.has(event.code)) {
            heldMoveKeys.add(event.code);
        }
    };
    const onKeyUp = (event: KeyboardEvent): void => {
        heldMoveKeys.delete(event.code);
    };
    const onBlur = (): void => {
        // Key-up events are lost when the window loses focus; forget held keys.
        heldMoveKeys.clear();
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);

    // The library's own controls: they move the camera by their default amounts and
    // handle mouse look. We do not change their speed, because the library also uses
    // the speed for the turn-snap threshold, so changing it would change mouse look.
    const detachLibraryControls = attachFreeControl(camera, canvas, scene);

    // Position as we last left it after our own adjustment. The next frame's
    // difference from this value is the movement the library made in between.
    let lastX = camera.position.x;
    let lastY = camera.position.y;
    let lastZ = camera.position.z;

    let running = true;
    let frameHandle = 0;

    const tick = (): void => {
        if (!running) {
            return;
        }

        const position = camera.position;
        const dx = position.x - lastX;
        const dy = position.y - lastY;
        const dz = position.z - lastZ;

        if (heldMoveKeys.size > 0 && (dx !== 0 || dy !== 0 || dz !== 0)) {
            // Add the other (MULTIPLIER - 1) parts of the library's movement this frame,
            // so the total movement is MULTIPLIER times the library's movement.
            const extra = KEY_MOVE_MULTIPLIER - 1;
            const ex = dx * extra;
            const ey = dy * extra;
            const ez = dz * extra;

            // Move the target by the same amount so the view direction does not change.
            const target = camera.target;
            target.set(target.x + ex, target.y + ey, target.z + ez);
            position.set(position.x + ex, position.y + ey, position.z + ez);
        }

        lastX = position.x;
        lastY = position.y;
        lastZ = position.z;

        frameHandle = requestAnimationFrame(tick);
    };

    frameHandle = requestAnimationFrame(tick);

    let disposed = false;
    return () => {
        if (disposed) {
            return;
        }
        disposed = true;

        running = false;
        cancelAnimationFrame(frameHandle);

        window.removeEventListener("keydown", onKeyDown);
        window.removeEventListener("keyup", onKeyUp);
        window.removeEventListener("blur", onBlur);
        heldMoveKeys.clear();

        detachLibraryControls();
    };
}
