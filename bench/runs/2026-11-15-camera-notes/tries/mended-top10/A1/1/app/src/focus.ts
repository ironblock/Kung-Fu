import type { ArcRotateCamera } from "@babylonjs/lite";

// Makes the camera's cached view matrix rebuild on its next read. Writing
// target.x/y/z in place does not mark it dirty (camera-notes.md, item 5), so we
// change alpha, beta or radius by a tiny amount and then restore the exact
// original value. The final angles and distance are unchanged. If a limit
// clamps the write back to the original value, nothing changed, so we try the
// next field.
function markViewDirty(camera: ArcRotateCamera): void {
    const eps = 1e-9;
    const fields = ["alpha", "beta", "radius"] as const;
    for (const key of fields) {
        const original = camera[key];
        camera[key] = original + eps;
        const changed = camera[key] !== original;
        camera[key] = original;
        if (changed) {
            return;
        }
    }
}

// Orbit `point`: the camera keeps its alpha, beta and radius, so it moves by the
// same offset as the old target to `point`, and it looks straight at `point`.
export function focusOn(camera: ArcRotateCamera, point: { x: number; y: number; z: number }): void {
    const { x, y, z } = point;

    // Edit the existing target object in place so the camera keeps the same Vec3.
    const target = camera.target;
    target.x = x;
    target.y = y;
    target.z = z;

    markViewDirty(camera);

    // Read the world matrix now so the view is rebuilt within this call and
    // code that runs straight after sees the new position and view.
    void camera.worldMatrix;
}
