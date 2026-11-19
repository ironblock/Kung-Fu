import type { GeospatialCamera, GeospatialLimits } from "@babylonjs/lite";

// The camera clamps by the limits object it was made with, so each numeric limit of the mode is
// copied into it, rather than replacing the object.
export function useModeLimits(camera: GeospatialCamera, limits: GeospatialLimits): void {
    const target = camera.limits as unknown as Record<string, unknown>;
    for (const [k, v] of Object.entries(limits)) {
        if (typeof v === "number") target[k] = v;
    }
}
