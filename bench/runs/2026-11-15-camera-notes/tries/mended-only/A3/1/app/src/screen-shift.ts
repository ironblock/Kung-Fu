import type { Camera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };
export interface ShiftTracker { mark(): void; shift(point: Vec): { dx: number; dy: number } }

type Vec4 = [number, number, number, number];

// A copy of the camera's view and projection matrices, plus the canvas size
// (CSS pixels) they were taken with.
interface Snapshot {
    view: Float64Array;
    proj: Float64Array;
    width: number;
    height: number;
}

// Babylon matrices are stored row-major and applied to row vectors:
// the translation sits in elements 12..14 and w in element 15.
function mul(v: Vec4, m: ArrayLike<number>): Vec4 {
    const [x, y, z, w] = v;
    return [
        x * m[0] + y * m[4] + z * m[8] + w * m[12],
        x * m[1] + y * m[5] + z * m[9] + w * m[13],
        x * m[2] + y * m[6] + z * m[10] + w * m[14],
        x * m[3] + y * m[7] + z * m[11] + w * m[15],
    ];
}

function capture(camera: Camera, canvas: HTMLCanvasElement): Snapshot {
    // Reading the matrices lets the camera rebuild its cache if it is dirty.
    // The camera returns its own cache object, which is overwritten in place,
    // so the values are copied.
    const view = new Float64Array(16);
    const proj = new Float64Array(16);
    const v = camera.getViewMatrix();
    const p = camera.getProjectionMatrix();
    for (let i = 0; i < 16; i++) {
        view[i] = v[i];
        proj[i] = p[i];
    }
    return { view, proj, width: canvas.clientWidth, height: canvas.clientHeight };
}

// Picture of a world-space point on the canvas, in CSS pixels, y down.
function project(snap: Snapshot, point: Vec): { x: number; y: number } {
    const eye = mul([point.x, point.y, point.z, 1], snap.view);
    const clip = mul(eye, snap.proj);
    const ndcX = clip[0] / clip[3];
    const ndcY = clip[1] / clip[3];
    return {
        x: ((ndcX + 1) / 2) * snap.width,
        y: ((1 - ndcY) / 2) * snap.height,
    };
}

export function trackScreenShift(camera: Camera, canvas: HTMLCanvasElement): ShiftTracker {
    let marked: Snapshot | null = null;

    const tracker: ShiftTracker = {
        mark() {
            marked = capture(camera, canvas);
        },
        shift(point: Vec) {
            if (!marked) {
                throw new Error("screen-shift: shift() called before mark()");
            }
            const now = capture(camera, canvas);
            const before = project(marked, point);
            const after = project(now, point);
            return { dx: after.x - before.x, dy: after.y - before.y };
        },
    };

    tracker.mark();
    return tracker;
}
