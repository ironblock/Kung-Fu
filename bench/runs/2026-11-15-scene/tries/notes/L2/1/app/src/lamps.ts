import {
    createClusteredPointLight,
    markClusteredLightContainerDirty,
} from "@babylonjs/lite";
import type { ClusteredLightContainer, ClusteredPointLight, SceneContext } from "@babylonjs/lite";

// Adds one warm street lamp to a clustered light container that is already
// registered on `scene`. The lamp lights everything within `reach` of `position`.
// Marking the container dirty makes the change reach the GPU on the next frame,
// and the existing lamps are left untouched.
export function addLamp(
    scene: SceneContext,
    lamps: ClusteredLightContainer,
    position: [number, number, number],
    reach: number,
): ClusteredPointLight {
    const lamp = createClusteredPointLight(lamps, {
        position: [position[0], position[1], position[2]],
        diffuse: [1, 0.85, 0.6],
        range: reach,
        intensity: 1,
    });

    // The lamp must be one of lamps.pointLights. Add it only if the factory did not.
    if (!lamps.pointLights.includes(lamp)) {
        lamps.pointLights.push(lamp);
    }

    markClusteredLightContainerDirty(lamps);
    return lamp;
}
