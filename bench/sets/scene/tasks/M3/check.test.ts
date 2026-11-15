import { withGpu, worldPosition } from "./scene-helpers-m";
import { describe, expect, it } from "vitest";
import { addToScene, createBox, createSphere, setParent } from "@babylonjs/lite";
import { removeKeepingAttached } from "../src/remove-keep";
import { makeScene } from "./helpers";

function rig() {
    const scene = makeScene();
    const engine = withGpu(scene.surface.engine);
    const table = createBox(engine, { width: 2, height: 1, depth: 1 });
    table.position.set(4, 0, 2);
    table.rotation.set(0, Math.PI / 2, 0);
    const lamp = createSphere(engine, { diameter: 0.4 });
    lamp.position.set(4.5, 0.8, 2);
    const vase = createBox(engine, 0.2);
    vase.position.set(3.5, 0.6, 1.5);
    setParent(lamp, table);
    setParent(vase, table);
    addToScene(scene, table);
    const lampAt = worldPosition(lamp);
    const vaseAt = worldPosition(vase);
    return { scene, table, lamp, vase, lampAt, vaseAt };
}

function expectNear(actual: number[], expected: number[]): void {
    for (let i = 0; i < 3; i++) {
        expect(actual[i]).toBeCloseTo(expected[i]!, 5);
    }
}

describe("M3 remove a mesh but keep what is attached to it", () => {
    it("takes the mesh out of the scene", () => {
        const { scene, table } = rig();
        expect(scene.meshes).toContain(table);
        removeKeepingAttached(scene, table);
        expect(scene.meshes).not.toContain(table);
    });

    it("keeps each attached mesh in the scene, once", () => {
        const { scene, table, lamp, vase } = rig();
        removeKeepingAttached(scene, table);
        expect(scene.meshes.filter((m) => m === lamp)).toHaveLength(1);
        expect(scene.meshes.filter((m) => m === vase)).toHaveLength(1);
    });

    it("leaves the attached meshes where they were in the world, no longer attached", () => {
        const { scene, table, lamp, vase, lampAt, vaseAt } = rig();
        removeKeepingAttached(scene, table);
        expect(lamp.parent).not.toBe(table);
        expect(vase.parent).not.toBe(table);
        expectNear(worldPosition(lamp), lampAt);
        expectNear(worldPosition(vase), vaseAt);
        table.position.set(-20, 0, 0);
        expectNear(worldPosition(lamp), lampAt);
    });
});
