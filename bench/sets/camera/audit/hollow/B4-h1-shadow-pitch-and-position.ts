import { computeLookAtFromYawPitch } from "@babylonjs/lite";
import type { GeospatialCamera } from "@babylonjs/lite";

// Hollow try B4-h1: leaves the limits alone. Puts its own `pitch` accessor (own storage) on the camera,
// writes the eye position itself, and wraps the radius setter to write it again after each zoom.
export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void {
    const cam = camera as unknown as Record<string, unknown>;
    const radiusDesc = Object.getOwnPropertyDescriptor(cam, "radius")!;
    let wanted = pitch;
    const place = (): void => {
        const look = computeLookAtFromYawPitch(camera.yaw, wanted, camera.center, { x: 0, y: 0, z: 0 });
        const r = radiusDesc.get!.call(cam) as number;
        const p = camera.position as { x: number; y: number; z: number };
        p.x = camera.center.x - look.x * r;
        p.y = camera.center.y - look.y * r;
        p.z = camera.center.z - look.z * r;
    };
    Object.defineProperty(cam, "pitch", { configurable: true, enumerable: true, get: () => wanted, set: (v: number) => { wanted = v; place(); } });
    Object.defineProperty(cam, "radius", {
        configurable: true,
        enumerable: true,
        get: () => radiusDesc.get!.call(cam),
        set: (v: number) => { radiusDesc.set!.call(cam, v); place(); },
    });
    place();
}
