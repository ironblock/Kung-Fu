import type { ClusteredLightContainer, ClusteredPointLight, SceneContext } from "@babylonjs/lite";
import { rebuildSceneRenderables } from "@babylonjs/lite";

// Adds one warm street lamp to a clustered light container that is already
// registered on `scene`, and returns the new lamp.
//
// ASSUMPTIONS, NOT VERIFIED (the library source is not available here):
//  - Lamps are plain ClusteredPointLight records with `position`, `color`,
//    `intensity` and `range` fields.
//  - Pushing onto `lamps.pointLights` is enough to add the lamp to the container.
//  - rebuildSceneRenderables(scene) (documented in scene-notes.md, item 1) makes
//    the new lamp take effect from the next frame without re-creating the
//    container or the existing lamps, which would change what they light.
export function addLamp(
    scene: SceneContext,
    lamps: ClusteredLightContainer,
    position: [number, number, number],
    reach: number,
): ClusteredPointLight {
    const lamp = {
        position: [position[0], position[1], position[2]],
        color: [1, 0.85, 0.6],
        intensity: 1,
        range: reach,
    } as unknown as ClusteredPointLight;

    // Append only: existing lamps keep their indices and their state.
    lamps.pointLights.push(lamp);

    rebuildSceneRenderables(scene);

    return lamp;
}
