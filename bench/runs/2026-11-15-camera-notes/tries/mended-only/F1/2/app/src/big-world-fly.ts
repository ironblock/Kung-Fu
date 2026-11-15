import { Vector3, attachFreeControl } from "@babylonjs/lite";
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

/** How much farther the camera moves than the library's default fly controls. */
const MOVE_FACTOR = 20;

/**
 * Gives `camera` the library's keyboard and mouse fly controls on `canvas`,
 * but with every movement (WASD, arrows, rise/sink keys) scaled by MOVE_FACTOR.
 *
 * The library's own controls are used unchanged, so mouse look is untouched.
 * Movement is scaled by sampling how far the library moved the camera's
 * position each frame and applying MOVE_FACTOR times that displacement.
 * The library's movement is only ever translation, so this does not affect
 * orientation, and the speed setting is not changed (look inertia depends on it).
 *
 * Caveat: any position change made by the application between frames is also
 * scaled, since it cannot be told apart from the library's movement.
 *
 * Returns a function that stops the sampling loop and removes the library's
 * controls (and their canvas listeners).
 */
export function attachBigWorldFly(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    const detachLibraryControls = attachFreeControl(camera, canvas, scene);

    let last = { x: camera.position.x, y: camera.position.y, z: camera.position.z };
    let frameId = 0;

    const tick = (): void => {
        const p = camera.position;
        const dx = p.x - last.x;
        const dy = p.y - last.y;
        const dz = p.z - last.z;

        if (dx !== 0 || dy !== 0 || dz !== 0) {
            const next = new Vector3(
                last.x + dx * MOVE_FACTOR,
                last.y + dy * MOVE_FACTOR,
                last.z + dz * MOVE_FACTOR,
            );
            camera.position = next;
            last = { x: next.x, y: next.y, z: next.z };
        } else {
            last = { x: p.x, y: p.y, z: p.z };
        }

        frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);

    return () => {
        cancelAnimationFrame(frameId);
        detachLibraryControls();
    };
}
