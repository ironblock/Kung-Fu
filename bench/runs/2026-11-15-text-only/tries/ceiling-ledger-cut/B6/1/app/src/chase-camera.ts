import { createFreeCamera } from "@babylonjs/lite";
import type { FreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface ChaseCamera {
    camera: FreeCamera;
    bank(up: Vec): void;
}

// Below this length the requested up has no usable component across the
// line of sight (it points along it, either way), so the roll is undefined.
const DEGENERATE = 1e-6;

/*
 * UNVERIFIED LIBRARY ASSUMPTIONS (the camera ledger does not establish these):
 *  1. `createFreeCamera(position, target)` is the public constructor.
 *  2. A FreeCamera has an `up` vector with `.set(x, y, z)`, and that vector is
 *     the up argument of the look-at that builds its view matrix.
 *  3. Writing `up` invalidates the cached view matrix (the ledger only says
 *     position/target are observable). As a precaution, bank() re-sets the
 *     target after changing up.
 */
export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
    const camera = (createFreeCamera as unknown as (p: Vec, t: Vec) => FreeCamera)(
        { x: eye.x, y: eye.y, z: eye.z },
        { x: target.x, y: target.y, z: target.z },
    );
    const cam = camera as unknown as {
        position: Vec & { set(x: number, y: number, z: number): void };
        target: Vec & { set(x: number, y: number, z: number): void };
        up: Vec & { set(x: number, y: number, z: number): void };
    };

    cam.position.set(eye.x, eye.y, eye.z);
    cam.target.set(target.x, target.y, target.z);
    cam.up.set(0, 1, 0); // start upright

    function bank(up: Vec): void {
        const p = cam.position;
        const t = cam.target;

        // Line of sight.
        let fx = t.x - p.x;
        let fy = t.y - p.y;
        let fz = t.z - p.z;
        const fl = Math.hypot(fx, fy, fz);
        if (fl === 0) return; // no line of sight; nothing to roll about
        fx /= fl;
        fy /= fl;
        fz /= fl;

        // Closest up the camera can have while still looking at the target:
        // the requested up with its component along the line of sight removed.
        const d = up.x * fx + up.y * fy + up.z * fz;
        let ux = up.x - d * fx;
        let uy = up.y - d * fy;
        let uz = up.z - d * fz;
        const ul = Math.hypot(ux, uy, uz);

        // Up along the line of sight (either way): keep the previous roll and
        // leave position and target untouched.
        if (!(ul > DEGENERATE)) return;

        ux /= ul;
        uy /= ul;
        uz /= ul;
        cam.up.set(ux, uy, uz);
        // Precaution for assumption 3: touch the observable target (same
        // value) so the view matrix is rebuilt with the new up.
        cam.target.set(t.x, t.y, t.z);
    }

    return { camera, bank };
}
