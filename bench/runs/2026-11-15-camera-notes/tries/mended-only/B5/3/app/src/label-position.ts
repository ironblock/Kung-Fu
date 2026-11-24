import type { Camera } from "@babylonjs/lite";

export interface LabelPosition {
    /** CSS pixels from the canvas's top-left corner, y growing downwards. */
    x: number;
    y: number;
    /** In front of the camera, inside the picture, and not nearer than the near plane. Far distance is ignored. */
    visible: boolean;
}

type Vec4 = [number, number, number, number];

/**
 * Row-vector transform (Babylon convention): v' = v * M, with translation in m[12..14].
 */
function transform(m: ArrayLike<number>, x: number, y: number, z: number, w: number): Vec4 {
    return [
        x * m[0] + y * m[4] + z * m[8] + w * m[12],
        x * m[1] + y * m[5] + z * m[9] + w * m[13],
        x * m[2] + y * m[6] + z * m[10] + w * m[14],
        x * m[3] + y * m[7] + z * m[11] + w * m[15],
    ];
}

export function labelPosition(
    camera: Camera,
    canvas: HTMLCanvasElement,
    point: { x: number; y: number; z: number },
): { x: number; y: number; visible: boolean } {
    // The camera renders to the whole canvas, so the render aspect is the backing-store aspect.
    const aspect = canvas.width / canvas.height;

    // Copy each matrix before requesting the next one: the camera reuses its cache arrays.
    const view = Array.from(camera.getViewMatrix() as ArrayLike<number>);
    const proj = Array.from(camera.getProjectionMatrix(aspect) as ArrayLike<number>);

    // World -> view. View-space z is the forward distance (left-handed), so z > 0 means in front.
    const [vx, vy, vz, vw] = transform(view, point.x, point.y, point.z, 1);

    // View -> clip. Ignore far-plane clipping entirely; only the near plane (depth 1 with reverse-Z) limits.
    const [cx, cy, cz, cw] = transform(proj, vx, vy, vz, vw);

    if (cw === 0 || !Number.isFinite(cw)) {
        return { x: NaN, y: NaN, visible: false };
    }

    const ndcX = cx / cw;
    const ndcY = cy / cw;
    const ndcZ = cz / cw;

    // Divide by |w| so off-screen points behind the camera still give a sensible direction.
    const sx = cx / Math.abs(cw);
    const sy = cy / Math.abs(cw);

    const inFront = vz > 0;
    const inside = Math.abs(ndcX) <= 1 && Math.abs(ndcY) <= 1 && ndcZ <= 1;

    return {
        x: ((sx + 1) / 2) * canvas.clientWidth,
        y: ((1 - sy) / 2) * canvas.clientHeight,
        visible: inFront && inside,
    };
}
