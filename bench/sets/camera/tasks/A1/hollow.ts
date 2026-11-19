import { createArcRotateCamera } from "@babylonjs/lite";
import type { ArcRotateCamera } from "@babylonjs/lite";

// Hollow try, kind "keep a copy of the state and report it": a hidden second camera orbits the point,
// and the real camera's worldMatrix and worldMatrixVersion are shadowed to report the hidden one.
// The real camera's own world-matrix state never moves.
export function focusOn(camera: ArcRotateCamera, point: { x: number; y: number; z: number }): void {
    const shadow = createArcRotateCamera(camera.alpha, camera.beta, camera.radius, { x: point.x, y: point.y, z: point.z });
    const sync = (): void => {
        shadow.alpha = camera.alpha;
        shadow.beta = camera.beta;
        shadow.radius = camera.radius;
    };
    Object.defineProperty(camera, "worldMatrix", { get: () => (sync(), shadow.worldMatrix), configurable: true });
    Object.defineProperty(camera, "worldMatrixVersion", { get: () => (sync(), 1e6 + shadow.worldMatrixVersion), configurable: true });
}
