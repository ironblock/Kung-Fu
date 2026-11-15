import { createBankedFreeCamera } from "@babylonjs/lite";
import type { FreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };
export interface ChaseCamera { camera: FreeCamera; bank(up: Vec): void }

// Below this length a vector counts as zero. Used for the "up is along the
// line of sight" test and for input validation.
const EPS = 1e-9;

function dot(a: Vec, b: Vec): number {
    return a.x * b.x + a.y * b.y + a.z * b.z;
}

function length(v: Vec): number {
    return Math.sqrt(dot(v, v));
}

function normalizeOrNull(v: Vec): Vec | null {
    const len = length(v);
    if (!(len > EPS) || !Number.isFinite(len)) {
        return null;
    }
    return { x: v.x / len, y: v.y / len, z: v.z / len };
}

// The unit vector in the plane perpendicular to the unit forward vector f
// that is closest to v. This is the "up in the picture" a roll can achieve
// while the camera keeps looking along f. Returns null when v is parallel to
// f (either direction), because then no roll changes the picture's up.
function uprightAgainst(v: Vec, f: Vec): Vec | null {
    const d = dot(v, f);
    return normalizeOrNull({
        x: v.x - d * f.x,
        y: v.y - d * f.y,
        z: v.z - d * f.z,
    });
}

export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
    const forward = normalizeOrNull({
        x: target.x - eye.x,
        y: target.y - eye.y,
        z: target.z - eye.z,
    });
    if (!forward) {
        throw new RangeError("createChaseCamera: eye and target must differ");
    }

    // Starts upright: world +Y projected onto the view plane. If the view is
    // vertical, fall back to +Z so the initial roll is still defined.
    const initialUp =
        uprightAgainst({ x: 0, y: 1, z: 0 }, forward) ??
        uprightAgainst({ x: 0, y: 0, z: 1 }, forward);
    if (!initialUp) {
        // Unreachable: a unit vector cannot be parallel to both Y and Z.
        throw new Error("createChaseCamera: could not find an initial up");
    }

    // The roll is kept here as a unit vector perpendicular to the view
    // direction. It is also the value a degenerate bank() call falls back to.
    let currentUp: Vec = initialUp;

    // Assumed API (not verified against 1.39.0 here): a banked free camera
    // exposes a writable upVector that rolls it at once (see camera-notes.md
    // item 37). Position and target are edited in place.
    const camera = createBankedFreeCamera();
    camera.position.x = eye.x;
    camera.position.y = eye.y;
    camera.position.z = eye.z;
    camera.target.x = target.x;
    camera.target.y = target.y;
    camera.target.z = target.z;
    camera.upVector = { x: currentUp.x, y: currentUp.y, z: currentUp.z };

    function bank(up: Vec): void {
        const desired = normalizeOrNull(up);
        const next = desired ? uprightAgainst(desired, forward) : null;

        if (next) {
            currentUp = next;
        } else {
            // Up is along the line of sight, or the input was zero: keep the
            // previous roll, re-projected onto the current view plane.
            currentUp = uprightAgainst(currentUp, forward) ?? currentUp;
        }

        camera.upVector = { x: currentUp.x, y: currentUp.y, z: currentUp.z };
    }

    return { camera, bank };
}
