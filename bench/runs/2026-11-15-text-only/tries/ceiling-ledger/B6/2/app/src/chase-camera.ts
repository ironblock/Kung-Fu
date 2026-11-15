import { createBankedFreeCamera } from "@babylonjs/lite";
import type { FreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface ChaseCamera {
    camera: FreeCamera;
    bank(up: Vec): void;
}

// Below this length the requested up has no usable component across the line
// of sight (it points along it, either way), so the roll is left unchanged.
// A relative tolerance, because "exactly along" arrives with rounding noise and
// normalising that noise would give a random roll.
const PARALLEL_EPS = 1e-6;

const dot = (a: Vec, b: Vec) => a.x * b.x + a.y * b.y + a.z * b.z;

function normalize(v: Vec): Vec | null {
    const len = Math.hypot(v.x, v.y, v.z);
    return len > 0 ? { x: v.x / len, y: v.y / len, z: v.z / len } : null;
}

/** The part of `up` perpendicular to `forward` (unit), normalised, or null if `up` is (nearly) along `forward`. */
function upAcross(up: Vec, forward: Vec): Vec | null {
    const upLen = Math.hypot(up.x, up.y, up.z);
    if (!(upLen > 0)) return null;
    const d = dot(up, forward);
    const px = up.x - d * forward.x;
    const py = up.y - d * forward.y;
    const pz = up.z - d * forward.z;
    const pLen = Math.hypot(px, py, pz);
    if (!(pLen > PARALLEL_EPS * upLen)) return null;
    return { x: px / pLen, y: py / pLen, z: pz / pLen };
}

export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
    const forward = normalize({ x: target.x - eye.x, y: target.y - eye.y, z: target.z - eye.z });
    if (!forward) throw new Error("createChaseCamera: eye and target must differ");

    // Upright = world up made perpendicular to the view direction. If the view
    // is straight up or down, world up is undefined as a roll, so fall back to +Z.
    const startUp = upAcross({ x: 0, y: 1, z: 0 }, forward) ?? upAcross({ x: 0, y: 0, z: 1 }, forward)!;

    const camera = createBankedFreeCamera();
    setVec(camera.position, eye);
    setVec(camera.target, target);
    setVec(camera.upVector, startUp);

    return {
        camera,
        bank(up: Vec) {
            // Recompute the line of sight from the camera itself, so the roll
            // stays correct if the game moves position/target between frames.
            const p = camera.position;
            const t = camera.target;
            const f = normalize({ x: t.x - p.x, y: t.y - p.y, z: t.z - p.z });
            if (!f) return;
            const u = upAcross(up, f);
            if (!u) return; // up along the line of sight: keep the previous roll
            setVec(camera.upVector, u);
        },
    };
}

// Component writes rather than replacing the object, so any change tracking the
// library keeps on these vectors stays attached.
function setVec(dst: Vec, src: Vec): void {
    dst.x = src.x;
    dst.y = src.y;
    dst.z = src.z;
}
