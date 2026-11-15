import { attachDevice } from "./scene-helpers";
import { createBox, createCapsule, createCylinder, createDisc, createGround, createLines, createNullEngine, createPlane, createPolyhedron, createSphere, createTorus, createTorusKnot } from "@babylonjs/lite";
import { describe, expect, it } from "vitest";

describe("n28: factory meshes: fixed shape name, no id, no material, receiveShadows false", () => {
    const engine = createNullEngine();
    attachDevice(engine);

    it("names are the shape names", () => {
        expect([createBox(engine), createSphere(engine), createGround(engine), createPlane(engine), createCylinder(engine), createTorus(engine)].map((m) => m.name)).toEqual([
            "box",
            "sphere",
            "ground",
            "plane",
            "cylinder",
            "torus",
        ]);
    });

    it("material is null, id undefined, receiveShadows false", () => {
        const box = createBox(engine);
        expect(box.material).toBeNull();
        expect(box.id).toBeUndefined();
        expect(box.receiveShadows).toBe(false);
    });

    it("boundMin/boundMax are local geometry bounds and do not follow position or scaling", () => {
        const box = createBox(engine, { width: 2, height: 4, depth: 6 });
        box.position.set(10, 0, 0);
        box.scaling.set(3, 3, 3);
        expect(box.boundMin).toEqual([-1, -2, -3]);
        expect(box.boundMax).toEqual([1, 2, 3]);
    });

    it("the other shape factories also give no id, a null material and receiveShadows false", () => {
        for (const m of [createSphere(engine), createGround(engine), createPlane(engine), createCylinder(engine), createTorus(engine), createCapsule(engine), createDisc(engine), createPolyhedron(engine), createTorusKnot(engine)]) {
            expect(m.id).toBeUndefined();
            expect(m.material).toBeNull();
            expect(m.receiveShadows).toBe(false);
        }
    });

    it("createLines is not like them: it takes a name option and comes with a material", () => {
        const lines = createLines(engine, { name: "path", points: [{ x: 0, y: 0, z: 0 }, { x: 1, y: 1, z: 1 }] } as never);
        expect(lines.name).toBe("path");
        expect(lines.material).not.toBeNull();
    });
});
