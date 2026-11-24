import type { FreeCamera, BankedFreeCamera } from "@babylonjs/lite";
import { createBankedFreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };
export interface ChaseCamera { camera: FreeCamera; bank(up: Vec): void }

// Same threshold the look-at builder uses for "up is parallel to the view direction". Below it the
// builder falls back to an identity rotation (which would discard the roll), so we keep the previous up.
const PARALLEL_SINE = 1e-10;

/** Chase camera that rolls about its line of sight so that its picture-up follows a supplied up direction.
 *  The eye and target are fixed, so the view direction is fixed and the picture-up is the projection of
 *  the supplied up onto the plane perpendicular to the view direction. */
export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
    // Starts upright: the banked camera's default up is world +Y.
    const camera: BankedFreeCamera = createBankedFreeCamera(eye, target);

    const fx = target.x - eye.x;
    const fy = target.y - eye.y;
    const fz = target.z - eye.z;
    const fLen = Math.hypot(fx, fy, fz);
    // Unit line of sight; undefined when eye === target (no roll is meaningful then).
    const dx = fx / fLen;
    const dy = fy / fLen;
    const dz = fz / fLen;

    return {
        camera,
        bank(up: Vec): void {
            if (!(fLen > 0) || !Number.isFinite(fLen)) return;
            const ul = Math.hypot(up.x, up.y, up.z);
            if (!(ul > 0) || !Number.isFinite(ul)) return;
            const ux = up.x / ul;
            const uy = up.y / ul;
            const uz = up.z / ul;

            // |up x d| is the sine of the angle between up and the line of sight. NaN fails the test too.
            const sx = uy * dz - uz * dy;
            const sy = uz * dx - ux * dz;
            const sz = ux * dy - uy * dx;
            const sine = Math.hypot(sx, sy, sz);
            if (!(sine >= PARALLEL_SINE)) return; // up along the line of sight: keep the previous roll

            // Writes are per-axis and only notify on change, so an unchanged up costs nothing.
            camera.upVector.x = ux;
            camera.upVector.y = uy;
            camera.upVector.z = uz;
        },
    };
}
