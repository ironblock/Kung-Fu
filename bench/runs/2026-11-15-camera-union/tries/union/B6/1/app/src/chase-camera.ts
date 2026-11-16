import { createBankedFreeCamera } from "@babylonjs/lite";
import type { FreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface ChaseCamera {
    camera: FreeCamera;
    bank(up: Vec): void;
}

// Below this length, the component of `up` across the line of sight is treated
// as zero (up is parallel or anti-parallel to the view direction).
const DEGENERATE_EPSILON = 1e-9;

export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
    // Start upright: world +Y as up.
    const camera = createBankedFreeCamera(
        { x: eye.x, y: eye.y, z: eye.z },
        { x: target.x, y: target.y, z: target.z },
        { x: 0, y: 1, z: 0 },
    );

    const bank = (up: Vec): void => {
        // Read the live pose so bank() works after the camera has been moved.
        const p = camera.position;
        const t = camera.target;

        // Unit view direction (eye -> target).
        let fx = t.x - p.x;
        let fy = t.y - p.y;
        let fz = t.z - p.z;
        const fl = Math.hypot(fx, fy, fz);
        if (fl === 0) {
            return; // no line of sight: nothing to roll against
        }
        fx /= fl;
        fy /= fl;
        fz /= fl;

        // Remove the component of `up` along the line of sight. What remains is
        // the closest direction to `up` that is perpendicular to the view, which
        // is the roll that matches the picture's up as closely as possible.
        const d = up.x * fx + up.y * fy + up.z * fz;
        const ux = up.x - d * fx;
        const uy = up.y - d * fy;
        const uz = up.z - d * fz;
        const ul = Math.hypot(ux, uy, uz);

        if (!(ul > DEGENERATE_EPSILON)) {
            // Up is along the line of sight (either way): there is no roll that
            // matches it. Keep the previous roll, i.e. leave upVector untouched.
            return;
        }

        const uv = camera.upVector;
        uv.x = ux / ul;
        uv.y = uy / ul;
        uv.z = uz / ul;
    };

    return { camera, bank };
}
