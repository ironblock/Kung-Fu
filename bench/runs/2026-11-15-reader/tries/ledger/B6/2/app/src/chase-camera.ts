import { createBankedFreeCamera, type FreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface ChaseCamera {
    camera: FreeCamera;
    bank(up: Vec): void;
}

// Below this, sin(angle between up and the line of sight) is treated as "exactly along it".
// The library's own look-at basis falls back to an identity rotation at 1e-10, which would drop
// the roll to zero; we stay above that threshold so we never hand it a degenerate up.
const PARALLEL_EPSILON = 1e-9;

/**
 * A free camera that sits at `eye`, looks at `target`, and rolls so its up matches a car's up.
 *
 * The camera's picture-up is the normalized projection of the requested up onto the plane
 * perpendicular to the line of sight, which is the closest achievable roll. When the requested up
 * is parallel to the line of sight there is no such projection, so the camera keeps its previous roll.
 */
export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
    // Starts with the default up (world +Y), i.e. upright.
    const camera = createBankedFreeCamera(
        { x: eye.x, y: eye.y, z: eye.z },
        { x: target.x, y: target.y, z: target.z },
    );

    return {
        camera,
        bank(up: Vec): void {
            const fx = camera.target.x - camera.position.x;
            const fy = camera.target.y - camera.position.y;
            const fz = camera.target.z - camera.position.z;
            const fLen = Math.hypot(fx, fy, fz);

            // |up x forward| = |up| |forward| sin(angle). Compare the sine so the test does not depend on scale.
            const cx = up.y * fz - up.z * fy;
            const cy = up.z * fx - up.x * fz;
            const cz = up.x * fy - up.y * fx;
            const crossLen = Math.hypot(cx, cy, cz);
            const upLen = Math.hypot(up.x, up.y, up.z);

            // The negated form also catches NaN. Degenerate input keeps the previous roll.
            if (!(fLen > 0 && upLen > 0 && crossLen > upLen * fLen * PARALLEL_EPSILON)) {
                return;
            }

            // The library builds the basis from cross(up, forward), so this rolls the view and
            // leaves the look-at target unchanged.
            camera.upVector.set(up.x, up.y, up.z);
        },
    };
}
