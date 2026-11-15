// Helpers for scene probes. This file has NO runtime import from the library on purpose: the library
// reads `globalThis.GPUBufferUsage` / `GPUTextureUsage` when its modules load, so a probe must import
// this file FIRST (before "@babylonjs/lite") for the flags below to be in place.
import type { EngineContext } from "@babylonjs/lite";

const g = globalThis as Record<string, unknown>;
g.GPUBufferUsage ??= { MAP_READ: 1, MAP_WRITE: 2, COPY_SRC: 4, COPY_DST: 8, INDEX: 16, VERTEX: 32, UNIFORM: 64, STORAGE: 128, INDIRECT: 256, QUERY_RESOLVE: 512 };
g.GPUTextureUsage ??= { COPY_SRC: 1, COPY_DST: 2, TEXTURE_BINDING: 4, STORAGE_BINDING: 8, RENDER_ATTACHMENT: 16 };
g.GPUShaderStage ??= { VERTEX: 1, FRAGMENT: 2, COMPUTE: 4 };
g.GPUColorWrite ??= { RED: 1, GREEN: 2, BLUE: 4, ALPHA: 8, ALL: 15 };
g.GPUMapMode ??= { READ: 1, WRITE: 2 };

/** Relative path from app/checks to the library source, for internal modules the barrel does not export. */
export const SRC = "../../babylon-lite/packages/babylon-lite/src";

export interface FakeBuffer {
    size: number;
    usage: number;
    label?: string;
    destroyed: boolean;
    bytes: ArrayBuffer;
    getMappedRange(): ArrayBuffer;
    unmap(): void;
    destroy(): void;
}

export interface BufferWrite {
    buffer: FakeBuffer;
    offset: number;
    bytes: Uint8Array;
}

export interface FakeDevice {
    writes: BufferWrite[];
    buffers: FakeBuffer[];
    textures: Record<string, unknown>[];
    [key: string]: unknown;
}

/** A GPUDevice stand-in: buffers keep their bytes, `queue.writeBuffer` copies into them and is logged. */
export function makeDevice(): FakeDevice {
    const writes: BufferWrite[] = [];
    const buffers: FakeBuffer[] = [];
    const textures: Record<string, unknown>[] = [];
    const device: FakeDevice = {
        writes,
        buffers,
        textures,
        label: "fake",
        features: new Set<string>(),
        limits: { maxBufferSize: 2 ** 31, maxTextureDimension2D: 8192, maxTextureArrayLayers: 256, minUniformBufferOffsetAlignment: 256, maxStorageBufferBindingSize: 2 ** 27, maxUniformBufferBindingSize: 65536 },
        createBuffer(d: { size: number; usage: number; label?: string }): FakeBuffer {
            const bytes = new ArrayBuffer(Math.ceil(d.size / 4) * 4);
            const b: FakeBuffer = {
                size: d.size,
                usage: d.usage,
                label: d.label,
                destroyed: false,
                bytes,
                getMappedRange: () => bytes,
                unmap(): void {},
                destroy(): void {
                    b.destroyed = true;
                },
            };
            buffers.push(b);
            return b;
        },
        createTexture(d: Record<string, unknown>): Record<string, unknown> {
            const size = d.size as { width: number; height: number; depthOrArrayLayers?: number };
            const t: Record<string, unknown> = { ...d, width: size.width, height: size.height, depthOrArrayLayers: size.depthOrArrayLayers ?? 1, destroyed: false };
            t.createView = (): Record<string, unknown> => ({ texture: t });
            t.destroy = (): void => {
                t.destroyed = true;
            };
            textures.push(t);
            return t;
        },
        createSampler: (d: unknown) => ({ ...(d as object) }),
        createBindGroupLayout: (d: unknown) => d,
        createBindGroup: (d: unknown) => d,
        createPipelineLayout: (d: unknown) => d,
        createShaderModule: (d: unknown) => ({ ...(d as object), getCompilationInfo: async () => ({ messages: [] }) }),
        createRenderPipeline: (d: unknown) => ({ ...(d as object), getBindGroupLayout: () => ({}) }),
        createRenderPipelineAsync: async (d: unknown) => ({ ...(d as object), getBindGroupLayout: () => ({}) }),
        createCommandEncoder: () => ({ finish: () => ({}) }),
        pushErrorScope(): void {},
        popErrorScope: async () => null,
        queue: {
            writeBuffer(buffer: FakeBuffer, offset: number, data: ArrayBufferView | ArrayBuffer, dataOffset = 0, size?: number): void {
                const view = data instanceof ArrayBuffer ? new Uint8Array(data) : new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
                const elem = data instanceof ArrayBuffer ? 1 : ((data as unknown as { BYTES_PER_ELEMENT?: number }).BYTES_PER_ELEMENT ?? 1);
                const start = dataOffset * elem;
                const len = size === undefined ? view.byteLength - start : size * elem;
                const bytes = view.slice(start, start + len);
                new Uint8Array(buffer.bytes).set(bytes, offset);
                writes.push({ buffer, offset, bytes });
            },
            submit(): void {},
            onSubmittedWorkDone: async () => undefined,
        },
    };
    return device;
}

/** Give a null engine the fake device, so mesh factories, light UBOs and shadow generators can run. */
export function attachDevice<E extends EngineContext>(engine: E, device: FakeDevice = makeDevice()): FakeDevice {
    (engine as unknown as { _device: unknown })._device = device;
    return device;
}

/** The float32 contents of a fake buffer. */
export function floats(buffer: unknown): Float32Array {
    return new Float32Array((buffer as FakeBuffer).bytes);
}

/** Apply a column-major 4x4 matrix to a point. */
export function transformPoint(m: ArrayLike<number>, x: number, y: number, z: number): [number, number, number, number] {
    return [
        m[0]! * x + m[4]! * y + m[8]! * z + m[12]!,
        m[1]! * x + m[5]! * y + m[9]! * z + m[13]!,
        m[2]! * x + m[6]! * y + m[10]! * z + m[14]!,
        m[3]! * x + m[7]! * y + m[11]! * z + m[15]!,
    ];
}
