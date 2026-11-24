/**
 * How far the picture of a world-space point has slid across the canvas since a
 * remembered camera view. Used to draw motion trails behind highlighted points.
 */
import {
    getCameraPosition,
    getEffectiveAspectRatio,
    getViewMatrix,
    getViewProjectionMatrix,
    projectWorldToScreen,
    resolveCameraViewport,
} from "@babylonjs/lite";
import type { Camera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface ShiftTracker {
    mark(): void;
    shift(point: Vec): { dx: number; dy: number };
}

// Library types, taken from the functions used here so nothing else needs to be exported.
type Mat4 = ReturnType<typeof getViewMatrix>;
type Vec3 = ReturnType<typeof getCameraPosition>;
type ProjectionOptions = Parameters<typeof projectWorldToScreen>[3];

/** Everything that decides where a world point is drawn on the canvas. */
interface ViewSnapshot {
    view: Mat4;
    viewProjection: Mat4;
    options: ProjectionOptions;
}

export function trackScreenShift(camera: Camera, canvas: HTMLCanvasElement): ShiftTracker {
    let marked = snapshot(camera, canvas);
    return {
        mark() {
            marked = snapshot(camera, canvas);
        },
        shift(point) {
            const before = project(point, marked);
            const after = project(point, snapshot(camera, canvas));
            return { dx: after.cssX - before.cssX, dy: after.cssY - before.cssY };
        },
    };
}

function snapshot(camera: Camera, canvas: HTMLCanvasElement): ViewSnapshot {
    const backingWidth = canvas.width;
    const backingHeight = canvas.height;
    // The projection (fov, near/far, ortho bounds) is part of the view: the
    // view-projection cache is keyed on those as well as on camera motion.
    const aspect = getEffectiveAspectRatio(camera, backingWidth, backingHeight);
    const options: ProjectionOptions = {
        viewport: { ...resolveCameraViewport(camera, backingWidth, backingHeight) },
        backingWidth,
        backingHeight,
        cssWidth: canvas.clientWidth || backingWidth,
        cssHeight: canvas.clientHeight || backingHeight,
    };
    // Under floating origin the view matrix is camera-relative (translation
    // zeroed), so the projector must be told where its origin sits in the world.
    if (camera._useFloatingOrigin) {
        const eye = getCameraPosition(camera);
        options.worldOrigin = { x: eye.x, y: eye.y, z: eye.z } as Vec3;
    }
    // These getters return the camera's own cached matrices, which are rewritten
    // in place when the camera changes, so the snapshot must keep copies.
    return {
        view: copyMatrix(getViewMatrix(camera)),
        viewProjection: copyMatrix(getViewProjectionMatrix(camera, aspect)),
        options,
    };
}

function project(point: Vec, state: ViewSnapshot) {
    return projectWorldToScreen(point as Vec3, state.view, state.viewProjection, state.options);
}

function copyMatrix(m: Mat4): Mat4 {
    // Matrix storage is a typed array (Float32Array, or Float64Array once a
    // high-precision engine exists); slice() copies only this matrix even if it
    // is a view into a larger pool. Any other shape is deep-cloned.
    return ArrayBuffer.isView(m)
        ? ((m as unknown as Float32Array).slice() as unknown as Mat4)
        : structuredClone(m);
}
