// Scene helpers for probes that build meshes, lights and shadows on the library's null engine.
//
// The library reads the WebGPU flag globals (GPUBufferUsage, ...) when its modules load, and Node has
// none, so this file sets them FIRST and only then loads the library. A probe must import this file
// before it imports "@babylonjs/lite" or "./helpers".
//
// The null engine has no device. `makeGpuScene` gives it a stand-in device that accepts every call,
// remembers every buffer it creates and every byte written to one, and returns inert objects for
// textures, pipelines and bind groups. Nothing is drawn; what can be checked is what the library keeps
// on its own objects and what it writes into buffers.
const g = globalThis as Record<string, unknown>;
g.GPUBufferUsage ??= { MAP_READ: 1, MAP_WRITE: 2, COPY_SRC: 4, COPY_DST: 8, INDEX: 16, VERTEX: 32, UNIFORM: 64, STORAGE: 128, INDIRECT: 256, QUERY_RESOLVE: 512 };
g.GPUMapMode ??= { READ: 1, WRITE: 2 };
g.GPUTextureUsage ??= { COPY_SRC: 1, COPY_DST: 2, TEXTURE_BINDING: 4, STORAGE_BINDING: 8, RENDER_ATTACHMENT: 16 };
g.GPUShaderStage ??= { VERTEX: 1, FRAGMENT: 2, COMPUTE: 4 };
g.GPUColorWrite ??= { RED: 1, GREEN: 2, BLUE: 4, ALPHA: 8, ALL: 15 };

const L = await import("@babylonjs/lite");
type SceneContext = import("@babylonjs/lite").SceneContext;
type EngineContext = import("@babylonjs/lite").EngineContext;

/** A buffer the stand-in device made: its descriptor, its bytes (as last written) and whether it was destroyed. */
export interface FakeBuffer {
    label?: string;
    size: number;
    usage: number;
    bytes: Uint8Array;
    destroyed: boolean;
    writes: number;
    destroy(): void;
    getMappedRange(offset?: number, size?: number): ArrayBuffer;
    unmap(): void;
    mapAsync(): Promise<void>;
    mapState: string;
}

/** One draw call: its name, its arguments, the bind-group slots set on its encoder since the draw before it,
 *  the vertex/index buffers set for it, and the number of the render pass (counted from 1 per frame) it ran in. */
export interface Draw {
    name: string;
    args: unknown[];
    groups: number[];
    vertexBuffers: unknown[];
    pipeline: unknown;
    pass: number;
}

/** Everything the stand-in device recorded. */
export interface DeviceLog {
    buffers: FakeBuffer[];
    textures: Record<string, unknown>[];
    pipelines: Record<string, unknown>[];
    calls: string[];
    /** Every WGSL module source the library compiled. */
    shaders: string[];
    /** Every draw that reached a render pass, directly or through a replayed render bundle. */
    draws: Draw[];
    /** Render passes begun since the log was last cleared. */
    passCount: number;
}

function inert(name: string, log: DeviceLog): unknown {
    // An object on which any method can be called and any field read; methods return further inert objects.
    const target: Record<string | symbol, unknown> = { label: name };
    return new Proxy(target, {
        get(t, key) {
            if (key in t) return t[key];
            if (key === "then") return undefined;
            if (typeof key === "symbol") return undefined;
            return (..._args: unknown[]) => {
                const k = String(key);
                log.calls.push(`${name}.${k}`);
                if (k === "beginRenderPass") return recorder("pass", log);
                return inert(`${name}.${k}`, log);
            };
        },
        set(t, key, value) {
            t[key] = value;
            return true;
        },
    });
}

/** A render pass or render-bundle encoder that keeps its draws. A pass's draws go to the log as they are made;
 *  a bundle keeps them, and they reach the log each time a pass replays the bundle. */
