// r03: make the directional shadow map cover the casters. The PCF/ESM light matrix is an ortho box fitted
// to each caster's local bounds × world matrix, looking from light.position, with depth range 1..10000.
import { makeGpuScene, frame, inShadowMap, lightClip } from "./scene-helpers";
import { describe, expect, it } from "vitest";
import {
    addToScene,
    createBox,
    createDirectionalLight,
    createEsmDirectionalShadowGenerator,
    createPcfDirectionalShadowGenerator,
    createStandardMaterial,
    registerSceneWithShadowSupport,
    setShadowTaskCasterMeshes,
    setThinInstances,
    enableThinInstanceWorldBounds,
} from "@babylonjs/lite";

function instances(xs: number[]): Float32Array {
    const m = new Float32Array(xs.length * 16);
    xs.forEach((x, i) => m.set([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, 0, 0, 1], i * 16));
    return m;
}

async function build(kind: "pcf" | "esm", o: { placeLight: boolean; thin?: boolean; widenBounds?: boolean; worldBounds?: boolean }) {
    const { engine, scene } = makeGpuScene({ renderTask: true });
    const box = createBox(engine, 1);
    box.material = createStandardMaterial();
    if (o.thin) {
        setThinInstances(box, instances([0, 20]), 2);
        if (o.worldBounds) enableThinInstanceWorldBounds(box);
        if (o.widenBounds) {
            box.boundMin = [-0.5, -0.5, -0.5];
            box.boundMax = [20.5, 0.5, 0.5];
        }
    }
    const light = createDirectionalLight([0, -1, 0]);
    expect([light.position.x, light.position.y, light.position.z]).toEqual([0, 0, 0]);
    if (o.placeLight) light.position.set(0, 50, 0);
    addToScene(scene, box);
    addToScene(scene, light);
    const sg = kind === "pcf" ? createPcfDirectionalShadowGenerator(engine, light) : createEsmDirectionalShadowGenerator(engine, light);
    light.shadowGenerator = sg;
    setShadowTaskCasterMeshes(sg, [box]);
    await registerSceneWithShadowSupport(scene);
    frame(engine, scene);
    return sg;
}

describe("r03 shadow map coverage", () => {
    for (const kind of ["pcf", "esm"] as const) {
        it(`${kind}: with the light placed back along its direction, the caster's corners are inside the map`, async () => {
            const sg = await build(kind, { placeLight: true });
            expect(inShadowMap(sg, [0.5, 0.5, 0.5])).toBe(true);
            expect(inShadowMap(sg, [-0.5, -0.5, -0.5])).toBe(true);
        });

        it(`${kind}: without placing the light (it stays at the origin), the caster's depth is below 0`, async () => {
            const sg = await build(kind, { placeLight: false });
            expect(lightClip(sg, [0, 0.5, 0])[2]).toBeLessThan(0);
            expect(lightClip(sg, [0, -0.5, 0])[2]).toBeLessThan(0);
        });

        it(`${kind}: thin instances outside the prototype's bounds fall outside the map unless the bounds are widened`, async () => {
            const narrow = await build(kind, { placeLight: true, thin: true });
            expect(inShadowMap(narrow, [0, 0.5, 0])).toBe(true);
            expect(inShadowMap(narrow, [20, 0.5, 0])).toBe(false);
            const flagged = await build(kind, { placeLight: true, thin: true, worldBounds: true });
            expect(inShadowMap(flagged, [20, 0.5, 0])).toBe(false);
            const wide = await build(kind, { placeLight: true, thin: true, widenBounds: true });
            expect(inShadowMap(wide, [20, 0.5, 0])).toBe(true);
            expect(inShadowMap(wide, [0, 0.5, 0])).toBe(true);
        });
    }

    it("a tilted light placed at -direction × 50 keeps a 1-unit box at the origin inside the map", async () => {
        for (const kind of ["pcf", "esm"] as const) {
            const { engine, scene } = makeGpuScene({ renderTask: true });
            const box = createBox(engine, 1);
            box.material = createStandardMaterial();
            const dir = [0.3, -1, 0.2];
            const sun = createDirectionalLight(dir as [number, number, number]);
            sun.position.set(-dir[0]! * 50, -dir[1]! * 50, -dir[2]! * 50);
            addToScene(scene, box);
            addToScene(scene, sun);
            const sg = kind === "pcf" ? createPcfDirectionalShadowGenerator(engine, sun) : createEsmDirectionalShadowGenerator(engine, sun);
            sun.shadowGenerator = sg;
            setShadowTaskCasterMeshes(sg, [box]);
            await registerSceneWithShadowSupport(scene);
            frame(engine, scene);
            for (const c of [[-0.5, -0.5, -0.5], [0.5, 0.5, 0.5], [0.5, -0.5, 0.5], [-0.5, 0.5, -0.5]] as const) {
                expect(inShadowMap(sg, c)).toBe(true);
            }
        }
    });

    it("a caster farther back than the light position (or within 1 unit in front of it) gets depth below 0; place the light beyond every caster", async () => {
        for (const kind of ["pcf", "esm"] as const) {
            const mk = async (lightY: number) => {
                const { engine, scene } = makeGpuScene({ renderTask: true });
                const near = createBox(engine, 1);
                near.material = createStandardMaterial();
                const tall = createBox(engine, 1);
                tall.material = createStandardMaterial();
                tall.position.set(0, 60, 0);
                const sun = createDirectionalLight([0, -1, 0]);
                sun.position.set(0, lightY, 0);
                addToScene(scene, near);
                addToScene(scene, tall);
                addToScene(scene, sun);
                const sg = kind === "pcf" ? createPcfDirectionalShadowGenerator(engine, sun) : createEsmDirectionalShadowGenerator(engine, sun);
                sun.shadowGenerator = sg;
                setShadowTaskCasterMeshes(sg, [near, tall]);
                await registerSceneWithShadowSupport(scene);
                frame(engine, scene);
                return sg;
            };
            const at50 = await mk(50);
            expect(lightClip(at50, [0, 60.5, 0])[2]).toBeLessThan(0);
            expect(inShadowMap(at50, [0, 60.5, 0])).toBe(false);
            expect(inShadowMap(at50, [0, 0.5, 0])).toBe(true);
            const at61 = await mk(61);
            expect(lightClip(at61, [0, 60.5, 0])[2]).toBeLessThan(0);
            const at100 = await mk(100);
            expect(inShadowMap(at100, [0, 60.5, 0])).toBe(true);
            expect(inShadowMap(at100, [0, 59.5, 0])).toBe(true);
            expect(inShadowMap(at100, [0, -0.5, 0])).toBe(true);
        }
    });
});
