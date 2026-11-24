import { getViewMatrix } from "@babylonjs/lite";
import type { Camera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };
export interface ShiftTracker {
    mark(): void;
    shift(point: Vec): { dx: number; dy: number };
}

interface Pose { view: number[]; fov: number }

function snapshot(camera: Camera): Pose {
    return { view: Array.from(getViewMatrix(camera) as unknown as ArrayLike<number>), fov: camera.fov };
}

// Project with a pinhole model: view space, then the vertical field of view, then CSS pixels.
function toCss(p: Vec, pose: Pose, w: number, h: number): { x: number; y: number } {
    const v = pose.view;
    const vx = p.x * v[0]! + p.y * v[4]! + p.z * v[8]! + v[12]!;
    const vy = p.x * v[1]! + p.y * v[5]! + p.z * v[9]! + v[13]!;
    const vz = p.x * v[2]! + p.y * v[6]! + p.z * v[10]! + v[14]!;
    const f = 1 / Math.tan(pose.fov / 2);
    const aspect = w / h;
    const nx = (f / aspect) * vx / vz;
    const ny = f * vy / vz;
    return { x: (nx + 1) * 0.5 * w, y: (1 - ny) * 0.5 * h };
}

export function trackScreenShift(camera: Camera, canvas: HTMLCanvasElement): ShiftTracker {
    let marked = snapshot(camera);
    return {
        mark() {
            marked = snapshot(camera);
        },
        shift(point) {
            const w = canvas.clientWidth, h = canvas.clientHeight;
            const a = toCss(point, marked, w, h);
            const b = toCss(point, snapshot(camera), w, h);
            return { dx: b.x - a.x, dy: b.y - a.y };
        },
    };
}
