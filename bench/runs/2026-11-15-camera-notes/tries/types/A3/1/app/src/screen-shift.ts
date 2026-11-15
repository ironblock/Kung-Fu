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
export interface ShiftTracker { mark(): void; shift(point: Vec): { dx: number; dy: number } }

type PixelViewport = ReturnType<typeof resolveCameraViewport>;
type ProjectOptions = Parameters<typeof projectWorldToScreen>[3];
type Mat = Parameters<typeof projectWorldToScreen>[1];

/**
 * Everything needed to project a world point to canvas CSS pixels with the
 * camera exactly as it was at one moment. Matrices are copied because the
 * library hands out cached storage that is overwritten when the camera changes.
 */
interface Snapshot {
    view: Float64Array;
    viewProjection: Float64Array;
    /** Set only for floating-origin (LWR) cameras, whose view matrix is eye-relative. */
    worldOrigin: Vec | undefined;
    viewport: PixelViewport;
    backingWidth: number;
    backingHeight: number;
    cssWidth: number;
    cssHeight: number;
}

function capture(camera: Camera, canvas: HTMLCanvasElement): Snapshot {
    const backingWidth = canvas.width;
    const backingHeight = canvas.height;
    const aspect = getEffectiveAspectRatio(camera, backingWidth, backingHeight);
    const view = Float64Array.from(getViewMatrix(camera) as unknown as ArrayLike<number>);
    const viewProjection = Float64Array.from(
        getViewProjectionMatrix(camera, aspect) as unknown as ArrayLike<number>,
    );
    let worldOrigin: Vec | undefined;
    if (camera._useFloatingOrigin) {
        const p = getCameraPosition(camera);
        worldOrigin = { x: p.x, y: p.y, z: p.z };
    }
    return {
        view,
        viewProjection,
        worldOrigin,
        viewport: resolveCameraViewport(camera, backingWidth, backingHeight),
        backingWidth,
        backingHeight,
        cssWidth: canvas.clientWidth,
        cssHeight: canvas.clientHeight,
    };
}

function projectWith(snap: Snapshot, point: Vec): { x: number; y: number } {
    const options: ProjectOptions = {
        viewport: snap.viewport,
        backingWidth: snap.backingWidth,
        backingHeight: snap.backingHeight,
        cssWidth: snap.cssWidth,
        cssHeight: snap.cssHeight,
        worldOrigin: snap.worldOrigin,
    };
    const r = projectWorldToScreen(
        point,
        snap.view as unknown as Mat,
        snap.viewProjection as unknown as Mat,
        options,
    );
    return { x: r.cssX, y: r.cssY };
}

export function trackScreenShift(camera: Camera, canvas: HTMLCanvasElement): ShiftTracker {
    let marked = capture(camera, canvas);
    return {
        mark() {
            marked = capture(camera, canvas);
        },
        shift(point: Vec) {
            const before = projectWith(marked, point);
            const after = projectWith(capture(camera, canvas), point);
            return { dx: after.x - before.x, dy: after.y - before.y };
        },
    };
}
