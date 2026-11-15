import { addClusteredLightContainer, createClusteredPointLight } from "@babylonjs/lite";
import type { ClusteredLightContainer, ClusteredPointLight, SceneContext } from "@babylonjs/lite";

export function addLamp(scene: SceneContext, lamps: ClusteredLightContainer, position: [number, number, number], reach: number): ClusteredPointLight {
    const lamp = createClusteredPointLight(lamps, { position, diffuse: [1, 0.85, 0.6], intensity: 1, range: reach });
    // The GPU state of a registered container has a fixed light capacity: register it again so the
    // scene builds state large enough for the new lamp.
    addClusteredLightContainer(scene, lamps);
    return lamp;
}
