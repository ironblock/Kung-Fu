import { createBankedFreeCamera, type FreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface ChaseCamera {
    camera: FreeCamera;
    bank(up: Vec): void;
}

// Below this length, the component of `up` perpendicular to the line of sight
// is treated as zero: the up direction is (numerically) along the view ray and
// has no roll to express, so the previous roll is kept.
const DEGENERATE_EPSILON = 1e-6;

function dot(a: Vec, b: Vec): number {
    return a.x * b.x + a.y * b.y + a.z * b.z;
}

function sub(a: Vec, b: Vec): Vec {
    return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

function length(a: Vec): number {
    return Math.hypot(a.x, a.y, a.z);
}

export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
    // The eye and target never move, so the line of sight is fixed for the
    // lifetime of the camera. Computed once here.
    const forwardRaw = sub(target, eye);
    const forwardLen = length(forwardRaw);
    if (!(forwardLen > 0) || !Number.isFinite(forwardLen)) {
        throw new Error("createChaseCamera: eye and target must be distinct, finite points");
    }
    const f: Vec = {
        x: forwardRaw.x / forwardLen,
        y: forwardRaw.y / forwardLen,
        z: forwardRaw.z / forwardLen,
    };

    // Start upright (world +Y). If eye->target is vertical, the library's
    // degenerate-view rule applies; the first bank() call fixes the roll.
    const camera = createBankedFreeCamera(
        { x: eye.x, y: eye.y, z: eye.z },
        { x: target.x, y: target.y, z: target.z },
        { x: 0, y: 1, z: 0 },
    );

    return {
        camera,
        bank(up: Vec): void {
            const upLen = length(up);
            if (!(upLen > 0) || !Number.isFinite(upLen)) {
                return; // no usable direction: keep previous roll
            }
            const u: Vec = { x: up.x / upLen, y: up.y / upLen, z: up.z / upLen };

            // Project `up` onto the plane perpendicular to the line of sight.
            // That projection is the closest achievable screen-up while still
            // looking at the target.
            const d = dot(u, f);
            const px = u.x - d * f.x;
            const py = u.y - d * f.y;
            const pz = u.z - d * f.z;
            const pLen = Math.hypot(px, py, pz);

            if (!(pLen > DEGENERATE_EPSILON)) {
                return; // up is along the line of sight: keep previous roll
            }

            camera.upVector.x = px / pLen;
            camera.upVector.y = py / pLen;
            camera.upVector.z = pz / pLen;
        },
    };
}
