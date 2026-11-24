/**
 * Tracks how far the on-canvas picture of a world-space point moves as the
 * camera changes (moves, turns, zooms, fov changes). Used for motion trails.
 */
import {
    getCameraPosition,
    getEffectiveAspectRatio,
    getProjectionMatrix,
    getViewMatrix,
    type Camera,
} from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface ShiftTracker {
    /** Remember the camera's view as it is now; `shift` measures from here. */
    mark(): void;
    /**
     * How far the picture of world-space `point` has moved on the canvas
     * between the last mark and the camera as it is now, in CSS pixels
     * (`dx` to the right, `dy` down).
     */
    shift(point: Vec): { dx: number; dy: number };
}

type Mat4 = ReturnType<typeof getViewMatrix>;

/** A copy of everything that decides where a world point lands on the canvas. */
interface Snapshot {
    readonly view: Float64Array;
    readonly projection: Float64Array;
    eyeX: number;
    eyeY: number;
    eyeZ: number;
    cssWidth: number;
    cssHeight: number;
}

function createSnapshot(): Snapshot {
    return {
        view: new Float64Array(16),
        projection: new Float64Array(16),
        eyeX: 0,
        eyeY: 0,
        eyeZ: 0,
        cssWidth: 0,
        cssHeight: 0,
    };
}

function copyMatrix(matrix: Mat4, out: Float64Array): void {
    // Expected to be a flat array of 16 numbers; also accept a `{ m }` wrapper.
    const src = matrix as unknown as ArrayLike<number> & { m?: ArrayLike<number> };
    const m = typeof src.length === "number" ? src : src.m;
    if (!m || m.length < 16) {
        throw new TypeError("screen-shift: unexpected Mat4 shape from @babylonjs/lite");
    }
    for (let i = 0; i < 16; i++) out[i] = m[i];
}

function capture(camera: Camera, canvas: HTMLCanvasElement, out: Snapshot): void {
    // The camera keeps its matrices in caches it overwrites in place
    // (`_viewCache`, `_projCache`, ...), so copy values out immediately
    // rather than holding on to what these functions return.
    copyMatrix(getViewMatrix(camera), out.view);

    // Projection is read on its own, fresh every time: a fov zoom changes it
    // without touching the camera's world matrix or its version number.
    // Aspect is computed the way the renderer does, from the backing size.
    const aspect = getEffectiveAspectRatio(camera, canvas.width, canvas.height);
    copyMatrix(getProjectionMatrix(camera, aspect), out.projection);

    const eye = getCameraPosition(camera);
    out.eyeX = eye.x;
    out.eyeY = eye.y;
    out.eyeZ = eye.z;

    // The picture fills the canvas, which is displayed at its CSS size.
    out.cssWidth = canvas.clientWidth;
    out.cssHeight = canvas.clientHeight;
}

/**
 * Where world point `p` lands on the canvas for snapshot `s`, in CSS pixels
 * from the top-left corner. Matrices use the usual flat layout with the
 * translation in entries 12-14: p' = x*m[0..3] + y*m[4..7] + z*m[8..11] + m[12..15].
 */
function project(s: Snapshot, p: Vec, out: { x: number; y: number }): void {
    // View space, measured from the eye with only the view's rotation part.
    // Same result as applying the full view matrix, but it stays correct if
    // the library renders with a floating origin (view translation taken
    // relative to a shifted origin) and keeps precision far from the origin.
    const ox = p.x - s.eyeX;
    const oy = p.y - s.eyeY;
    const oz = p.z - s.eyeZ;
    const v = s.view;
    const vx = ox * v[0] + oy * v[4] + oz * v[8];
    const vy = ox * v[1] + oy * v[5] + oz * v[9];
    const vz = ox * v[2] + oy * v[6] + oz * v[10];

    // Clip space (x, y, w).
    const m = s.projection;
    const cx = vx * m[0] + vy * m[4] + vz * m[8] + m[12];
    const cy = vx * m[1] + vy * m[5] + vz * m[9] + m[13];
    const cw = vx * m[3] + vy * m[7] + vz * m[11] + m[15];

    // NDC -> CSS pixels. NDC y points up, canvas y points down.
    // (cw > 0 because the point is in front of the camera.)
    out.x = (cx / cw + 1) * 0.5 * s.cssWidth;
    out.y = (1 - cy / cw) * 0.5 * s.cssHeight;
}

export function trackScreenShift(camera: Camera, canvas: HTMLCanvasElement): ShiftTracker {
    const marked = createSnapshot();
    const current = createSnapshot();
    const then = { x: 0, y: 0 };
    const now = { x: 0, y: 0 };

    capture(camera, canvas, marked);

    return {
        mark(): void {
            capture(camera, canvas, marked);
        },
        shift(point: Vec): { dx: number; dy: number } {
            capture(camera, canvas, current);
            project(marked, point, then);
            project(current, point, now);
            return { dx: now.x - then.x, dy: now.y - then.y };
        },
    };
}
