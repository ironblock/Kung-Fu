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

export function trackScreenShift(camera: Camera, canvas: HTMLCanvasElement): ShiftTracker {
    let storedView: Mat4 | null = null;
    let storedVP: Mat4 | null = null;
    let storedViewport: PixelViewport | null = null;
    let storedBackingW = 0;
    let storedBackingH = 0;
    let storedCssW = 0;
    let storedCssH = 0;

    const storedResult: ScreenProjectionResult = {
        x: 0, y: 0, z: 0,
        cssX: 0, cssY: 0,
        clipW: 0,
        behindCamera: false,
        clipped: false,
        offscreen: false,
    };
    const currentResult: ScreenProjectionResult = {
        x: 0, y: 0, z: 0,
        cssX: 0, cssY: 0,
        clipW: 0,
        behindCamera: false,
        clipped: false,
        offscreen: false,
    };

    function copyMat4(m: Mat4): Mat4 {
        return new Float32Array(m as unknown as ArrayLike<number>) as unknown as Mat4;
    }

    function mark(): void {
        const w = canvas.width;
        const h = canvas.height;
        const aspect = getEffectiveAspectRatio(camera, w, h);
        storedView = copyMat4(getViewMatrix(camera));
        storedVP = copyMat4(getViewProjectionMatrix(camera, aspect));
        const vp = resolveCameraViewport(camera, w, h);
        storedViewport = { x: vp.x, y: vp.y, width: vp.width, height: vp.height };
        storedBackingW = w;
        storedBackingH = h;
        storedCssW = canvas.clientWidth;
        storedCssH = canvas.clientHeight;
    }

    function shift(point: Vec): { dx: number; dy: number } {
        const w = canvas.width;
        const h = canvas.height;
        const aspect = getEffectiveAspectRatio(camera, w, h);
        const curView = getViewMatrix(camera);
        const curVP = getViewProjectionMatrix(camera, aspect);
        const curVp = resolveCameraViewport(camera, w, h);

        const storedOpts: ScreenProjectionOptions = {
            viewport: storedViewport!,
            backingWidth: storedBackingW,
            backingHeight: storedBackingH,
            cssWidth: storedCssW,
            cssHeight: storedCssH,
        };
        projectWorldToScreenToRef(point, storedView!, storedVP!, storedOpts, storedResult);

        const curOpts: ScreenProjectionOptions = {
            viewport: curVp,
            backingWidth: w,
            backingHeight: h,
            cssWidth: canvas.clientWidth,
            cssHeight: canvas.clientHeight,
        };
        projectWorldToScreenToRef(point, curView, curVP, curOpts, currentResult);

        return {
            dx: currentResult.cssX - storedResult.cssX,
            dy: currentResult.cssY - storedResult.cssY,
        };
    }

    mark();

    return { mark, shift };
}
