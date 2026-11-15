import type { SceneContext } from "@babylonjs/lite";

// The fog config type is derived from the public scene type, so the compiler
// checks the literal below against the real library definition.
type FogConfig = NonNullable<SceneContext["fog"]>;

// Nothing is fogged nearer than FOG_START units from the camera; from FOG_END
// units on, everything is fully the fog colour.
const FOG_START = 30;
const FOG_END = 120;

// Pale grey-blue.
const MIST_COLOR: [number, number, number] = [0.75, 0.8, 0.88];

export function addMist(scene: SceneContext): void {
    const fog: FogConfig = {
        mode: "linear",
        start: FOG_START,
        end: FOG_END,
        color: MIST_COLOR,
    };
    scene.fog = fog;
}
