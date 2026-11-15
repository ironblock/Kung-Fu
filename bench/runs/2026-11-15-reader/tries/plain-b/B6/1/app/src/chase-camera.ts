import { createBankedFreeCamera, type FreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface ChaseCamera {
    camera: FreeCamera;
    bank(up: Vec): void;
}

const WORLD_UP: Vec = { x: 0, y: 1, z: 0 };
// Fallback up for a view that is exactly vertical (the world-up projection is then undefined).
const FALLBACK_UP: Vec = { x: 0, y: 0, z: 1 };
// The look-at builder falls back to an identity rotation when |up x viewDir| < 1e-10. Treat anything
// below a slightly larger bound as parallel, so we never hand the builder a vector it would reject.
const PARALLEL_EPS = 1e-9;

function length(v: Vec): number {
    return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
}

function normalize(v: Vec): Vec | null {
    const len = length(v);
    if (!(len > 0) || !Number.isFinite(len)) {
        return null;
    }
    return { x: v.x / len, y: v.y / len, z: v.z / len };
}

function cross(a: Vec, b: Vec): Vec {
    return { x: a.y * b.z - a.z * b.y, y: a.z * b.x - a.x * b.z, z: a.x * b.y - a.y * b.x };
}

/** Unit component of `up` perpendicular to the unit view direction `dir`, i.e. the screen-up the
 *  camera realizes for that up. Returns null when `up` is (numerically) parallel to `dir`. */
function screenUpFor(up: Vec, dir: Vec): Vec | null {
    // |up x dir| equals the length of the perpendicular component for unit vectors.
    if (length(cross(up, dir)) < PARALLEL_EPS) {
        return null;
    }
    const d = up.x * dir.x + up.y * dir.y + up.z * dir.z;
    return normalize({ x: up.x - d * dir.x, y: up.y - d * dir.y, z: up.z - d * dir.z });
}

export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
    const camera = createBankedFreeCamera({ x: eye.x, y: eye.y, z: eye.z }, { x: target.x, y: target.y, z: target.z }, WORLD_UP);

    // Unit screen-up the camera currently realizes. Used to keep the roll when a bank call is degenerate.
    let lastScreenUp: Vec = WORLD_UP;

    // Current view direction, read from the camera so moves made directly on position/target are honored.
    const viewDir = (): Vec | null => normalize({
        x: camera.target.x - camera.position.x,
        y: camera.target.y - camera.position.y,
        z: camera.target.z - camera.position.z,
    });

    const initialDir = viewDir();
    if (initialDir !== null) {
        lastScreenUp = screenUpFor(WORLD_UP, initialDir) ?? screenUpFor(FALLBACK_UP, initialDir) ?? WORLD_UP;
        camera.upVector.set(lastScreenUp.x, lastScreenUp.y, lastScreenUp.z);
    }

    function bank(up: Vec): void {
        const dir = viewDir();
        if (dir === null) {
            // Eye on target: no view direction, so there is no roll to set.
            return;
        }
        const nextUp = normalize(up);
        const screenUp = nextUp === null ? null : screenUpFor(nextUp, dir);
        if (nextUp !== null && screenUp !== null) {
            camera.upVector.set(nextUp.x, nextUp.y, nextUp.z);
            lastScreenUp = screenUp;
            return;
        }
        // Degenerate (up along the line of sight, either way, or a zero vector): keep the previous roll by
        // handing the builder the screen-up we already realized. It stays perpendicular to the view, so
        // the camera keeps looking at the target. If even that is parallel now, leave the up untouched.
        const keep = screenUpFor(lastScreenUp, dir);
        if (keep !== null) {
            camera.upVector.set(keep.x, keep.y, keep.z);
            lastScreenUp = keep;
        }
    }

    return { camera, bank };
}
