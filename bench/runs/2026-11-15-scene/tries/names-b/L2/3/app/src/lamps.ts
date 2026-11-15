import {
    createClusteredPointLight,
    markClusteredLightContainerDirty,
} from "@babylonjs/lite";
import type { ClusteredLightContainer, ClusteredPointLight, SceneContext } from "@babylonjs/lite";

/**
 * Adds one warm street lamp to `lamps`, the clustered light container that is
 * already registered on `scene`.
 *
 * The existing lamps are left untouched: the new lamp is appended, so their
 * indices in `lamps.pointLights` do not change. The container is marked dirty
 * so the clustered light data is rebuilt and the lamp lights the scene from the
 * next frame on.
 */
export function addLamp(
    scene: SceneContext,
    lamps: ClusteredLightContainer,
    position: [number, number, number],
    reach: number,
): ClusteredPointLight {
    // The scene is not needed to create the lamp; the container is what is registered on it.
    void scene;

    const lamp = createClusteredPointLight(lamps, {
        position: [position[0], position[1], position[2]],
        diffuse: [1, 0.85, 0.6],
        range: reach,
        intensity: 1,
    });

    // Make sure the lamp is in the container's list exactly once, whether or not
    // createClusteredPointLight already appended it.
    if (!lamps.pointLights.includes(lamp)) {
        lamps.pointLights.push(lamp);
    }

    markClusteredLightContainerDirty(lamps);
    return lamp;
}