function recorder(kind: "pass" | "bundle", log: DeviceLog): unknown {
    const passNo = kind === "pass" ? ++log.passCount : 0;
    let groups: number[] = [];
    let vbs: unknown[] = [];
    let pipeline: unknown = null;
    const kept: Omit<Draw, "pass">[] = [];
    const methods: Record<string, (...args: unknown[]) => unknown> = {
        setBindGroup: (slot) => {
            groups.push(slot as number);
        },
        setPipeline: (p) => {
            pipeline = p;
        },
        setVertexBuffer: (slot, buffer) => {
            vbs[slot as number] = buffer;
        },
        executeBundles: (bundles) => {
            for (const b of bundles as { _draws?: Omit<Draw, "pass">[] }[]) {
                for (const d of b._draws ?? []) log.draws.push({ ...d, pass: passNo });
            }
            groups = [];
        },
        finish: () => ({ label: "bundle", _draws: kept }),
    };
    const target: Record<string, unknown> = { label: kind };
    return new Proxy(target, {
        get(t, key) {
            if (typeof key === "symbol" || key === "then") return undefined;
            if (key in t) return t[key];
            const k = key;
            return (...args: unknown[]) => {
                log.calls.push(`${kind}.${k}`);
                if (k.startsWith("draw")) {
                    const d = { name: k, args, groups, vertexBuffers: vbs.slice(), pipeline };
                    groups = [];
                    if (kind === "pass") log.draws.push({ ...d, pass: passNo });
                    else kept.push(d);
                    return undefined;
                }
                const m = methods[k];
                return m ? m(...args) : undefined;
            };
        },
        set(t, key, value) {
            t[key as string] = value;
            return true;
        },
    });
}

function makeBuffer(desc: { size: number; usage: number; label?: string; mappedAtCreation?: boolean }, log: DeviceLog): FakeBuffer {
    const bytes = new Uint8Array(Math.max(4, Math.ceil(desc.size / 4) * 4));
    const buf: FakeBuffer = {
        label: desc.label,
        size: desc.size,
        usage: desc.usage,
        bytes,
        destroyed: false,
        writes: 0,
        mapState: desc.mappedAtCreation ? "mapped" : "unmapped",
        destroy() {
            buf.destroyed = true;
        },
        getMappedRange: (offset = 0, size?: number) => sliceView(bytes, offset, size),
        unmap() {
            buf.mapState = "unmapped";
        },
        mapAsync: async () => {},
    };
    log.buffers.push(buf);
    return buf;
}

function sliceView(bytes: Uint8Array, offset: number, size?: number): ArrayBuffer {
    // The whole buffer maps onto the recorded bytes; a partial mapped range is a detached copy (its writes are not kept).
    if (offset === 0 && (size === undefined || size === bytes.byteLength)) return bytes.buffer as ArrayBuffer;
    const copy = new ArrayBuffer(size ?? bytes.byteLength - offset);
    return copy;
}

export function makeDevice(log: DeviceLog): GPUDevice {
    const device: Record<string, unknown> = {
        label: "fake-device",
        features: new Set<string>(),
        limits: new Proxy({}, { get: () => 1 << 16 }),
        lost: new Promise(() => {}),
        createBuffer: (desc: { size: number; usage: number; label?: string; mappedAtCreation?: boolean }) => makeBuffer(desc, log),
        createTexture: (desc: Record<string, unknown>) => {
            const tex = inert(`texture:${String(desc.label ?? "")}`, log) as Record<string, unknown>;
            tex.width = (desc.size as number[] | { width: number })?.[0 as never] ?? (desc.size as { width: number })?.width;
            tex.format = desc.format;
            tex.desc = desc;
            log.textures.push(tex);
            return tex;
        },
        createRenderPipeline: (desc: Record<string, unknown>) => {
            const p = inert(`pipeline:${String(desc.label ?? "")}`, log) as Record<string, unknown>;
            p.desc = desc;
            log.pipelines.push(p);
            return p;
        },
        createShaderModule: (desc: { code: string; label?: string }) => {
            log.shaders.push(desc.code);
            return { label: desc.label, code: desc.code };
        },
        createCommandEncoder: () => inert("encoder", log),
        createRenderBundleEncoder: () => recorder("bundle", log),
        createRenderPipelineAsync: async (desc: Record<string, unknown>) => (device.createRenderPipeline as (d: unknown) => unknown)(desc),
        createComputePipelineAsync: async (desc: Record<string, unknown>) => inert(`compute:${String(desc.label ?? "")}`, log),
        queue: {
            writeBuffer(buffer: FakeBuffer, offset: number, data: ArrayBufferView | ArrayBuffer, dataOffset = 0, size?: number) {
                const src = data instanceof ArrayBuffer ? new Uint8Array(data) : new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
                const elem = data instanceof ArrayBuffer ? 1 : ((data as unknown as { BYTES_PER_ELEMENT?: number }).BYTES_PER_ELEMENT ?? 1);
                const start = dataOffset * elem;
                const len = size !== undefined ? size * elem : src.byteLength - start;
                if (buffer && buffer.bytes) {
                    buffer.bytes.set(src.subarray(start, start + len).subarray(0, Math.max(0, buffer.bytes.byteLength - offset)), offset);
                    buffer.writes++;
                }
            },
            writeTexture() {},
            copyExternalImageToTexture() {},
            submit() {},
            onSubmittedWorkDone: async () => {},
        },
    };
    return new Proxy(device, {
        get(t, key) {
            if (key in t) return t[key as string];
            if (typeof key === "symbol" || key === "then") return undefined;
            return (..._args: unknown[]) => {
                log.calls.push(`device.${String(key)}`);
                return inert(`device.${String(key)}`, log);
            };
        },
    }) as unknown as GPUDevice;
}

