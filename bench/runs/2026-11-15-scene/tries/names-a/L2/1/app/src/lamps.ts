import {
    createClusteredPointLight,
    markClusteredLightContainerDirty,
} from "@babylonjs/lite";
import type { ClusteredLightContainer, ClusteredPointLight, SceneContext } from "@babylonjs/lite";

const LAMP_COLOUR: readonly [number, number, number] = [1, 0.85, 0.6];
const LAMP_INTENSITY = 1;

/**
 * Adds one warm point lamp to `lamps`, the clustered light container that is
 * already registered on `scene`. The lamp lights everything within `reach` of
 * `position`. The new lamp takes effect from the next frame; existing lamps are
 * not modified.
 */
export function addLamp(
    scene: SceneContext,
    lamps: ClusteredLightContainer,
    position: [number, number, number],
    reach: number,
): ClusteredPointLight {
    if (!Number.isFinite(reach) || reach <= 0) {
        throw new RangeError(`addLamp: reach must be a positive finite number, got ${reach}`);
    }
    if (scene._clusteredLightContainer !== undefined && scene._clusteredLightContainer !== lamps) {
        throw new Error("addLamp: lamps is not the clustered light container registered on this scene");
    }

    const light = createClusteredPointLight(lamps, {
        position: [position[0], position[1], position[2]],
        diffuse: [LAMP_COLOUR[0], LAMP_COLOUR[1], LAMP_COLOUR[2]],
        range: reach,
        intensity: LAMP_INTENSITY,
    });

    // Ensure the lamp is in the container's list exactly once, whether or not
    // createClusteredPointLight already appended it. Push in place rather than
    // reassigning the array, so existing references to pointLights stay valid.
    if (!lamps.pointLights.includes(light)) {
        lamps.pointLights.push(light);
    }

    // The container is already registered, so tell the clustered light system
    // to rebuild its GPU data for the new lamp.
    markClusteredLightContainerDirty(lamps);

    return light;
}
