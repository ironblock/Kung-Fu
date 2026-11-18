// Proof for AM8: every field of expected.json, shown by running the library.
// Run as app/checks/AM8.proof.test.ts with expected.json copied to app/checks/AM8.expected.json.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
    addAnimationGroup,
    clearAnimationManager,
    createAnimationManager,
    createPropertyAnimationClip,
    createPropertyAnimationGroup,
    getAnimationGroups,
    removeAnimationGroup,
    updateAnimationManager,
} from "@babylonjs/lite";

const expected = JSON.parse(readFileSync(fileURLToPath(new URL("./AM8.expected.json", import.meta.url)), "utf8")) as Record<string, number>;

const holdX = (name: string, x: number) => createPropertyAnimationClip(name, [{ path: "x", keys: [{ time: 0, value: x }, { time: 2, value: x }] }]);

function setUp() {
    const manager = createAnimationManager();
    const target = { x: 0 };
    const clipA = holdX("A", 10);
    const a = createPropertyAnimationGroup(manager, target, clipA);
    const b = createPropertyAnimationGroup(manager, target, holdX("B", 30));
    return { manager, target, clipA, a, b };
}

describe("AM8 proof", () => {
    it("xAtStart", () => {
        const { manager, target } = setUp();
        updateAnimationManager(manager, 16);
        expect(target.x).toBeCloseTo(expected.xAtStart!, 4);
    });

    it("xAfterReAddingA and indexOfAAfterReAddingA", () => {
        const { manager, target, a } = setUp();
        updateAnimationManager(manager, 16);
        removeAnimationGroup(manager, a);
        addAnimationGroup(manager, a);
        updateAnimationManager(manager, 16);
        expect(target.x).toBeCloseTo(expected.xAfterReAddingA!, 4);
        expect(getAnimationGroups(manager).indexOf(a)).toBe(expected.indexOfAAfterReAddingA);
    });

    it("xAfterClearThenBThenA", () => {
        const { manager, target, a, b } = setUp();
        updateAnimationManager(manager, 16);
        clearAnimationManager(manager);
        addAnimationGroup(manager, b);
        addAnimationGroup(manager, a);
        updateAnimationManager(manager, 16);
        expect(target.x).toBeCloseTo(expected.xAfterClearThenBThenA!, 4);
    });

    it("xAfterNewGroupForA", () => {
        const { manager, target, clipA } = setUp();
        updateAnimationManager(manager, 16);
        createPropertyAnimationGroup(manager, target, clipA);
        updateAnimationManager(manager, 16);
        expect(target.x).toBeCloseTo(expected.xAfterNewGroupForA!, 4);
    });
});