export interface GpuScene {
    scene: SceneContext;
    engine: EngineContext;
    log: DeviceLog;
}

/** A null engine with the stand-in device, and a scene on it. With `renderTask` the scene gets its default
 *  render task, drawing into a stand-in 800x600 swapchain target, so `frame` runs the colour pass too. */
export function makeGpuScene(renderTask = true): GpuScene {
    const engine = L.createNullEngine();
    const log: DeviceLog = { buffers: [], textures: [], pipelines: [], calls: [], shaders: [], draws: [], passCount: 0 };
    const e = engine as unknown as Record<string, unknown>;
    e._device = makeDevice(log);
    e.format = "bgra8unorm";
    e.msaaSamples = 1;
    e.canvas = { width: 800, height: 600, clientWidth: 800, clientHeight: 600 };
    e.width = 800;
    e.height = 600;
    const view = inert("swapchain-view", log);
    e.scRT = {
        _descriptor: { lbl: "swapchain", format: "bgra8unorm", samples: 1, size: { width: 800, height: 600 } },
        _resolveSize: () => ({ width: 800, height: 600 }),
        _eager: true,
        _colorTexture: inert("swapchain-texture", log),
        _colorView: view,
        _depthTexture: null,
        _depthView: null,
        _width: 800,
        _height: 600,
    };
    const scene = L.createSceneContext(engine, { defaultRenderTask: renderTask });
    return { scene, engine, log };
}

/** Run one whole frame of a registered scene as the render loop does: update, then record every task. */
export function frame(engine: EngineContext, scene: SceneContext, deltaMs = 16): void {
    const e = engine as unknown as Record<string, unknown>;
    const device = e._device as GPUDevice;
    e._currentEncoder = device.createCommandEncoder({ label: "frame" });
    e._currentDelta = deltaMs;
    scene._update();
    (scene as unknown as { _record(): number })._record();
    // As the render loop does after its submit: hand queued GPU teardown to the queue fence.
    (e._flushGpuRetirements as ((engine: EngineContext) => void) | undefined)?.(engine);
}

/** Let pending promises, imports and fenced GPU teardown finish (a few event-loop turns). */
export async function settle(ms = 20): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms));
}

/** The floats last written to a buffer. */
export function floatsOf(buffer: unknown): Float32Array {
    const b = buffer as FakeBuffer;
    return new Float32Array(b.bytes.buffer, 0, Math.floor(b.bytes.byteLength / 4));
}

/** Run one update of the scene the way a frame does (before-render callbacks, pre-passes, uniform updates). */
export function step(engine: EngineContext, scene: SceneContext, deltaMs = 16): void {
    L.stepScene(engine, scene, deltaMs);
}

