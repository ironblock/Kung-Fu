import type {
    Camera,
    Mat4,
    PixelViewport,
    ScreenProjectionOptions,
    ScreenProjectionResult,
} from "@babylonjs/lite";
import {
    getViewMatrix,
    getViewProjectionMatrix,
    getEffectiveAspectRatio,
    resolveCameraViewport,
    projectWorldToScreenToRef,
} from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface ShiftTracker {
    mark(): void;
    shift(point: Vec): { dx: number; dy: number };
}

interface CapturedState {
    view: Mat4;
    viewProjection: Mat4;
    viewport: PixelViewport;
    backingWidth: number;
    backingHeight: number;
    cssWidth: number;
    cssHeight: number;
}

function copyMat4(m: Mat4): Mat4 {
    const src = m as unknown as ArrayLike<number>;
    const out = new Array(src.length);
    for (let i = 0; i < src.length; i++) out[i] = src[i];
    return out as unknown as Mat4;
}

function capture(camera: Camera, canvas: HTMLCanvasElement): CapturedState {
    const aspect = getEffectiveAspectRatio(camera, canvas.width, canvas.height);
    return {
        view: copyMat4(getViewMatrix(camera)),
        viewProjection: copyMat4(getViewProjectionMatrix(camera, aspect)),
        viewport: { ...resolveCameraViewport(camera, canvas.width, canvas.height) },
        backingWidth: canvas.width,
        backingHeight: canvas.height,
        cssWidth: canvas.clientWidth,
        cssHeight: canvas.clientHeight,
    };
}

function projectToCss(
    point: Vec,
    state: CapturedState,
    result: ScreenProjectionResult,
): void {
    const opts: ScreenProjectionOptions = {
        viewport: state.viewport,
        backingWidth: state.backingWidth,
        backingHeight: state.backingHeight,
        cssWidth: state.cssWidth,
        cssHeight: state.cssHeight,
    };
    projectWorldToScreenToRef(point, state.view, state.viewProjection, opts, result);
}

export function trackScreenShift(camera: Camera, canvas: HTMLCanvasElement): ShiftTracker {
    let stored: CapturedState = capture(camera, canvas);

    const scratch: ScreenProjectionResult = {
        x: 0, y: 0, z: 0,
        cssX: 0, cssY: 0,
        clipW: 0,
        behindCamera: false,
        clipped: false,
        offscreen: false,
    };

    return {
        mark() {
            stored = capture(camera, canvas);
        },
        shift(point: Vec): { dx: number; dy: number } {
            projectToCss(point, stored, scratch);
            const bx = scratch.cssX;
            const by = scratch.cssY;

            const current = capture(camera, canvas);
            projectToCss(point, current, scratch);

            return { dx: scratch.cssX - bx, dy: scratch.cssY - by };
        },
    };
}
