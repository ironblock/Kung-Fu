import type { Camera } from "@babylonjs/lite";
import {
    getViewMatrix,
    getViewProjectionMatrix,
    getEffectiveAspectRatio,
    projectWorldToScreen,
} from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface ShiftTracker {
    mark(): void;
    shift(point: Vec): { dx: number; dy: number };
}

export function trackScreenShift(camera: Camera, canvas: HTMLCanvasElement): ShiftTracker {
    let markView: number[];
    let markVP: number[];
    let markBw: number;
    let markBh: number;
    let markCssW: number;
    let markCssH: number;

    function capture() {
        const bw = canvas.width;
        const bh = canvas.height;
        const aspect = getEffectiveAspectRatio(camera, bw, bh);
        markView = getViewMatrix(camera).slice();
        markVP = getViewProjectionMatrix(camera, aspect).slice();
        markBw = bw;
        markBh = bh;
        markCssW = canvas.clientWidth;
        markCssH = canvas.clientHeight;
    }

    function project(
        view: number[],
        vp: number[],
        bw: number,
        bh: number,
        cssW: number,
        cssH: number,
        point: Vec,
    ) {
        return projectWorldToScreen(point, view, vp, {
            viewport: { x: 0, y: 0, width: bw, height: bh },
            backingWidth: bw,
            backingHeight: bh,
            cssWidth: cssW,
            cssHeight: cssH,
        });
    }

    capture();

    return {
        mark() {
            capture();
        },
        shift(point: Vec) {
            const m = project(markView, markVP, markBw, markBh, markCssW, markCssH, point);
            const bw = canvas.width;
            const bh = canvas.height;
            const aspect = getEffectiveAspectRatio(camera, bw, bh);
            const n = project(
                getViewMatrix(camera),
                getViewProjectionMatrix(camera, aspect),
                bw,
                bh,
                canvas.clientWidth,
                canvas.clientHeight,
                point,
            );
            return { dx: n.cssX - m.cssX, dy: n.cssY - m.cssY };
        },
    };
}
