// r13: light only some meshes. Each mesh's uniform block lists the lights that reach it; that list is
// written at build and rewritten only when the mesh's world matrix changes or the light count changes.
import { makeGpuScene, frame } from "./scene-helpers";
import { describe, expect, it } from "vitest";
import { addToScene, createBox, createPointLight, createStandardMaterial, registerScene, removeFromScene } from "@babylonjs/lite";
import type { Mesh, PointLight } from "@babylonjs/lite";

/** Light indices in the newest upload of `mesh`'s uniform block (found by its world translation). */
function selection(device: ReturnType<typeof makeGpuScene>["device"], mesh: Mesh): number[] | null {
    const m = mesh.worldMatrix;
    const w = device.log.writes
        .map((x) => x.data as Float32Array)
        .filter((d) => d.length >= 24 && d[12] === Math.fround(m[12]!) && d[13] === Math.fround(m[13]!) && d[14] === Math.fround(m[14]!) && d[15] === 1)
        .at(-1);
    if (!w) return null;
    const u = new Uint32Array(w.buffer, w.byteOffset, w.length);
    return Array.from(u.slice(20, 20 + u[16]!));
}

async function setup(before?: (a: PointLight, b: PointLight, box: Mesh) => void) {
    const g = makeGpuScene({ renderTask: true });
    const box = createBox(g.engine, 1);
    box.material = createStandardMaterial();
    box.position.set(7, 0.25, -3);
    const a = createPointLight([0, 3, 0]);
    const b = createPointLight([3, 3, 0]);
    addToScene(g.scene, box);
    addToScene(g.scene, a);
    addToScene(g.scene, b);
    before?.(a, b, box);
    await registerScene(g.scene);
    frame(g.engine, g.scene);
    return { ...g, box, a, b };
}

describe("r13 light selection", () => {
    it("set before registerScene: excludedMeshes / includedOnlyMeshes decide the mesh's light list", async () => {
        expect(selection((await setup()).device, (await setup()).box)).toEqual([0, 1]);
        const ex = await setup((_a, b, box) => (b.excludedMeshes = new Set([box])));
        expect(selection(ex.device, ex.box)).toEqual([0]);
        const inc = await setup((_a, b, box) => (b.includedOnlyMeshes = new Set([box])));
        expect(selection(inc.device, inc.box)).toEqual([0, 1]);
        const other = await setup((a) => (a.includedOnlyMeshes = new Set([createBox(inc.engine, 1)])));
        expect(selection(other.device, other.box)).toEqual([1]);
    });

    it("includedOnlyMeshIds by name matches nothing: mesh.id is unset unless you set it", async () => {
        const r = await setup((a, _b, box) => {
            expect(box.id).toBeUndefined();
            a.includedOnlyMeshIds = new Set([box.name]);
        });
        expect(selection(r.device, r.box)).toEqual([1]);
        const withId = await setup((a, _b, box) => {
            box.id = "crate";
            a.includedOnlyMeshIds = new Set(["crate"]);
        });
        expect(selection(withId.device, withId.box)).toEqual([0, 1]);
        const exId = await setup((a, _b, box) => {
            box.id = "crate";
            a.excludedMeshIds = new Set(["crate"]);
        });
        expect(selection(exId.device, exId.box)).toEqual([1]);
    });

    it("without a world-matrix change after setting excludedMeshes at runtime, the old list stays", async () => {
        const s = await setup();
        s.b.excludedMeshes = new Set([s.box]);
        frame(s.engine, s.scene);
        frame(s.engine, s.scene);
        expect(selection(s.device, s.box)).toEqual([0, 1]);
        s.box.position.set(7, 0.25, -3.0001);
        frame(s.engine, s.scene);
        expect(selection(s.device, s.box)).toEqual([0]);
    });

    it("a runtime change is also applied, with no world-matrix change, when a light is added to or removed from the scene", async () => {
        const s = await setup();
        s.b.excludedMeshes = new Set([s.box]);
        frame(s.engine, s.scene);
        expect(selection(s.device, s.box)).toEqual([0, 1]);
        const c = createPointLight([0, 5, 0]);
        addToScene(s.scene, c);
        frame(s.engine, s.scene);
        expect(selection(s.device, s.box)).toEqual([0, 2]);

        const r = await setup();
        r.b.excludedMeshes = new Set([r.box]);
        const extra = createPointLight([0, 6, 0]);
        addToScene(r.scene, extra);
        frame(r.engine, r.scene);
        expect(selection(r.device, r.box)).toEqual([0, 2]);
        r.b.excludedMeshes = new Set();
        frame(r.engine, r.scene);
        expect(selection(r.device, r.box)).toEqual([0, 2]);
        removeFromScene(r.scene, extra);
        frame(r.engine, r.scene);
        expect(selection(r.device, r.box)).toEqual([0, 1]);
    });
});
