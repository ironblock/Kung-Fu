import { describe, expect, it } from "vitest";
import { makeEngine, makeSceneOn } from "./scene-helpers-s";
import { createDirectionalLight } from "@babylonjs/lite";
import { addSunShadows } from "../src/sun-shadows";

function rig() {
    const engine = makeEngine();
    const scene = makeSceneOn(engine);
    const sun = createDirectionalLight([0.4, -1, 0.2], 1.1);
    sun.position.set(-40, 100, -20);
    const shadows = addSunShadows(engine, scene, sun);
    return { scene, sun, shadows };
}

describe("S2 shadows from the sun", () => {
    it("puts the sun in the scene once", () => {
        const { scene, sun } = rig();
        expect(scene.lights.filter((l) => l === sun)).toHaveLength(1);
    });

    it("returns a 2048 PCF shadow generator made for that sun", () => {
        const { sun, shadows } = rig();
        expect(shadows._shadowType).toBe("pcf");
        expect(shadows._light).toBe(sun);
        expect(shadows._config._mapSize).toBe(2048);
    });

    it("is a generator the scene's shadow pass renders", () => {
        // The shadow pass walks scene.lights and renders each light's shadowGenerator (frame-graph/shadow-task.ts).
        const { scene, shadows } = rig();
        const rendered = scene.lights.map((l) => l.shadowGenerator).filter((g) => g !== undefined);
        expect(rendered).toContain(shadows);
    });
});
