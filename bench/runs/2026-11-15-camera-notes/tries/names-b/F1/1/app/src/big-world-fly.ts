import type { FreeCamera, SceneContext } from "@babylonjs/lite";
import { attachFreeControl } from "@babylonjs/lite";

/** Movement is multiplied by this factor while any movement key is held. */
const SPEED_MULTIPLIER = 20;

/**
 * Keys that move the camera. W/A/S/D and the arrows are the usual fly keys.
 * The rise/sink keys (Space / ShiftLeft / ShiftRight / KeyQ / KeyE) are a
 * best guess at the library's defaults and must be checked against them.
 */
const MOVEMENT_KEY_CODES: ReadonlySet<string> = new Set([
    "KeyW",
    "KeyA",
    "KeyS",
    "KeyD",
    "ArrowUp",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "Space",
    "ShiftLeft",
    "ShiftRight",
    "KeyQ",
    "KeyE",
]);

/**
 * Attaches the library's free-camera keyboard and mouse controls to `canvas`,
 * with movement keys scaled by SPEED_MULTIPLIER.
 *
 * Only `camera.speed` is changed, and only while a movement key is held.
 * Mouse look is driven by the library's own angular sensitivity, which is not
 * touched, so drag-to-look is unchanged.
 *
 * Returns a function that removes all listeners and restores `camera.speed`.
 */
export function attachBigWorldFly(
    camera: FreeCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
): () => void {
    const baseSpeed = camera.speed;
    const heldKeys = new Set<string>();
    let boosted = false;

    const updateSpeed = (): void => {
        const shouldBoost = heldKeys.size > 0;
        if (shouldBoost === boosted) {
            return;
        }
        boosted = shouldBoost;
        camera.speed = shouldBoost ? baseSpeed * SPEED_MULTIPLIER : baseSpeed;
    };

    const onKeyDown = (event: KeyboardEvent): void => {
        if (!MOVEMENT_KEY_CODES.has(event.code)) {
            return;
        }
        heldKeys.add(event.code);
        updateSpeed();
    };

    const onKeyUp = (event: KeyboardEvent): void => {
        if (heldKeys.delete(event.code)) {
            updateSpeed();
        }
    };

    // If the window loses focus, key-up events are never seen. Clear state so
    // the camera does not stay boosted.
    const onBlur = (): void => {
        heldKeys.clear();
        updateSpeed();
    };

    const detachFreeControl = attachFreeControl(camera, canvas, scene);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);

    return () => {
        window.removeEventListener("keydown", onKeyDown);
        window.removeEventListener("keyup", onKeyUp);
        window.removeEventListener("blur", onBlur);
        detachFreeControl();
        heldKeys.clear();
        camera.speed = baseSpeed;
        boosted = false;
    };
}
