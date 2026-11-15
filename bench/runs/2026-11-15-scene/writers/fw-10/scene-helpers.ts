// Helpers for scene probes. The library's null engine has no GPU device, so mesh factories,
// shadow generators and scene registration (which create buffers, textures and pipelines) would
// dereference an absent `_device`. `makeGpuScene` keeps the null engine and gives it a stub device
// whose objects only remember what they were created with: nothing is drawn, nothing is read back.
//
// Import this file BEFORE "@babylonjs/lite" in a probe: some library modules read the WebGPU flag
// globals (GPUBufferUsage, ...) when they load, and Node has none, so this file defines them first
// and only then loads the library.
import type { EngineContext, SceneContext } from "@babylonjs/lite";

const g = globalThis as Record<string, unknown>;
g.GPUBufferUsage ??= { MAP_READ: 1, MAP_WRITE: 2, COPY_SRC: 4, COPY_DST: 8, INDEX: 16, VERTEX: 32, UNIFORM: 64, STORAGE: 128, INDIRECT: 256, QUERY_RESOLVE: 512 };
g.GPUMapMode ??= { READ: 1, WRITE: 2 };
g.GPUTextureUsage ??= { COPY_SRC: 1, COPY_DST: 2, TEXTURE_BINDING: 4, STORAGE_BINDING: 8, RENDER_ATTACHMENT: 16 };
g.GPUShaderStage ??= { VERTEX: 1, FRAGMENT: 2, COMPUTE: 4 };
g.GPUColorWrite ??= { RED: 1, GREEN: 2, BLUE: 4, ALPHA: 8, ALL: 15 };

const { createNullEngine, createSceneContext, waitForGpuResourceRetirements } = await import("@babylonjs/lite");

export interface StubDevice {
    created: { kind: string; descriptor: unknown }[];
    writes: { target: unknown; offset: number; data: unknown }[];
}

function stubObject(kind: string, descriptor: unknown, log: StubDevice): Record<string, unknown> {
    log.created.push({ kind, descriptor });
    const objects = ((log as StubDevice & { objects?: Record<string, unknown>[] }).objects ??= []);
    const size = Number((descriptor as { size?: number } | undefined)?.size ?? 0);
    const mapped = new ArrayBuffer(Number.isFinite(size) && size > 0 ? size : 16);
    const obj: Record<string, unknown> = {
        __kind: kind,
        descriptor,
        label: (descriptor as { label?: string } | undefined)?.label ?? "",
        size,
        width: 1,
        height: 1,
        depthOrArrayLayers: 1,
        mipLevelCount: 1,
        sampleCount: 1,
        destroyed: false,
        mapped,
        getMappedRange: () => mapped,
        unmap: () => {},
        mapAsync: async () => {},
        destroy(): void {
            obj.destroyed = true;
        },
        createView: (d?: unknown) => stubObject("view", d, log),
        getBindGroupLayout: (i: number) => stubObject("bindGroupLayout", { index: i }, log),
        getCompilationInfo: async () => ({ messages: [] }),
    };
    objects.push(obj);
    const sizeDesc = (descriptor as { size?: unknown } | undefined)?.size;
    if (kind === "texture" && sizeDesc && typeof sizeDesc === "object") {
        const s = sizeDesc as number[] & GPUExtent3DDict;
        obj.width = Array.isArray(s) ? s[0] : s.width;
        obj.height = Array.isArray(s) ? (s[1] ?? 1) : (s.height ?? 1);
        obj.depthOrArrayLayers = Array.isArray(s) ? (s[2] ?? 1) : (s.depthOrArrayLayers ?? 1);
    }
    return obj;
}

function encoderStub(log: StubDevice): unknown {
    const pass = new Proxy({}, { get: (_t, p) => (p === "then" ? undefined : () => pass) });
    return new Proxy(
        {},
        {
            get: (_t, p) => {
                if (p === "then") return undefined;
                if (p === "beginRenderPass" || p === "beginComputePass") return () => pass;
                if (p === "finish") return () => stubObject("commandBuffer", {}, log);
                return () => {};
            },
        }
    );
}

