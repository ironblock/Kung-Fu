import type { Camera } from "@babylonjs/lite";
import { getViewMatrix, getViewProjectionMatrix, projectWorldToScreen } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };
export interface ShiftTracker { mark(): void; shift(point: Vec): { dx: number; dy: number } }

type Mat = ReturnType<typeof getViewMatrix>;

// A copy of the camera's view and view-projection matrices. The library caches
// these and overwrites them in place, so the live objects must not be kept.
interface Pose { view: Mat; viewProjection: Mat }

export function trackScreenShift(camera: Camera, canvas: HTMLCanvasElement): ShiftTracker {
    // The camera renders to the whole canvas, so its aspect is the canvas's.
    const capture = (): Pose => {
        const aspect = canvas.width / canvas.height;
        return {
            view: getViewMatrix(camera).slice() as Mat,
            viewProjection: getViewProjectionMatrix(camera, aspect).slice() as Mat,
        };
    };

    // Projection options for the whole canvas; output is in CSS pixels.
    const screenOptions = () => {
        const cssWidth = canvas.clientWidth || canvas.width;
        const cssHeight = canvas.clientHeight || canvas.height;
        return {
            viewport: { x: 0, y: 0, width: canvas.width, height: canvas.height },
            backingWidth: canvas.width,
            backingHeight: canvas.height,
            cssWidth,
            cssHeight,
        };
    };

    let marked: Pose = capture();

    return {
        mark(): void {
            marked = capture();
        },
        shift(point: Vec): { dx: number; dy: number } {
            const now = capture();
            const options = screenOptions();
            const before = projectWorldToScreen(point, marked.view, marked.viewProjection, options);
            const after = projectWorldToScreen(point, now.view, now.viewProjection, options);
            return { dx: after.cssX - before.cssX, dy: after.cssY - before.cssY };
        },
    };
}
