import { createBankedFreeCamera, type FreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };
export interface ChaseCamera { camera: FreeCamera; bank(up: Vec): void }

/** Below this length, the component of `up` perpendicular to the line of sight is treated as zero. */
const DEGENERATE_EPSILON = 1e-9;

/** Projects `v` onto the plane perpendicular to the unit vector `f` and normalizes the result.
 *  Returns null when `v` is (numerically) parallel to `f`, so no roll direction exists. */
function projectOntoPlane(v: Vec, f: Vec): Vec | null {
    const d = v.x * f.x + v.y * f.y + v.z * f.z;
    const x = v.x - f.x * d;
    const y = v.y - f.y * d;
    const z = v.z - f.z * d;
    const len = Math.sqrt(x * x + y * y + z * z);
    if (!(len > DEGENERATE_EPSILON)) {
        return null;
    }
    return { x: x / len, y: y / len, z: z / len };
}

/**
 * Creates a camera at `eye` looking at `target`, starting upright (world +Y projected into the
 * picture). `bank(up)` rolls the camera so its picture-up matches the projection of `up` onto the
 * plane perpendicular to the line of sight. If `up` is parallel to the line of sight, the roll is
 * left unchanged and the camera keeps looking at the target.
 */
export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
    const dx = target.x - eye.x;
    const dy = target.y - eye.y;
    const dz = target.z - eye.z;
    const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (!(len > 0)) {
        throw new RangeError("createChaseCamera: eye and target must be distinct points");
    }
    const forward: Vec = { x: dx / len, y: dy / len, z: dz / len };

    // Initial roll: upright. If the view is vertical, fall back to world +Z, which cannot also be vertical.
    const upright =
        projectOntoPlane({ x: 0, y: 1, z: 0 }, forward) ??
        projectOntoPlane({ x: 0, y: 0, z: 1 }, forward)!;

    const banked = createBankedFreeCamera(eye, target, upright);

    return {
        camera: banked,
        bank(up: Vec): void {
            const picture = projectOntoPlane(up, forward);
            if (picture === null) {
                // Degenerate: keep the previous roll. The lookAt basis would otherwise fall back to identity.
                return;
            }
            banked.upVector.set(picture.x, picture.y, picture.z);
        },
    };
}
