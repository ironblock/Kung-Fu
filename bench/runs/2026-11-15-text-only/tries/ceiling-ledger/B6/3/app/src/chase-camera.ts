import type { FreeCamera } from "@babylonjs/lite";
// ASSUMPTION (unverified): createBankedFreeCamera is exported publicly and
// takes (position, target, up) like the internal _createFreeCamera it wraps.
// The ledger only confirms the internal call, not the public signature.
import { createBankedFreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface ChaseCamera {
    camera: FreeCamera;
    bank(up: Vec): void;
}

// Below this length, the part of `up` across the line of sight is treated as
// zero: `up` lies along the line of sight and gives no roll information.
const DEGENERATE = 1e-6;

const dot = (a: Vec, b: Vec) => a.x * b.x + a.y * b.y + a.z * b.z;
const len = (a: Vec) => Math.sqrt(dot(a, a));
const scale = (a: Vec, s: number): Vec => ({ x: a.x * s, y: a.y * s, z: a.z * s });
const sub = (a: Vec, b: Vec): Vec => ({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z });

/**
 * The component of `up` perpendicular to `forward` (a unit vector), normalized;
 * or null when `up` points along `forward` (either way) and no roll follows.
 */
function rollUp(up: Vec, forward: Vec): Vec | null {
    const across = sub(up, scale(forward, dot(up, forward)));
    const l = len(across);
    return l < DEGENERATE ? null : scale(across, 1 / l);
}

export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
    const toTarget = sub(target, eye);
    const dist = len(toTarget);
    if (dist === 0) throw new Error("createChaseCamera: eye and target coincide");
    const forward = scale(toTarget, 1 / dist);

    // Start upright: world +Y, projected across the line of sight. If the
    // camera looks straight up or down, fall back to world +Z.
    const initialUp = rollUp({ x: 0, y: 1, z: 0 }, forward) ?? rollUp({ x: 0, y: 0, z: 1 }, forward)!;

    const camera = createBankedFreeCamera(
        { x: eye.x, y: eye.y, z: eye.z },
        { x: target.x, y: target.y, z: target.z },
        { ...initialUp },
    ) as FreeCamera;

    function bank(up: Vec): void {
        const next = rollUp(up, forward);
        // Up along the line of sight: keep the previous roll, change nothing.
        if (next === null) return;
        // ASSUMPTION (unverified): the banked camera exposes a writable `up`
        // that its view matrix is built from. Mutate in place so any reference
        // the library holds sees the change.
        const camUp = (camera as unknown as { up: Vec }).up;
        camUp.x = next.x;
        camUp.y = next.y;
        camUp.z = next.z;
        // ASSUMPTION (unverified): the view matrix is cached on
        // worldMatrixVersion (+ projection revision). If writing `up` does not
        // bump worldMatrixVersion, the old view stays cached; bump it here.
        const c = camera as unknown as { worldMatrixVersion?: number };
        if (typeof c.worldMatrixVersion === "number") c.worldMatrixVersion++;
    }

    return { camera, bank };
}
