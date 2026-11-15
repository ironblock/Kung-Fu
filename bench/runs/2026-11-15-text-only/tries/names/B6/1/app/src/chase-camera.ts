import { createBankedFreeCamera, type FreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };
export interface ChaseCamera { camera: FreeCamera; bank(up: Vec): void }

const WORLD_UP: Vec = { x: 0, y: 1, z: 0 };
const FALLBACK_UP: Vec = { x: 0, y: 0, z: 1 };
const DEGENERATE_EPS = 1e-6;

function len(a: Vec): number {
    return Math.hypot(a.x, a.y, a.z);
}

// Returns the unit vector of `up` with its component along the unit forward
// direction removed, i.e. the screen-up a camera looking along `fwd` gets when
// it is rolled to match `up` as closely as possible. Returns null when `up` is
// (numerically) parallel to `fwd`, or zero, so no roll is defined.
function rollUpFor(up: Vec, fwd: Vec): Vec | null {
    const ul = len(up);
    if (ul < DEGENERATE_EPS) return null;
    const ux = up.x / ul, uy = up.y / ul, uz = up.z / ul;
    const d = ux * fwd.x + uy * fwd.y + uz * fwd.z;
    const px = ux - d * fwd.x;
    const py = uy - d * fwd.y;
    const pz = uz - d * fwd.z;
    const pl = Math.hypot(px, py, pz);
    if (pl < DEGENERATE_EPS) return null;
    return { x: px / pl, y: py / pl, z: pz / pl };
}

export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
    const dx = target.x - eye.x, dy = target.y - eye.y, dz = target.z - eye.z;
    const dl = Math.hypot(dx, dy, dz);
    if (dl < DEGENERATE_EPS) throw new Error("createChaseCamera: eye and target coincide");
    const fwd: Vec = { x: dx / dl, y: dy / dl, z: dz / dl };

    // Start upright: world up with the forward component removed. If the view
    // is vertical, fall back to another axis.
    const start = rollUpFor(WORLD_UP, fwd) ?? rollUpFor(FALLBACK_UP, fwd)!;
    const camera = createBankedFreeCamera(eye, target, start);

    return {
        camera,
        bank(up: Vec): void {
            const roll = rollUpFor(up, fwd);
            // Parallel to the line of sight: keep the previous roll and target.
            if (roll === null) return;
            const v = camera.upVector;
            v.x = roll.x;
            v.y = roll.y;
            v.z = roll.z;
        },
    };
}