/** A stub GPUDevice: every `createX` returns a plain object that remembers its descriptor. */
export function makeStubDevice(): GPUDevice & { log: StubDevice } {
    const log: StubDevice = { created: [], writes: [] };
    const queue = {
        // Keeps a COPY of the bytes written (the library reuses its scratch arrays), as a Float32Array.
        writeBuffer(target: unknown, offset: number, data: ArrayBufferView | ArrayBuffer, dataOffset = 0, size?: number): void {
            const isView = ArrayBuffer.isView(data);
            const bytes = isView ? new Uint8Array(data.buffer, data.byteOffset, data.byteLength) : new Uint8Array(data);
            const unit = isView ? ((data as unknown as { BYTES_PER_ELEMENT?: number }).BYTES_PER_ELEMENT ?? 1) : 1;
            const start = dataOffset * unit;
            const length = size === undefined ? bytes.byteLength - start : size * unit;
            const copy = bytes.slice(start, start + length);
            log.writes.push({ target, offset, data: new Float32Array(copy.buffer, 0, Math.floor(copy.byteLength / 4)) });
        },
        writeTexture(): void {},
        copyExternalImageToTexture(): void {},
        submit(): void {},
        onSubmittedWorkDone: async () => {},
    };
    const base: Record<string, unknown> = {
        log,
        queue,
        limits: new Proxy({}, { get: () => 1 << 16 }),
        features: new Set<string>(),
        lost: new Promise(() => {}),
        pushErrorScope(): void {},
        popErrorScope: async () => null,
        addEventListener(): void {},
        removeEventListener(): void {},
        createCommandEncoder: () => encoderStub(log),
        createRenderBundleEncoder: () => encoderStub(log),
        createRenderPipelineAsync: async (d: unknown) => stubObject("renderPipeline", d, log),
        createComputePipelineAsync: async (d: unknown) => stubObject("computePipeline", d, log),
        destroy(): void {},
    };
    return new Proxy(base, {
        get(target, p: string | symbol) {
            if (p in target) return target[p as string];
            if (typeof p === "string" && p.startsWith("create")) {
                const kind = p.slice(6, 7).toLowerCase() + p.slice(7);
                return (d: unknown) => stubObject(kind, d, log);
            }
            return undefined;
        },
    }) as unknown as GPUDevice & { log: StubDevice };
}

export interface GpuScene {
    engine: EngineContext;
    scene: SceneContext;
    device: GPUDevice & { log: StubDevice };
}

/** The library's null engine with a stub device attached, and a scene on it with no render task. */
export function makeGpuScene(options: { renderTask?: boolean } = {}): GpuScene {
    const engine = createNullEngine();
    const device = makeStubDevice();
    const colorTexture = device.createTexture({ size: [800, 600], format: "bgra8unorm", usage: 16 });
    const scRT = {
        _descriptor: { lbl: "swapchain", format: "bgra8unorm", samples: 1, size: { width: 800, height: 600 } },
        _colorTexture: colorTexture,
        _colorView: colorTexture.createView(),
        _depthTexture: null,
        _depthView: null,
        _width: 800,
        _height: 600,
        _eager: true,
    };
    Object.assign(engine, { _device: device, format: "bgra8unorm", msaaSamples: 1, _disposables: [], scRT, canvas: { width: 800, height: 600 }, width: 800, height: 600 });
    // With `renderTask`, the scene gets its default forward render task (the one that draws meshes and
    // uploads the lights and scene uniforms each frame); without it, only pre-passes and shadow tasks run.
    const scene = createSceneContext(engine, { defaultRenderTask: options.renderTask === true });
    return { engine, scene, device };
}

/** Run one frame on the stub device as the render loop does: per-frame update, then the frame
 *  graph (shadow maps included). Returns the draw calls the frame graph reports. */
