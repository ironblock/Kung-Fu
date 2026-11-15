import { getViewMatrix, getViewProjectionMatrix } from "@babylonjs/lite";
import type { Camera } from "@babylonjs/lite";

// Another right answer: do the projection by hand from the library's view and view-projection matrices.
export function labelPosition(camera: Camera, canvas: HTMLCanvasElement, point: { x: number; y: number; z: number }): { x: number; y: number; visible: boolean } {
    const rect = canvas.getBoundingClientRect();
    const v = getViewMatrix(camera);
    const m = getViewProjectionMatrix(camera, canvas.width / canvas.height);
    const { x, y, z } = point;
    const viewZ = x * v[2]! + y * v[6]! + z * v[10]! + v[14]!;
    const cx = x * m[0]! + y * m[4]! + z * m[8]! + m[12]!;
    const cy = x * m[1]! + y * m[5]! + z * m[9]! + m[13]!;
    const cw = x * m[3]! + y * m[7]! + z * m[11]! + m[15]!;
    const nx = cx / cw;
    const ny = cy / cw;
    const inside = Math.abs(nx) <= 1 && Math.abs(ny) <= 1;
    return {
        x: ((nx + 1) / 2) * rect.width,
        y: ((1 - ny) / 2) * rect.height,
        visible: viewZ > 0 && cw > 0 && inside,
    };
}
