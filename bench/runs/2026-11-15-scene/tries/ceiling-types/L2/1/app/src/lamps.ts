import { addClusteredLightContainer, createClusteredPointLight, markClusteredLightContainerDirty } from "@babylonjs/lite";
import type { ClusteredLightContainer, ClusteredPointLight, SceneContext } from "@babylonjs/lite";

/**
 * Add one warm street lamp to `lamps`, the clustered light container already registered on `scene`.
 * The lamp lights everything within `reach` of `position`. Returns the lamp, which is now one of
 * `lamps.pointLights`.
 *
 * Throws, leaving `lamps` as it was, when `position` is not finite or `reach` is not a positive number.
 */
export function addLamp(
    scene: SceneContext,
    lamps: ClusteredLightContainer,
    position: [number, number, number],
    reach: number,
): ClusteredPointLight {
    // Reject bad input before touching the container: a NaN or infinite light would be binned into
    // the same clusters as the lamps already there.
    const [x, y, z] = position;
    if (![x, y, z].every(Number.isFinite)) {
        throw new RangeError(`addLamp: position must be three finite numbers, got [${position.join(", ")}]`);
    }
    if (!(Number.isFinite(reach) && reach > 0)) {
        throw new RangeError(`addLamp: reach must be a positive number, got ${reach}`);
    }

    const lamp = createClusteredPointLight(lamps, {
        position: [x, y, z], // own copy: the caller may reuse its array for the next click
        diffuse: [1, 0.85, 0.6], // fresh array per lamp, so recolouring one lamp never recolours another
        range: reach,
        intensity: 1,
    });

    // The container's GPU state was sized for the lights it held when it was registered ("all lights
    // must be created before addClusteredLightContainer: the GPU state bakes the light capacity"), so
    // it has no slot for this lamp. Registering the container again rebuilds that state for all of its
    // current lights, old and new, and wires it into the scene's PBR materials.
    try {
        addClusteredLightContainer(scene, lamps);
    } catch (error) {
        // Take the lamp back out so the container never holds more lights than its GPU state has
        // room for, which would break the following frames for every lamp.
        const index = lamps.pointLights.indexOf(lamp);
        if (index !== -1) lamps.pointLights.splice(index, 1);
        markClusteredLightContainerDirty(lamps);
        throw error;
    }

    // Make sure the next frame uploads the light data, new lamp included.
    markClusteredLightContainerDirty(lamps);
    return lamp;
}
