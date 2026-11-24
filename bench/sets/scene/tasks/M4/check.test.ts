import { withGpu, worldPosition } from "./scene-helpers-m";
import { describe, expect, it } from "vitest";
import { addToScene, createBox, createTransformNode } from "@babylonjs/lite";
import type { Mesh, TransformNode } from "@babylonjs/lite";
import { duplicateAlongShelf } from "../src/duplicate";
import { makeScene } from "./helpers";

function rig() {
    const scene = makeScene();
    const engine = withGpu(scene.surface.engine);
    const s = Math.SQRT1_2;
    // A shelf at (10, 1, 0), turned a quarter turn about +Y.
    const shelf = createTransformNode("shelf", 10, 1, 0, 0, s, 0, s);
    const book = createBox(engine, { width: 0.2, height: 1, depth: 0.7 });
    book.position.set(1, 0.5, 0);
    book.rotation.set(0, 0, 0.1);
    book.parent = shelf;
    shelf.children.push(book);
    addToScene(scene, shelf);
    return { scene, shelf, book };
}

/** Where a point given in the shelf's own frame lands in the world. */
function shelfToWorld(shelf: TransformNode, x: number, y: number, z: number): number[] {
    const m = shelf.worldMatrix;
    return [0, 1, 2].map((r) => m[r]! * x + m[4 + r]! * y + m[8 + r]! * z + m[12 + r]!);
}

function expectNear(actual: number[], expected: number[]): void {
    for (let i = 0; i < 3; i++) {
        expect(actual[i]).toBeCloseTo(expected[i]!, 5);
    }
}

describe("M4 duplicate a book along its shelf", () => {
    it("returns a new mesh in the scene, the original unchanged", () => {
        const { scene, book } = rig();
        const before = worldPosition(book);
        const copy = duplicateAlongShelf(scene, book, 0.3);
        expect(copy).not.toBe(book);
        expect(scene.meshes).toContain(copy);
        expect(scene.meshes).toContain(book);
        expectNear(worldPosition(book), before);
    });

    it("puts the copy dx along the shelf's own x axis", () => {
        const { scene, shelf, book } = rig();
        const copy: Mesh = duplicateAlongShelf(scene, book, 0.3);
        expectNear(worldPosition(copy), shelfToWorld(shelf, 1.3, 0.5, 0));
    });

    it("keeps the copy's size and turn equal to the book's", () => {
        const { scene, book } = rig();
        const copy = duplicateAlongShelf(scene, book, 0.3);
        const a = book.worldMatrix;
        const b = copy.worldMatrix;
        for (let i = 0; i < 12; i++) {
            expect(b[i]).toBeCloseTo(a[i]!, 5);
        }
    });

    it("moves the copy with the shelf afterwards", () => {
        const { scene, shelf, book } = rig();
        const copy = duplicateAlongShelf(scene, book, -0.4);
        shelf.position.set(-3, 2, 5);
        shelf.rotationQuaternion.set(0, 0, 0, 1);
        expectNear(worldPosition(copy), shelfToWorld(shelf, 0.6, 0.5, 0));
    });
});
