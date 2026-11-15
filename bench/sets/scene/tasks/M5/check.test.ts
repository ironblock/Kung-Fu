import { withGpu } from "./scene-helpers-m";
import { describe, expect, it } from "vitest";
import { addThinInstance, createCylinder, createTranslationMat4 } from "@babylonjs/lite";
import type { Mesh } from "@babylonjs/lite";
import { removeTree } from "../src/forest";
import { makeScene } from "./helpers";

const PLACES: Record<string, [number, number]> = { oak: [0, 0], ash: [10, 1], elm: [20, 2], fir: [30, 3], yew: [40, 4], pine: [50, 5] };

function rig(): { forest: Mesh; ids: string[] } {
    const scene = makeScene();
    const engine = withGpu(scene.surface.engine);
    const forest = createCylinder(engine, { height: 3, diameter: 0.5 });
    const ids = Object.keys(PLACES);
    for (const id of ids) {
        const [x, z] = PLACES[id]!;
        addThinInstance(forest, createTranslationMat4(x, 0, z));
    }
    return { forest, ids };
}

/** Each drawn instance's (x, z), in instance order. */
function drawn(forest: Mesh): [number, number][] {
    const ti = forest.thinInstances!;
    const out: [number, number][] = [];
    for (let i = 0; i < ti.count; i++) {
        out.push([ti.matrices[i * 16 + 12]!, ti.matrices[i * 16 + 14]!]);
    }
    return out;
}

function expectListMatches(forest: Mesh, ids: string[]): void {
    const places = drawn(forest);
    expect(ids).toHaveLength(places.length);
    ids.forEach((id, i) => expect(places[i]).toEqual(PLACES[id]));
}

describe("M5 cut down one tree", () => {
    it("stops drawing the tree and keeps the id list in step with the instances", () => {
        const { forest, ids } = rig();
        removeTree(forest, ids, "ash");
        expect(forest.thinInstances!.count).toBe(5);
        expect(ids).not.toContain("ash");
        expectListMatches(forest, ids);
    });

    it("leaves every other tree where it was", () => {
        const { forest, ids } = rig();
        removeTree(forest, ids, "elm");
        const places = drawn(forest).map((p) => p.join(",")).sort();
        const expected = ["oak", "ash", "fir", "yew", "pine"].map((id) => PLACES[id]!.join(",")).sort();
        expect(places).toEqual(expected);
    });

    it("stays in step over several removals", () => {
        const { forest, ids } = rig();
        removeTree(forest, ids, "oak");
        removeTree(forest, ids, "fir");
        removeTree(forest, ids, "pine");
        expect(forest.thinInstances!.count).toBe(3);
        expectListMatches(forest, ids);
    });

    it("changes nothing for an unknown id", () => {
        const { forest, ids } = rig();
        removeTree(forest, ids, "birch");
        expect(forest.thinInstances!.count).toBe(6);
        expectListMatches(forest, ids);
    });
});
