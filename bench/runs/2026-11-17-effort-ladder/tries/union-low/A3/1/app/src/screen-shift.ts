import type { Camera, Mat4, ScreenProjectionOptions } from "@babylonjs/lite";
import {
    getViewMatrix,
    getViewProjectionMatrix,
    getEffectiveAspectRatio,
    resolveCameraViewport,
    projectWorldToScreen,
    getCameraPosition,
} from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface ShiftTracker {
    mark(): void;
    shift(point: Vec): { dx: number; dy: number };
}

export function trackScreenShift(camera: Camera, canvas: HTMLCanvasElement): ShiftTracker {
    let storedView: Mat4 | null = null;
    let storedVP: Mat4 | null = null;
    let storedViewport: { x: number; y: number; width: number; height: number } | null = null;
    let storedBackingW = 0;
    let storedBackingH = 0;
    let storedCssW = 0;
    let storedCssH = 0;
    let storedOrigin: Vec | null = null;

    function mark(): void {
        const bw = canvas.width;
        const bh = canvas.height;
        const cw = canvas.clientWidth;
        const ch = canvas.clientHeight;

        const aspect = getEffectiveAspectRatio(camera, bw, bh);
        const vp = resolveCameraViewport(camera, bw, bh);

        // Copy matrices — they are the camera's own cache, overwritten on next change (note 35)
        storedView = getViewMatrix(camera).slice() as Mat4;
        storedVP = getViewProjectionMatrix(camera, aspect).slice() as Mat4;
        storedViewport = { x: vp.x, y: vp.y, width: vp.width, height: vp.height };
        storedBackingW = bw;
        storedBackingH = bh;
        storedCssW = cw;
        storedCssH = ch;
        storedOrigin = camera._useFloatingOrigin ? getCameraPosition(camera) : null;
    }

    function shift(point: Vec): { dx: number; dy: number } {
        const bw = canvas.width;
        const bh = canvas.height;
        const cw = canvas.clientWidth;
        const ch = canvas.clientHeight;

        const aspect = getEffectiveAspectRatio(camera, bw, bh);
        const viewport = resolveCameraViewport(camera, bw, bh);

        const curOpts: ScreenProjectionOptions = {
            viewport,
            backingWidth: bw,
            backingHeight: bh,
            cssWidth: cw,
            cssHeight: ch,
        };
        if (camera._useFloatingOrigin) {
            curOpts.worldOrigin = getCameraPosition(camera);
        }

        const cur = projectWorldToScreen(
            point,
            getViewMatrix(camera),
            getViewProjectionMatrix(camera, aspect),
            curOpts,
        );

        const stOpts: ScreenProjectionOptions = {
            viewport: storedViewport!,
            backingWidth: storedBackingW,
            backingHeight: storedBackingH,
            cssWidth: storedCssW,
            cssHeight: storedCssH,
        };
        if (storedOrigin) {
            stOpts.worldOrigin = storedOrigin;
        }

        const st = projectWorldToScreen(point, storedView!, storedVP!, stOpts);

        return { dx: cur.cssX - st.cssX, dy: cur.cssY - st.cssY };
    }

    mark();
    return { mark, shift };
}
