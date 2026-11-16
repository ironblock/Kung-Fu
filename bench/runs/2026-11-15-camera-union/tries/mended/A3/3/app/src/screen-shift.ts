import {
    getEffectiveAspectRatio,
    getViewMatrix,
    getViewProjectionMatrix,
    projectWorldToScreen,
    type Camera,
} from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };
export interface ShiftTracker { mark(): void; shift(point: Vec): { dx: number; dy: number } }

type Mat = ReturnType<typeof getViewMatrix>;

// The camera's view and view-projection getters return the camera's own cache arrays,
// which are overwritten on the next change, so each capture copies them.
interface Snapshot {
    view: Mat;
    viewProjection: Mat;
    backingWidth: number;
    backingHeight: number;
    cssPerBackingX: number;
    cssPerBackingY: number;
}

export function trackScreenShift(camera: Camera, canvas: HTMLCanvasElement): ShiftTracker {
    function capture(): Snapshot {
        const backingWidth = canvas.width;
        const backingHeight = canvas.height;
        const rect = canvas.getBoundingClientRect();
        // Same aspect the renderer uses, so the projection matches what is drawn.
        const aspect = getEffectiveAspectRatio(camera, backingWidth, backingHeight);
        const view = getViewMatrix(camera).slice() as Mat;
        const viewProjection = getViewProjectionMatrix(camera, aspect).slice() as Mat;
        return {
            view,
            viewProjection,
            backingWidth,
            backingHeight,
            cssPerBackingX: rect.width / backingWidth,
            cssPerBackingY: rect.height / backingHeight,
        };
    }

    // Canvas position in CSS pixels, y down, of the world point under a given snapshot.
    function cssPosition(point: Vec, snap: Snapshot): { x: number; y: number } {
        const p = projectWorldToScreen(point, snap.view, snap.viewProjection, {
            viewport: { x: 0, y: 0, width: snap.backingWidth, height: snap.backingHeight },
            backingWidth: snap.backingWidth,
            backingHeight: snap.backingHeight,
        });
        return { x: p.x * snap.cssPerBackingX, y: p.y * snap.cssPerBackingY };
    }

    let marked = capture();

    return {
        mark() {
            marked = capture();
        },
        shift(point: Vec) {
            const before = cssPosition(point, marked);
            const after = cssPosition(point, capture());
            return { dx: after.x - before.x, dy: after.y - before.y };
        },
    };
}
