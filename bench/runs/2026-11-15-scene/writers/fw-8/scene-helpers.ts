// Helpers for scene probes: a null engine that also carries a fake GPU device, so mesh factories,
// shadow generators and uniform buffers can be created without a GPU. Every GPU object is a plain
// record that remembers what was done to it.
//
// Import this file BEFORE "@babylonjs/lite" in a probe: the library reads the WebGPU flag globals
// (GPUBufferUsage, ...) once when it loads, and Node has none, so they are installed here first.
import type { EngineContext, SceneContext } from "@babylonjs/lite";

const g = globalThis as Record<string, unknown>;
g.GPUBufferUsage ??= { MAP_READ: 1, MAP_WRITE: 2, COPY_SRC: 4, COPY_DST: 8, INDEX: 16, VERTEX: 32, UNIFORM: 64, STORAGE: 128, INDIRECT: 256, QUERY_RESOLVE: 512 };
g.GPUTextureUsage ??= { COPY_SRC: 1, COPY_DST: 2, TEXTURE_BINDING: 4, STORAGE_BINDING: 8, RENDER_ATTACHMENT: 16 };
g.GPUShaderStage ??= { VERTEX: 1, FRAGMENT: 2, COMPUTE: 4 };
g.GPUColorWrite ??= { RED: 1, GREEN: 2, BLUE: 4, ALPHA: 8, ALL: 15 };

const { createNullEngine, createSceneContext } = await import("@babylonjs/lite");

export interface FakeBuffer {
    size: number;
    usage: number;
    label?: string;
    destroyed: boolean;
    data: Uint8Array;
    destroy(): void;
    unmap(): void;
    getMappedRange(): ArrayBuffer;
}

export interface FakeDevice {
    buffers: FakeBuffer[];
    textures: { destroyed: boolean; desc: unknown }[];
    writes: { buffer: FakeBuffer; offset: number; bytes: number }[];
    /** WGSL source of every shader module created, in order. */
    shaders: string[];
    submitted: number;
}

function makeBuffer(desc: { size: number; usage: number; label?: string }): FakeBuffer {
    const data = new Uint8Array(desc.size);
    return {
        size: desc.size,
        usage: desc.usage,
        label: desc.label,
        destroyed: false,
        data,
        destroy(): void {
            this.destroyed = true;
        },
        unmap(): void {},
        getMappedRange: () => data.buffer,
    };
}

/** A null engine with a fake `_device`. Returns the engine and the device's record. */
export function makeGpuEngine(): { engine: EngineContext; device: FakeDevice } {
    const engine = createNullEngine();
    const record: FakeDevice = { buffers: [], textures: [], writes: [], shaders: [], submitted: 0 };
    const view = () => ({ kind: "view" });
    const device = {
        createBuffer(desc: { size: number; usage: number; label?: string }) {
            const b = makeBuffer(desc);
            record.buffers.push(b);
            return b;
        },
        createTexture(desc: unknown) {
            const t = { desc, destroyed: false, createView: view, destroy(): void { t.destroyed = true; } };
            record.textures.push(t);
            return t;
        },
        createSampler: (desc: unknown) => ({ desc }),
        createBindGroupLayout: (desc: unknown) => ({ desc }),
        createBindGroup: (desc: unknown) => ({ desc }),
        createPipelineLayout: (desc: unknown) => ({ desc }),
        createShaderModule(desc: { code: string }) {
            record.shaders.push(desc.code);
            return { desc, getCompilationInfo: async () => ({ messages: [] }) };
        },
        createRenderPipeline: (desc: unknown) => ({ desc, getBindGroupLayout: () => ({}) }),
        queue: {
            writeBuffer(buffer: FakeBuffer, offset: number, _data: unknown, _dataOffset?: number, size?: number) {
                record.writes.push({ buffer, offset, bytes: size ?? 0 });
            },
            writeTexture(): void {},
            submit(): void {
                record.submitted++;
            },
            onSubmittedWorkDone: () => Promise.resolve(),
        },
        limits: { maxUniformBufferBindingSize: 65536, maxStorageBufferBindingSize: 1 << 27 },
        features: new Set<string>(),
    };
    (engine as unknown as { _device: unknown })._device = device;
    return { engine, device: record };
}

/** A real scene on that engine, with no default render task. */
export function makeGpuScene(): { engine: EngineContext; device: FakeDevice; scene: SceneContext } {
    const { engine, device } = makeGpuEngine();
    const scene = createSceneContext(engine, { defaultRenderTask: false });
    return { engine, device, scene };
}

/** A stand-in material: any object with a `_buildGroup` puts a mesh into a material group. */
export function fakeMaterial(): never {
    const build = async () => ({ renderables: [] });
    return { _buildGroup: build } as never;
}

/** Column-major translation matrix. */
export function translation(x: number, y: number, z: number): Float32Array {
    const m = new Float32Array(16);
    m[0] = m[5] = m[10] = m[15] = 1;
    m[12] = x;
    m[13] = y;
    m[14] = z;
    return m;
}
