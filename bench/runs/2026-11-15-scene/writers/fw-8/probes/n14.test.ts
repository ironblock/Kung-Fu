// n14: scene.fog assigned directly is never written to the scene uniforms; setFog is. After setFog a new
// fog object is uploaded, but an in-place edit is skipped by the render task's scene-UBO cache.
import { makeGpuEngine } from "./scene-helpers";
import { createSceneContext, setFog } from "@babylonjs/lite";
import type { Camera, EngineContext, SceneContext } from "@babylonjs/lite";
import { _writePassSceneUBO, type RenderTask } from "../../babylon-lite/packages/babylon-lite/src/frame-graph/render-task";
import { describe, expect, it } from "vitest";

const FOG = { mode: 3 as const, density: 0.1, start: 5, end: 50, color: [0.5, 0.6, 0.7] as [number, number, number] };

/** What the render task does each frame: run the scene's uniform contributors over the scene UBO data. */
function sceneUniforms(scene: ReturnType<typeof createSceneContext>): Float32Array {
    const data = new Float32Array(96);
    for (const write of scene._sceneUboContributors ?? []) {
        write(data, scene);
    }
    return data;
}

describe("n14 fog needs setFog", () => {
    it("direct assignment: fog values never reach the uniform data", () => {
        const { engine } = makeGpuEngine();
        const scene = createSceneContext(engine, { defaultRenderTask: false });
        scene.fog = FOG;
        const data = sceneUniforms(scene);
        expect(Array.from(data.subarray(80, 83))).toEqual([0, 0, 0]);
    });

    it("setFog: mode, start, end written", () => {
        const { engine } = makeGpuEngine();
        const scene = createSceneContext(engine, { defaultRenderTask: false });
        setFog(scene, FOG);
        const data = sceneUniforms(scene);
        expect(Array.from(data.subarray(80, 83))).toEqual([3, 5, 50]);
    });

    it("after setFog, later writes to scene.fog are seen", () => {
        const { engine } = makeGpuEngine();
        const scene = createSceneContext(engine, { defaultRenderTask: false });
        setFog(scene, FOG);
        scene.fog = { ...FOG, start: 7 };
        expect(sceneUniforms(scene)[81]).toBe(7);
    });

    it("render task: after setFog, a new scene.fog object is uploaded but an in-place edit is not", () => {
        const writes: Float32Array[] = [];
        const device = {
            createBuffer: (descriptor: unknown) => ({ descriptor, destroy: () => undefined }),
            createBindGroupLayout: (d: unknown) => d,
            createBindGroup: (d: unknown) => d,
            queue: { writeBuffer: (_b: unknown, _o: number, data: Float32Array) => writes.push(new Float32Array(data)) },
        };
        const scRT = { _colorTexture: {}, _colorView: {}, _depthTexture: null, _depthView: null, _descriptor: { format: "bgra8unorm", samples: 1, size: { width: 800, height: 600 } }, _width: 800, _height: 600, _eager: true };
        const eng = { canvas: { width: 800, height: 600 }, msaaSamples: 1, useFloatingOrigin: false, useHighPrecisionMatrix: false, format: "bgra8unorm", _device: device, scRT } as unknown as EngineContext;
        Object.assign(eng, { engine: eng, surfaces: [eng], _surfaces: [eng] });
        const scene = createSceneContext(eng) as SceneContext;
        const id = new Float32Array(16);
        id[0] = id[5] = id[10] = id[15] = 1;
        const camera = { fov: 0.8, nearPlane: 0.1, farPlane: 100, children: [], worldMatrix: id, worldMatrixVersion: 1, _viewCache: new Float32Array(16), _projCache: new Float32Array(16), _vpCache: new Float32Array(16) } as unknown as Camera;
        scene.camera = camera;
        const task = scene._frameGraph._tasks.find((t): t is RenderTask => (t as RenderTask)._sceneUboCacheKey !== undefined)!;
        setFog(scene, { ...FOG });
        writes.length = 0;
        _writePassSceneUBO(task, eng, scene, camera);
        expect(writes).toHaveLength(1);
        expect(writes[0]![81]).toBe(5);
        scene.fog!.start = 7;
        _writePassSceneUBO(task, eng, scene, camera);
        expect(writes).toHaveLength(1);
        scene.fog = { ...scene.fog!, start: 7 };
        _writePassSceneUBO(task, eng, scene, camera);
        expect(writes).toHaveLength(2);
        expect(writes[1]![81]).toBe(7);
        setFog(scene, { ...FOG, start: 9 });
        _writePassSceneUBO(task, eng, scene, camera);
        expect(writes[2]![81]).toBe(9);
    });
});
