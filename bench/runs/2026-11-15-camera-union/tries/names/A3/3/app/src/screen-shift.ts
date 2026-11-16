import type { Camera } from "@babylonjs/lite";
import {
    getViewMatrix,
    getViewProjectionMatrix,
    getEffectiveAspectRatio,
    resolveCameraViewport,
    projectWorldToScreen,
} from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };
export interface ShiftTracker { mark(): void; shift(point: Vec): { dx: number; dy: number } }

type Mat = ReturnType<typeof getViewMatrix>;

// A copy of the camera's view and view-projection at one moment. The library may
// hand out cached storage that is overwritten later, so the matrices are copied.
interface ViewState { view: Mat; viewProjection: Mat }

export function trackScreenShift(camera: Camera, canvas: HTMLCanvasElement): ShiftTracker {
    const capture = (): ViewState => {
        const aspect = getEffectiveAspectRatio(camera, canvas.width, canvas.height);
        const view = getViewMatrix(camera).slice() as Mat;
        const viewProjection = getViewProjectionMatrix(camera, aspect).slice() as Mat;
        return { view, viewProjection };
    };

    const project = (point: Vec, state: ViewState) => {
        const viewport = resolveCameraViewport(camera, canvas.width, canvas.height);
        return projectWorldToScreen(point, state.view, state.viewProjection, {
            viewport,
            backingWidth: canvas.width,
            backingHeight: canvas.height,
            cssWidth: canvas.clientWidth,
            cssHeight: canvas.clientHeight,
        });
    };

    let marked: ViewState | null = null;

    const tracker: ShiftTracker = {
        mark() {
            marked = capture();
        },
        shift(point) {
            if (!marked) marked = capture();
            const before = project(point, marked);
            const now = project(point, capture());
            return { dx: now.cssX - before.cssX, dy: now.cssY - before.cssY };
        },
    };

    tracker.mark();
    return tracker;
}
