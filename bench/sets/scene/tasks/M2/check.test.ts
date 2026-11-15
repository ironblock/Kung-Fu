import { withGpu, worldPosition } from "./scene-helpers-m";
import { describe, expect, it } from "vitest";
import { addToScene, createBox, setMeshVisible } from "@babylonjs/lite";
import { groupParts } from "../src/group";
import { makeScene } from "./helpers";

function rig() {
    const scene = makeScene();
    const engine = withGpu(scene.surface.engine);
    const top = createBox(engine, { width: 2, height: 0.1, depth: 1 });
    top.position.set(1, 2, 3);
    const leg = createBox(engine, 0.1);
    leg.position.set(-1, 1, 0.5);
    const parts = [top, leg];
    const group = groupParts("table", parts);
    return { scene, parts, group, top, leg };
}

describe("M2 group parts under one node", () => {
    it("names the node, leaves it at the origin and does not move the parts", () => {
        const { group, top, leg } = rig();
        expect(group.name).toBe("table");
        expect(worldPosition(group)).toEqual([0, 0, 0]);
        expect(worldPosition(top)).toEqual([1, 2, 3]);
        expect(worldPosition(leg)).toEqual([-1, 1, 0.5]);
    });

    it("moves the parts with the node", () => {
        const { group, top, leg } = rig();
        group.position.set(10, 0, -4);
        expect(worldPosition(top)).toEqual([11, 2, -1]);
        expect(worldPosition(leg)).toEqual([9, 1, -3.5]);
        group.scaling.set(2, 2, 2);
        expect(worldPosition(top)).toEqual([12, 4, 2]);
    });

    it("adds every part when the node is added to a scene", () => {
        const { scene, group, parts } = rig();
        addToScene(scene, group);
        for (const part of parts) {
            expect(scene.meshes.filter((m) => m === part)).toHaveLength(1);
        }
    });

    it("hides every part when the node is hidden with its subtree", () => {
        const { group, parts } = rig();
        setMeshVisible(group, false);
        for (const part of parts) {
            expect(part.visible).toBe(false);
        }
        setMeshVisible(group, true);
        for (const part of parts) {
            expect(part.visible).not.toBe(false);
        }
    });
});
