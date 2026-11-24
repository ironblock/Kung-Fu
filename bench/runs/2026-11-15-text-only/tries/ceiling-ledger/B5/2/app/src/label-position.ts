import type { Camera } from "@babylonjs/lite";
import { getViewProjectionMatrix } from "@babylonjs/lite";

type Vec3 = { x: number; y: number; z: number };

/**
 * Where a world-space point appears on the canvas, in CSS pixels from the top-left corner.
 *
 * `visible` is true when the point is in front of the camera and inside the picture. Depth is
 * deliberately ignored apart from the front/behind test, so points past the far plane (or nearer
 * than the near plane) still count as visible.
 */
export function labelPosition(camera: Camera, canvas: HTMLCanvasElement, point: Vec3): { x: number; y: number; visible: boolean } {
    // The view-projection is read through the library getter so that its change key keeps the
    // cached matrix up to date with fov / nearPlane / farPlane / ortho changes made since the last frame.
    const vp = getViewProjectionMatrix(camera) as unknown;
    const m: ArrayLike<number> = (vp as { m?: ArrayLike<number> }).m ?? (vp as ArrayLike<number>);

    // Flat 16-element matrix, row-vector convention (translation in 12..14, perspective w term in 11).
    const { x: px, y: py, z: pz } = point;
    const cx = px * m[0] + py * m[4] + pz * m[8] + m[12];
    const cy = px * m[1] + py * m[5] + pz * m[9] + m[13];
    const cw = px * m[3] + py * m[7] + pz * m[11] + m[15];

    const isPerspective = m[3] !== 0 || m[7] !== 0 || m[11] !== 0;

    let inFront: boolean;
    if (isPerspective) {
        // Clip w is the distance in front of the camera plane, whatever the handedness or depth range.
        inFront = cw > 0;
    } else {
        // Orthographic: w is constant, so decide front/behind from the camera's own look direction.
        inFront = orthoInFront(camera, point);
    }

    // For points behind the camera, divide by |w| so the result stays on the side the point is
    // really on (useful for an off-screen arrow); it is never visible either way.
    const w = Math.abs(cw) > 1e-12 ? Math.abs(cw) : 1e-12;
    const ndcX = cx / w;
    const ndcY = cy / w;

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const x = ((ndcX + 1) / 2) * width;
    const y = ((1 - ndcY) / 2) * height;

    const inside = ndcX >= -1 && ndcX <= 1 && ndcY >= -1 && ndcY <= 1;
    return { x, y, visible: inFront && inside };
}

function orthoInFront(camera: Camera, point: Vec3): boolean {
    const c = camera as unknown as { position?: Vec3; target?: Vec3; center?: Vec3 };
    const eye = c.position;
    const look = c.target ?? c.center;
    if (!eye || !look) {
        return true;
    }
    const fx = look.x - eye.x;
    const fy = look.y - eye.y;
    const fz = look.z - eye.z;
    return (point.x - eye.x) * fx + (point.y - eye.y) * fy + (point.z - eye.z) * fz > 0;
}
