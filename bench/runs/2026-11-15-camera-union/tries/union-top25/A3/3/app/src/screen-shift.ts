import type { Camera } from "@babylonjs/lite";
import {
    getEffectiveAspectRatio,
    getViewMatrix,
    getViewProjectionMatrix,
    projectWorldToScreen,
} from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };
export interface ShiftTracker { mark(): void; shift(point: Vec): { dx: number; dy: number } }

type Mat = ReturnType<typeof getViewMatrix>;

interface Pose {
    view: Mat;
    viewProjection: Mat;
    backingWidth: number;
    backingHeight: number;
    cssWidth: number;
    cssHeight: number;
}

// Projects a world point to CSS pixels with the pose's matrices and the canvas
// size that was current when the pose was read.
function projectCss(point: Vec, pose: Pose): { x: number; y: number } {
    const result = projectWorldToScreen(point, pose.view, pose.viewProjection, {
        viewport: { x: 0, y: 0, width: pose.backingWidth, height: pose.backingHeight },
        backingWidth: pose.backingWidth,
        backingHeight: pose.backingHeight,
        cssWidth: pose.cssWidth,
        cssHeight: pose.cssHeight,
    });
    return { x: result.cssX, y: result.cssY };
}

export function trackScreenShift(camera: Camera, canvas: HTMLCanvasElement): ShiftTracker {
    let marked: Pose = readPose(true);

    // The library may hand out cached matrices that are overwritten in place,
    // so a stored pose keeps its own copies.
    function readPose(copy: boolean): Pose {
        const backingWidth = canvas.width;
        const backingHeight = canvas.height;
        const aspect = getEffectiveAspectRatio(camera, backingWidth, backingHeight);
        const view = getViewMatrix(camera);
        const viewProjection = getViewProjectionMatrix(camera, aspect);
        return {
            view: copy ? structuredClone(view) : view,
            viewProjection: copy ? structuredClone(viewProjection) : viewProjection,
            backingWidth,
            backingHeight,
            cssWidth: canvas.clientWidth,
            cssHeight: canvas.clientHeight,
        };
    }

    return {
        mark(): void {
            marked = readPose(true);
        },
        shift(point: Vec): { dx: number; dy: number } {
            const before = projectCss(point, marked);
            const after = projectCss(point, readPose(false));
            return { dx: after.x - before.x, dy: after.y - before.y };
        },
    };
}
