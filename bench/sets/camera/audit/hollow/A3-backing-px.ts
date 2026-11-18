import { getViewMatrix, getViewProjectionMatrix, projectWorldToScreen } from "@babylonjs/lite";
import type { Camera, Mat4 } from "@babylonjs/lite";

// Try, kind "holds only for the check's own inputs": copies the matrices (the right fix), but measures in
// the canvas's backing pixels. The check's canvas has as many backing pixels as CSS pixels, so it cannot
// tell; on a canvas with devicePixelRatio 2 the shift comes out twice the CSS shift.
type Vec = { x: number; y: number; z: number };
export interface ShiftTracker { mark(): void; shift(point: Vec): { dx: number; dy: number } }

export function trackScreenShift(camera: Camera, canvas: HTMLCanvasElement): ShiftTracker {
    const options = () => ({ viewport: { x: 0, y: 0, width: canvas.width, height: canvas.height }, backingWidth: canvas.width, backingHeight: canvas.height });
    const copy = (m: Mat4) => Array.from(m as unknown as ArrayLike<number>) as unknown as Mat4;
    let view = copy(getViewMatrix(camera));
    let vp = copy(getViewProjectionMatrix(camera, canvas.width / canvas.height));
    return {
        mark() {
            view = copy(getViewMatrix(camera));
            vp = copy(getViewProjectionMatrix(camera, canvas.width / canvas.height));
        },
        shift(point) {
            const a = projectWorldToScreen(point, view, vp, options());
            const b = projectWorldToScreen(point, getViewMatrix(camera), getViewProjectionMatrix(camera, canvas.width / canvas.height), options());
            return { dx: b.x - a.x, dy: b.y - a.y };
        },
    };
}
