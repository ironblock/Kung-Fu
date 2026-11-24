import type { FreeCamera } from "@babylonjs/lite";
import { createBankedFreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };
export interface ChaseCamera { camera: FreeCamera; bank(up: Vec): void }

// Relative threshold: the component of `up` across the line of sight is
// below this fraction of |up| means up is (numerically) along the view ray.
const DEGENERATE_EPS = 1e-6;

export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
    const dx = target.x - eye.x;
    const dy = target.y - eye.y;
    const dz = target.z - eye.z;
    const dlen = Math.hypot(dx, dy, dz);
    if (!(dlen > 0)) {
        throw new Error("createChaseCamera: eye and target must differ");
    }

    // Copy the inputs so the library never aliases the caller's objects.
    const camera = createBankedFreeCamera(
        { x: eye.x, y: eye.y, z: eye.z },
        { x: target.x, y: target.y, z: target.z },
        { x: 0, y: 1, z: 0 }, // starts upright
    );

    const bank = (worldUp: Vec): void => {
        // Line of sight, read from the camera so it matches what is rendered.
        const fx = camera.target.x - camera.position.x;
        const fy = camera.target.y - camera.position.y;
        const fz = camera.target.z - camera.position.z;
        const flen = Math.hypot(fx, fy, fz);
        const ux = fx / flen, uy = fy / flen, uz = fz / flen;

        // Project worldUp onto the plane perpendicular to the line of sight.
        // That is the closest roll that still looks at the target.
        const d = worldUp.x * ux + worldUp.y * uy + worldUp.z * uz;
        const px = worldUp.x - d * ux;
        const py = worldUp.y - d * uy;
        const pz = worldUp.z - d * uz;
        const plen = Math.hypot(px, py, pz);
        const wlen = Math.hypot(worldUp.x, worldUp.y, worldUp.z);

        // Up is along the line of sight: no roll is defined. Leave upVector
        // untouched so the camera keeps its previous roll.
        if (!(plen > DEGENERATE_EPS * wlen)) return;

        const up = camera.upVector;
        up.x = px / plen;
        up.y = py / plen;
        up.z = pz / plen;
    };

    return { camera, bank };
}
