import type { Camera, Mat4, PixelViewport } from "@babylonjs/lite";
import {
    getViewMatrix,
    getViewProjectionMatrix,
    getEffectiveAspectRatio,
    resolveCameraViewport,
    projectWorldToScreen,
} from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface ShiftTracker {
    mark(): void;
    shift(point: Vec): { dx: number; dy: number };
}

interface MarkedState {
    view: Mat4;
    viewProjection: Mat4;
    viewport: PixelViewport;
    backingWidth: number;
    backingHeight: number;
    cssWidth: number;
    cssHeight: number;
}

export function trackScreenShift(camera: Camera, canvas: HTMLCanvasElement): ShiftTracker {
    function capture(): MarkedState {
        const backingWidth = canvas.width;
        const backingHeight = canvas.height;
        const cssWidth = canvas.clientWidth;
        const cssHeight = canvas.clientHeight;
        const aspect = getEffectiveAspectRatio(camera, backingWidth, backingHeight);
        const view = getViewMatrix(camera);
        const viewProjection = getViewProjectionMatrix(camera, aspect);
        const viewport = resolveCameraViewport(camera, backingWidth, backingHeight);
        return {
            view,
            viewProjection,
            viewport,
            backingWidth,
            backingHeight,
            cssWidth,
            cssHeight,
        };
    }

    function projectCss(point: Vec, state: MarkedState): { cssX: number; cssY: number } {
        const r = projectWorldToScreen(point, state.view, state.viewProjection, {
            viewport: state.viewport,
            backingWidth: state.backingWidth,
            backingHeight: state.backingHeight,
            cssWidth: state.cssWidth,
            cssHeight: state.cssHeight,
        });
        return { cssX: r.cssX, cssY: r.cssY };
    }

    let marked: MarkedState = capture();

    return {
        mark() {
            marked = capture();
        },
        shift(point: Vec): { dx: number; dy: number } {
            const now = capture();
            const a = projectCss(point, marked);
            const b = projectCss(point, now);
            return { dx: b.cssX - a.cssX, dy: b.cssY - a.cssY };
        },
    };
}
