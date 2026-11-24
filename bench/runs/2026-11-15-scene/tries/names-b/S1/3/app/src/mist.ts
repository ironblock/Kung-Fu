import type { SceneContext } from "@babylonjs/lite";

// Light morning mist: linear distance fog.
// Nothing is fogged nearer than FOG_START units from the camera; from FOG_END
// units on, everything is fully the fog colour.
const FOG_START = 30;
const FOG_END = 120;
const FOG_COLOR: [number, number, number] = [0.75, 0.8, 0.88];

export function addMist(scene: SceneContext): void {
    // Typed from the scene's own FogConfig so the compiler checks the field
    // names and value shapes against the library's real definition.
    const fog: NonNullable<SceneContext["fog"]> = {
        mode: "linear",
        start: FOG_START,
        end: FOG_END,
        color: FOG_COLOR,
    };
    scene.fog = fog;
}