export function frame(engine: EngineContext, scene: SceneContext, deltaMs = 16): number {
    const e = engine as unknown as { _currentEncoder: unknown; _currentDelta: number; _device: GPUDevice & { log: StubDevice } };
    e._currentEncoder = encoderStub(e._device.log);
    e._currentDelta = deltaMs;
    scene._update();
    return scene._record();
}

/** What the end of a rendered frame does to resources a removal retired: run their teardown. */
export async function endFrame(engine: EngineContext): Promise<void> {
    await waitForGpuResourceRetirements(engine);
}

/** World-space translation of a node's world matrix. */
export function worldPos(node: { worldMatrix: ArrayLike<number> }): [number, number, number] {
    const m = node.worldMatrix;
    return [m[12]!, m[13]!, m[14]!];
}

/** WGSL of every shader module the stub device was asked to create, in creation order. */
export function shaderCode(device: { log: StubDevice }): string[] {
    return device.log.created.filter((c) => c.kind === "shaderModule").map((c) => String((c.descriptor as { code?: string }).code ?? ""));
}

/** The floats of every upload to the scene's shared lights buffer, oldest first. Each upload starts with a
 *  4-float header whose first float holds the light count as a u32 bit pattern; each light then takes 16
 *  floats (for a directional or point light: [0..3] direction or position, [4..6] diffuse × intensity). */
export function lightsUploads(scene: SceneContext, device: { log: StubDevice }): Float32Array[] {
    const buffer = (scene as unknown as { _lightGpuState?: { _buffer: unknown } })._lightGpuState?._buffer;
    return device.log.writes.filter((w) => buffer && w.target === buffer && w.offset === 0).map((w) => w.data as Float32Array);
}

/** The light count stored in a lights upload's header. */
export function lightCount(upload: Float32Array): number {
    return new Uint32Array(upload.buffer, upload.byteOffset, 1)[0]!;
}

/** Uploads of a scene-uniform block big enough to hold the fog slice (floats 80–86: mode, start, end,
 *  density, r, g, b), oldest first. */
export function sceneUniformUploads(device: { log: StubDevice }): Float32Array[] {
    return device.log.writes
        .map((w) => w.data)
        .filter((d): d is Float32Array => d instanceof Float32Array && d.length >= 92 && d.length < 200)
        .map((d) => d);
}

/** Names of the scene's frame-graph tasks, in order. */
export function taskNames(scene: SceneContext): string[] {
    return (scene as unknown as { _frameGraph: { _tasks: { name: string }[] } })._frameGraph._tasks.map((t) => t.name);
}

/** A world point taken through a shadow generator's light matrix: [x, y, z, w] in light clip space. A point is
 *  inside the shadow map when x and y are in [-1, 1] and z is in [0, 1]. */
export function lightClip(sg: { _lightMatrix: Float32Array }, p: readonly [number, number, number]): [number, number, number, number] {
    const m = sg._lightMatrix;
    const r = [0, 1, 2, 3].map((i) => m[i]! * p[0] + m[4 + i]! * p[1] + m[8 + i]! * p[2] + m[12 + i]!);
    return [r[0]!, r[1]!, r[2]!, r[3]!];
}

/** Whether a world point lands inside a shadow generator's map (see `lightClip`). */
export function inShadowMap(sg: { _lightMatrix: Float32Array }, p: readonly [number, number, number]): boolean {
    const [x, y, z] = lightClip(sg, p);
    return x >= -1 && x <= 1 && y >= -1 && y <= 1 && z >= 0 && z <= 1;
}

/** Every buffer the stub device created, in creation order: its size in bytes, the bytes written into it
 *  at creation (`mapped`), and the buffer object itself (what later `log.writes` entries target). */
export function createdBuffers(device: { log: StubDevice }): { size: number; mapped: ArrayBuffer; obj: unknown }[] {
    const objects = (device.log as StubDevice & { objects?: Record<string, unknown>[] }).objects ?? [];
    return objects.filter((o) => o.__kind === "buffer").map((o) => ({ size: Number(o.size), mapped: o.mapped as ArrayBuffer, obj: o }));
}
