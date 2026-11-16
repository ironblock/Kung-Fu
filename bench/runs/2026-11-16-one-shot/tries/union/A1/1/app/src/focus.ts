import type { ArcRotateCamera } from "@babylonjs/lite";

type AngleChannel = "alpha" | "beta" | "radius";

function limitsOf(camera: ArcRotateCamera, channel: AngleChannel): [number | undefined, number | undefined] {
    switch (channel) {
        case "alpha":
            return [camera.lowerAlphaLimit, camera.upperAlphaLimit];
        case "beta":
            return [camera.lowerBetaLimit, camera.upperBetaLimit];
        case "radius":
            return [camera.lowerRadiusLimit, camera.upperRadiusLimit];
    }
}

// The camera only picks up a target change on an alpha/beta/radius write that
// changes the value; writes to target alone do not mark it dirty (notes 3, 11).
// So move one channel by a tiny step and straight back. Both writes stay inside
// the limits, so no clamp runs and no inertial offset is zeroed.
function markDirty(camera: ArcRotateCamera): void {
    for (const channel of ["radius", "alpha", "beta"] as const) {
        const value = camera[channel];
        const [lower, upper] = limitsOf(camera, channel);
        const step = Math.max(Math.abs(value), 1) * 1e-6;
        const fits = (x: number) =>
            (lower === undefined || x >= lower) && (upper === undefined || x <= upper);
        const nudged = [value + step, value - step].find(fits);
        if (nudged === undefined || nudged === value) continue;
        camera[channel] = nudged;
        camera[channel] = value;
        return;
    }
}

export function focusOn(camera: ArcRotateCamera, point: { x: number; y: number; z: number }): void {
    // The orbit centre becomes the point. Angles and radius are not changed, so
    // the eye moves by the same offset (point - old centre) and looks at the point.
    // Write the fields in place: the camera reads target.x/y/z, not the object.
    const target = camera.target;
    target.x = point.x;
    target.y = point.y;
    target.z = point.z;
    markDirty(camera);
}
