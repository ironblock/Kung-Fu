import {
    createClusteredPointLight,
    markClusteredLightContainerDirty,
} from "@babylonjs/lite";
import type { ClusteredLightContainer, ClusteredPointLight, SceneContext } from "@babylonjs/lite";

/** Warm street-lamp colour in linear RGB. */
const LAMP_COLOUR: [number, number, number] = [1, 0.85, 0.6];

/**
 * Add one warm lamp to a clustered light container that is already registered on `scene`.
 *
 * The lamp is pushed onto `lamps.pointLights` by `createClusteredPointLight`, and the
 * container is marked dirty so its GPU light data is re-uploaded on the next frame.
 *
 * @param scene - The scene the container is registered on.
 * @param lamps - The clustered light container already registered on `scene`.
 * @param position - World-space position `[x, y, z]` of the lamp.
 * @param reach - Falloff range in world units: everything within `reach` of `position` is lit.
 * @returns The new lamp, which is one of `lamps.pointLights`.
 */
export function addLamp(
    scene: SceneContext,
    lamps: ClusteredLightContainer,
    position: [number, number, number],
    reach: number,
): ClusteredPointLight {
    const lamp = createClusteredPointLight(lamps, {
        position,
        diffuse: LAMP_COLOUR,
        range: reach,
        intensity: 1,
    });
    markClusteredLightContainerDirty(lamps);
    return lamp;
}
