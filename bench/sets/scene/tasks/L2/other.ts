import { addClusteredLightContainer } from "@babylonjs/lite";
import type { ClusteredLightContainer, ClusteredPointLight, SceneContext } from "@babylonjs/lite";

// Another right answer: push a plain lamp record into the container's list, then rebuild the
// scene's clustered state by registering the container again.
export function addLamp(scene: SceneContext, lamps: ClusteredLightContainer, position: [number, number, number], reach: number): ClusteredPointLight {
    const lamp: ClusteredPointLight = { position: [...position], diffuse: [1, 0.85, 0.6], range: reach, intensity: 1 };
    lamps.pointLights = [...lamps.pointLights, lamp];
    addClusteredLightContainer(scene, lamps);
    return lamp;
}
