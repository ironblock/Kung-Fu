import { getViewProjectionMatrix } from "@babylonjs/lite";
import type { Camera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };
export interface ShiftTracker {
    mark(): void;
    shift(point: Vec): { dx: number; dy: number };
}

function clip(m: ArrayLike<number>, p: Vec): { x: number; y: number } {
    const x = p.x * m[0]! + p.y * m[4]! + p.z * m[8]! + m[12]!;
    const y = p.x * m[1]! + p.y * m[5]! + p.z * m[9]! + m[13]!;
    const w = p.x * m[3]! + p.y * m[7]! + p.z * m[11]! + m[15]!;
    return { x: x / w, y: y / w };
}

export function trackScreenShift(camera: Camera, canvas: HTMLCanvasElement): ShiftTracker {
    const vp = (): number[] => Array.from(getViewProjectionMatrix(camera, canvas.width / canvas.height) as unknown as ArrayLike<number>);
    let marked = vp();
    return {
        mark() {
            marked = vp();
        },
        shift(point) {
            // Device pixels from NDC, then back to CSS pixels by the screen's pixel ratio.
            const ratio = (typeof window !== "undefined" && window.devicePixelRatio) || 1;
            const a = clip(marked, point), b = clip(vp(), point);
            return {
                dx: ((b.x - a.x) * 0.5 * canvas.width) / ratio,
                dy: (-(b.y - a.y) * 0.5 * canvas.height) / ratio,
            };
        },
    };
}
