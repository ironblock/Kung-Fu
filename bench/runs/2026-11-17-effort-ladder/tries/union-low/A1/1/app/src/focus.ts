import type { ArcRotateCamera } from "@babylonjs/lite";

export function focusOn(camera: ArcRotateCamera, point: { x: number; y: number; z: number }): void {
    // Write target components in place (note 3: assigning a new object or
    // relying on the write alone does not invalidate the camera's caches).
    camera.target.x = point.x;
    camera.target.y = point.y;
    camera.target.z = point.z;

    // Force an immediate view-matrix rebuild.  Per note 3 the target change
    // only surfaces at the next alpha/beta/radius write that *changes* the
    // value, so we nudge alpha by a tiny epsilon and restore it.  Two writes
    // that each change the value guarantee the cache is rebuilt with the new
    // target and the original angles.
    const a = camera.alpha;
    camera.alpha = a + 1e-7;
    camera.alpha = a;
}
