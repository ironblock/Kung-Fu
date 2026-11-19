import { getViewMatrix } from "@babylonjs/lite";
import type { Camera } from "@babylonjs/lite";

// Project by hand: view space from the camera's view matrix, then a perspective of the camera's vertical fov.
export function labelPosition(camera: Camera, canvas: HTMLCanvasElement, point: { x: number; y: number; z: number }): { x: number; y: number; visible: boolean } {
    const v = getViewMatrix(camera) as unknown as number[];
    const vx = point.x * v[0]! + point.y * v[4]! + point.z * v[8]! + v[12]!;
    const vy = point.x * v[1]! + point.y * v[5]! + point.z * v[9]! + v[13]!;
    const vz = point.x * v[2]! + point.y * v[6]! + point.z * v[10]! + v[14]!;
    const cw = canvas.clientWidth || canvas.width, ch = canvas.clientHeight || canvas.height;
    const aspect = canvas.width / canvas.height;
    const f = 1 / Math.tan(camera.fov / 2);
    const nx = (vx * f / aspect) / vz;
    const ny = (vy * f) / vz;
    const x = (nx + 1) * 0.5 * cw;
    const y = (1 - ny) * 0.5 * ch;
    const inside = nx >= -1 && nx <= 1 && ny >= -1 && ny <= 1;
    return { x, y, visible: vz > 0 && inside };
}
