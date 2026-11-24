import {
    createClusteredPointLight,
    markClusteredLightContainerDirty,
} from "@babylonjs/lite";
import type { ClusteredLightContainer, ClusteredPointLight, SceneContext } from "@babylonjs/lite";

const LAMP_COLOR: [number, number, number] = [1, 0.85, 0.6];
const LAMP_INTENSITY = 1;

/**
 * Adds one warm point lamp to `lamps`, the clustered light container that is
 * already registered on `scene`. Existing lamps are not touched.
 * The returned lamp is an element of `lamps.pointLights`.
 */
export function addLamp(
    scene: SceneContext,
    lamps: ClusteredLightContainer,
    position: [number, number, number],
    reach: number,
): ClusteredPointLight {
    void scene; // the container is already registered on the scene; nothing else to do here

    const lamp = createClusteredPointLight(lamps, {
        position: [position[0], position[1], position[2]],
        diffuse: [LAMP_COLOR[0], LAMP_COLOR[1], LAMP_COLOR[2]],
        range: reach,
        intensity: LAMP_INTENSITY,
    });

    // Make sure the new lamp is in the container even if the creator did not add it.
    if (!lamps.pointLights.includes(lamp)) {
        lamps.pointLights.push(lamp);
    }

    // Tell the clustered light system that the lamp list changed so the next frame picks it up.
    markClusteredLightContainerDirty(lamps);

    return lamp;
}
