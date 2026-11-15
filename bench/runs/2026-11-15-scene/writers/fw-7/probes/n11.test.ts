import { attachDevice, makeDevice } from "./scene-helpers";
import type { FakeDevice } from "./scene-helpers";
import { createNullEngine, createSceneContext, setFog } from "@babylonjs/lite";
import type { Camera, EngineContext, SceneContext } from "@babylonjs/lite";
import { _writePassSceneUBO } from "../../babylon-lite/packages/babylon-lite/src/frame-graph/render-task-base.ts";
import type { RenderTaskBase } from "../../babylon-lite/packages/babylon-lite/src/frame-graph/render-task-base.ts";
import { describe, expect, it } from "vitest";

// An engine with a fake device and a swapchain target, so the scene gets its default render task,
// whose scene-UBO write `_writePassSceneUBO` runs every frame.
function setup(): { engine: EngineContext; device: FakeDevice; scene: SceneContext; task: RenderTaskBase; camera: Camera } {
    const engine = createNullEngine();
    const device = attachDevice(engine, makeDevice());
    Object.assign(engine, {
        canvas: { width: 800, height: 600 },
        msaaSamples: 1,
        format: "bgra8unorm",
        scRT: { _colorTexture: {}, _colorView: {}, _depthTexture: null, _depthView: null, _descriptor: { format: "bgra8unorm", samples: 1, size: { width: 800, height: 600 } }, _width: 800, _height: 600, _eager: true },
    });
    const scene = createSceneContext(engine);
    const task = scene._frameGraph._tasks.find((t) => t._sceneUboCacheKey !== undefined) as unknown as RenderTaskBase;
    const m = new Float32Array(16);
    m[0] = m[5] = m[10] = m[15] = 1;
    const camera = {
        fov: Math.PI / 4,
        nearPlane: 0.1,
        farPlane: 100,
        children: [],
        worldMatrix: m,
        worldMatrixVersion: 1,
        _viewCache: new Float32Array(16),
        _projCache: new Float32Array(16),
        _vpCache: new Float32Array(16),
    } as unknown as Camera;
    scene.camera = camera;
    return { engine, device, scene, task, camera };
}

function lastSceneUbo(device: FakeDevice, task: RenderTaskBase): Float32Array {
    const w = device.writes.filter((x) => x.buffer === (task._sceneUBO as unknown));
    const bytes = w[w.length - 1]!.bytes;
    return new Float32Array(bytes.buffer, bytes.byteOffset, bytes.byteLength / 4);
}

const sceneUboWrites = (device: FakeDevice, task: RenderTaskBase) => device.writes.filter((x) => x.buffer === (task._sceneUBO as unknown)).length;

describe("n11: fog reaches the scene UBO only through setFog, and only when scene.fog changes identity", () => {
    it("assigning scene.fog writes no fog values", () => {
        const { engine, device, scene, task, camera } = setup();
        scene.fog = { mode: 3, density: 0.1, start: 10, end: 50, color: [1, 0, 0] };
        _writePassSceneUBO(task, engine, scene, camera);
        expect(Array.from(lastSceneUbo(device, task).slice(80, 87))).toEqual([0, 0, 0, 0, 0, 0, 0]);
    });

    it("setFog writes them", () => {
        const { engine, device, scene, task, camera } = setup();
        setFog(scene, { mode: 3, density: 0.1, start: 10, end: 50, color: [1, 0, 0] });
        _writePassSceneUBO(task, engine, scene, camera);
        // offsets 80..86: mode, start, end, density, color r, g, b
        expect(Array.from(lastSceneUbo(device, task).slice(80, 87))).toEqual([3, 10, 50, Math.fround(0.1), 1, 0, 0]);
    });

    it("editing the same fog object in place is not rewritten; setFog with a new object is", () => {
        const { engine, device, scene, task, camera } = setup();
        const fog = { mode: 3 as const, density: 0.1, start: 10, end: 50, color: [1, 0, 0] as [number, number, number] };
        setFog(scene, fog);
        _writePassSceneUBO(task, engine, scene, camera);
        const before = sceneUboWrites(device, task);
        fog.end = 99;
        _writePassSceneUBO(task, engine, scene, camera);
        expect(sceneUboWrites(device, task)).toBe(before);
        setFog(scene, fog);
        _writePassSceneUBO(task, engine, scene, camera);
        expect(sceneUboWrites(device, task)).toBe(before);
        setFog(scene, { ...fog });
        _writePassSceneUBO(task, engine, scene, camera);
        expect(sceneUboWrites(device, task)).toBe(before + 1);
        expect(lastSceneUbo(device, task)[82]).toBe(99);
    });

    it("after a first setFog, a plain scene.fog = newObject is written", () => {
        const { engine, device, scene, task, camera } = setup();
        setFog(scene, { mode: 3, density: 0.1, start: 10, end: 50, color: [1, 0, 0] });
        _writePassSceneUBO(task, engine, scene, camera);
        scene.fog = { mode: 3, density: 0.1, start: 10, end: 77, color: [1, 0, 0] };
        _writePassSceneUBO(task, engine, scene, camera);
        expect(lastSceneUbo(device, task)[82]).toBe(77);
    });

    it("an in-place edit is written as soon as the camera moves (or another scene-UBO input changes)", () => {
        const { engine, device, scene, task, camera } = setup();
        const fog = { mode: 3 as const, density: 0.1, start: 10, end: 50, color: [1, 0, 0] as [number, number, number] };
        setFog(scene, fog);
        _writePassSceneUBO(task, engine, scene, camera);
        fog.end = 88;
        _writePassSceneUBO(task, engine, scene, camera);
        expect(lastSceneUbo(device, task)[82]).toBe(50);
        (camera as unknown as { worldMatrixVersion: number }).worldMatrixVersion++;
        _writePassSceneUBO(task, engine, scene, camera);
        expect(lastSceneUbo(device, task)[82]).toBe(88);
    });
});
