import type { FreeCamera, SceneContext } from "@babylonjs/lite";
import { attachFreeControl } from "@babylonjs/lite";

/** How much farther than the library's default each movement key moves the camera. */
const MOVE_MULTIPLIER = 20;

/**
 * Keys that move the camera through the library's keyboard fly controls:
 * W/A/S/D and the arrows (horizontal), Space/PageUp (rise), ShiftLeft/ShiftRight/PageDown (sink).
 */
const MOVE_KEYS: ReadonlySet<string> = new Set([
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
    "ShiftLeft",
    "ShiftRight",
    "PageDown",
]);

/**
 * Attaches the library's fly controls to the camera, with movement keys scaled up.
 *
 * The library's controls are left untouched (speed, inertia and mouse look are not changed).
 * Each frame, this measures how far the library moved the camera's position since the last
 * frame. While a movement key is held, it adds (MOVE_MULTIPLIER - 1) times that distance to
 * both position and target, so the total key movement is MOVE_MULTIPLIER times the default.
 * Mouse look only changes orientation, so it is not scaled.
 *
 * @returns A function that removes the controls, the key listeners and the per-frame loop.
 */
export function attachBigWorldFly(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    const detachLibraryControls = attachFreeControl(camera, canvas, scene);

    const heldKeys = new Set<string>();
    let movedLastFrame = false;

    const onKeyDown = (event: KeyboardEvent): void => {
        if (MOVE_KEYS.has(event.code)) {
            heldKeys.add(event.code);
        }
    };
    const onKeyUp = (event: KeyboardEvent): void => {
        heldKeys.delete(event.code);
    };
    const onBlur = (): void => {
        heldKeys.clear();
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);

    const position = camera.position;
    const target = camera.target;
    let lastX = position.x;
    let lastY = position.y;
    let lastZ = position.z;
    let frameHandle = 0;

    const tick = (): void => {
        frameHandle = requestAnimationFrame(tick);

        const dx = position.x - lastX;
        const dy = position.y - lastY;
        const dz = position.z - lastZ;

        const keyActive = heldKeys.size > 0;
        // Include the previous frame so the last step of a key press is still scaled.
        const scale = keyActive || movedLastFrame;
        movedLastFrame = keyActive;

        if (scale && (dx !== 0 || dy !== 0 || dz !== 0)) {
            const extra = MOVE_MULTIPLIER - 1;
            const ex = dx * extra;
            const ey = dy * extra;
            const ez = dz * extra;
            position.x += ex;
            position.y += ey;
            position.z += ez;
            target.x += ex;
            target.y += ey;
            target.z += ez;
        }

        lastX = position.x;
        lastY = position.y;
        lastZ = position.z;
    };
    frameHandle = requestAnimationFrame(tick);

    return () => {
        cancelAnimationFrame(frameHandle);
        window.removeEventListener("keydown", onKeyDown);
        window.removeEventListener("keyup", onKeyUp);
        window.removeEventListener("blur", onBlur);
        heldKeys.clear();
        detachLibraryControls();
    };
}
