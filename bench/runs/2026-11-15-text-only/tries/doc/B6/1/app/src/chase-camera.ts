import { createBankedFreeCamera } from "@babylonjs/lite";
import type { FreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface ChaseCamera {
    camera: FreeCamera;
    bank(up: Vec): void;
}

/** Relative tolerance for "up is parallel to the line of sight". */
const DEGENERATE_EPS = 1e-9;

export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
    const dx = target.x - eye.x;
    const dy = target.y - eye.y;
    const dz = target.z - eye.z;
    const dist = Math.hypot(dx, dy, dz);
    if (!(dist > 0) || !Number.isFinite(dist)) {
        throw new Error("createChaseCamera: eye and target must be distinct, finite points");
    }

    // The line of sight never changes, because the camera only rolls.
    const fx = dx / dist;
    const fy = dy / dist;
    const fz = dz / dist;

    // Start upright (world +Y). If the line of sight is vertical, +Y is parallel to it
    // and the library would fall back to an identity rotation that ignores the target,
    // so use +Z as the starting up instead.
    const startUp: Vec = Math.abs(fy) > 1 - DEGENERATE_EPS ? { x: 0, y: 0, z: 1 } : { x: 0, y: 1, z: 0 };
    const camera = createBankedFreeCamera(eye, target, startUp);

    function bank(up: Vec): void {
        // Remove the part of `up` along the line of sight. What is left is the
        // closest up direction the picture can show.
        const d = up.x * fx + up.y * fy + up.z * fz;
        const px = up.x - d * fx;
        const py = up.y - d * fy;
        const pz = up.z - d * fz;
        const plen = Math.hypot(px, py, pz);
        const ulen = Math.hypot(up.x, up.y, up.z);

        // Parallel (or invalid) input has no usable roll: keep the previous up, so the
        // camera keeps looking at the target with its current roll.
        if (!(plen > DEGENERATE_EPS * ulen)) return;

        const u = camera.upVector;
        u.x = px / plen;
        u.y = py / plen;
        u.z = pz / plen;
    }

    return { camera, bank };
}