/** The 16 numbers of a node's world matrix, as plain numbers. */
export function worldOf(node: { worldMatrix: ArrayLike<number> }): number[] {
    return Array.from(node.worldMatrix as ArrayLike<number>);
}

/** The world-space translation (elements 12, 13, 14) of a node's world matrix. */
export function worldPos(node: { worldMatrix: ArrayLike<number> }): [number, number, number] {
    const m = node.worldMatrix;
    return [m[12]!, m[13]!, m[14]!];
}

/** One draw of a frame: index (or vertex) count, instance count, the bind-group slots set for it, the render
 *  pass it ran in (1 = the first pass of the frame), its vertex buffers, and its pipeline's WGSL. */
export interface FrameDraw {
    name: string;
    count: number;
    instances: number;
    groups: number[];
    pass: number;
    vertexBuffers: unknown[];
    vertexCode: string;
    fragmentCode: string;
}

/** The draws of one whole frame, in order. */
export function drawsOfFrame(engine: EngineContext, scene: SceneContext, log: DeviceLog): FrameDraw[] {
    log.draws.length = 0;
    log.passCount = 0;
    frame(engine, scene);
    return log.draws.map((d) => {
        const desc = (d.pipeline as { desc?: { vertex?: { module?: { code?: string } }; fragment?: { module?: { code?: string } } } } | null)?.desc;
        // An indirect draw reads [count, instances, ...] from its argument buffer as the frame left it.
        const indirect = d.name.endsWith("Indirect");
        const args = indirect ? new Uint32Array((d.args[0] as FakeBuffer).bytes.buffer, (d.args[1] as number) ?? 0, 2) : null;
        return {
            name: d.name,
            count: args ? args[0]! : (d.args[0] as number),
            instances: args ? args[1]! : ((d.args[1] as number) ?? 1),
            groups: d.groups,
            pass: d.pass,
            vertexBuffers: d.vertexBuffers,
            vertexCode: desc?.vertex?.module?.code ?? "",
            fragmentCode: desc?.fragment?.module?.code ?? "",
        };
    });
}

/** How many render passes one whole frame begins. */
export function passesOfFrame(engine: EngineContext, scene: SceneContext, log: DeviceLog): number {
    log.passCount = 0;
    frame(engine, scene);
    return log.passCount;
}

/** The floats of the scene's lights buffer as last uploaded (header: float 0 holds the light count as a u32). */
export function lightsBuffer(scene: SceneContext): { count: number; floats: Float32Array } {
    const state = (scene as unknown as { _lightGpuState?: { _buffer: FakeBuffer } })._lightGpuState;
    if (!state) return { count: 0, floats: new Float32Array(0) };
    return { count: new Uint32Array(state._buffer.bytes.buffer)[0]!, floats: floatsOf(state._buffer) };
}

/** The scene-uniform buffer of the scene's colour pass, and how many times it was written. */
export function sceneUniforms(scene: SceneContext): { writes: number; floats: Float32Array } {
    const task = scene._frameGraph._tasks.find((t) => t.name === "scene") as unknown as { _sceneUBO: FakeBuffer };
    return { writes: task._sceneUBO.writes, floats: floatsOf(task._sceneUBO) };
}

/** The per-mesh uniform buffers whose world matrix (first 16 floats) is the mesh's current world matrix. */
export function meshUniformsOf(mesh: { worldMatrix: ArrayLike<number> }, log: DeviceLog): FakeBuffer[] {
    const w = Array.from(mesh.worldMatrix);
    return log.buffers.filter((b) => {
        if (b.destroyed || b.size < 96 || (b.usage & 64) === 0) return false;
        const f = floatsOf(b);
        return w.every((v, i) => Math.abs(f[i]! - v) < 1e-6);
    });
}

/** The number of lights a mesh's uniform buffer says light it (u32 at word 16), for its single per-mesh buffer. */
export function lightCountOf(mesh: { worldMatrix: ArrayLike<number> }, log: DeviceLog): number {
    const found = meshUniformsOf(mesh, log);
    if (found.length !== 1) throw new Error(`expected one mesh uniform buffer, found ${found.length}`);
    return new Uint32Array(found[0]!.bytes.buffer)[16]!;
}
