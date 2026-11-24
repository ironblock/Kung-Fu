import { createBankedFreeCamera, type BankedFreeCamera, type FreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface ChaseCamera {
    camera: FreeCamera;
    bank(up: Vec): void;
}

const WORLD_Y: Vec = { x: 0, y: 1, z: 0 };
const WORLD_Z: Vec = { x: 0, y: 0, z: 1 };

/** Below this sine of the angle between the requested up and the line of sight, the roll is
 *  undefined and the previous roll is kept. */
const DEGENERATE_SIN = 1e-9;

function sub(a: Vec, b: Vec): Vec {
    return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

/** Unit vector in the direction of `v`, or null when `v` has no usable direction. */
function normalize(v: Vec): Vec | null {
    const len = Math.hypot(v.x, v.y, v.z);
    if (!(len > 0) || !Number.isFinite(len)) return null;
    return { x: v.x / len, y: v.y / len, z: v.z / len };
}

/** The component of `up` perpendicular to the unit `forward`, normalized. This is the picture-up
 *  the library's look-at basis produces for `up` (yAxis = cross(z, cross(up, z)) = up - (up·z)z),
 *  so it is the roll that brings the picture's up as close to `up` as the camera allows.
 *  Returns null when `up` is parallel or antiparallel to `forward`. */
function upInPlane(up: Vec, forward: Vec): Vec | null {
    const u = normalize(up);
    if (!u) return null;
    const d = u.x * forward.x + u.y * forward.y + u.z * forward.z;
    const px = u.x - d * forward.x;
    const py = u.y - d * forward.y;
    const pz = u.z - d * forward.z;
    const len = Math.hypot(px, py, pz);
    if (!(len > DEGENERATE_SIN)) return null;
    return { x: px / len, y: py / len, z: pz / len };
}

/** Starting roll is upright: world +Y projected into the view plane. If the view is vertical,
 *  world +Z is used instead, since +Y has no component in the view plane then. */
function initialUp(eye: Vec, target: Vec): Vec {
    const forward = normalize(sub(target, eye));
    if (!forward) return WORLD_Y;
    return upInPlane(WORLD_Y, forward) ?? upInPlane(WORLD_Z, forward) ?? WORLD_Y;
}

/** Chase camera that rolls to follow a vehicle's up direction while keeping its target.
 *
 *  The camera is a BankedFreeCamera whose `upVector` holds the current picture-up direction,
 *  always perpendicular to the view and of unit length. `bank` only writes that vector when the
 *  requested up has a usable projection; otherwise the previous roll is kept. This keeps the
 *  library's own identity fallback (which would drop the roll entirely) out of the picture. */
export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
    const camera: BankedFreeCamera = createBankedFreeCamera(eye, target, initialUp(eye, target));
    return {
        camera,
        bank(up: Vec): void {
            const forward = normalize(sub(camera.target, camera.position));
            if (!forward) return;
            const next = upInPlane(up, forward);
            if (next) camera.upVector.set(next.x, next.y, next.z);
        },
    };
}
