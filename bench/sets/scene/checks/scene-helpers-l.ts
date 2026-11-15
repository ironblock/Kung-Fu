// What the hidden scene checks share. A subject never sees this file.
//
// The light and shadow checks need more than the null engine: shadow generators and clustered lights
// create GPU buffers and textures when they are made. This file gives the null engine a stand-in GPU
// device that keeps the last bytes written to every buffer and texture, so a check can read what the
// library would have sent to the GPU.
//
// IMPORT THIS FILE FIRST in a check, before "@babylonjs/lite" and before the subject's file. The library
// captures the WebGPU flag globals when it is first loaded, so they must exist before that. For the same
// reason this file has no value import of the library: it loads it lazily, inside `makeGpuScene`.
import type { EngineContext, SceneContext } from "@babylonjs/lite";

const g = globalThis as Record<string, unknown>;
g.GPUBufferUsage ??= { MAP_READ: 1, MAP_WRITE: 2, COPY_SRC: 4, COPY_DST: 8, INDEX: 16, VERTEX: 32, UNIFORM: 64, STORAGE: 128, INDIRECT: 256, QUERY_RESOLVE: 512 };
g.GPUMapMode ??= { READ: 1, WRITE: 2 };
g.GPUTextureUsage ??= { COPY_SRC: 1, COPY_DST: 2, TEXTURE_BINDING: 4, STORAGE_BINDING: 8, RENDER_ATTACHMENT: 16 };
g.GPUShaderStage ??= { VERTEX: 1, FRAGMENT: 2, COMPUTE: 4 };
g.GPUColorWrite ??= { RED: 1, GREEN: 2, BLUE: 4, ALPHA: 8, ALL: 15 };

/** A stand-in GPU buffer: its bytes are what the library last wrote to it. */
export interface FakeBuffer {
    label?: string;
    size: number;
    bytes: Uint8Array;
    destroyed: boolean;
    destroy(): void;
}

/** A stand-in GPU texture: `bytes` is the data of the last `writeTexture` to it, or null. */
export interface FakeTexture {
    label?: string;
    width: number;
    height: number;
    depthOrArrayLayers: number;
    format: string;
    bytes: Uint8Array | null;
    destroyed: boolean;
    createView(desc?: unknown): { texture: FakeTexture };
    destroy(): void;
}

/** Everything the stand-in device made, in order. */
export interface GpuLog {
    buffers: FakeBuffer[];
    textures: FakeTexture[];
}

function toBytes(data: ArrayBuffer | ArrayBufferView, offset = 0, size?: number): Uint8Array {
    if (ArrayBuffer.isView(data)) {
        // WebGPU: for a typed array, dataOffset and size count elements.
        const per = (data as unknown as { BYTES_PER_ELEMENT?: number }).BYTES_PER_ELEMENT ?? 1;
        const start = data.byteOffset + offset * per;
        const length = size !== undefined ? size * per : data.byteLength - offset * per;
        return new Uint8Array(data.buffer.slice(start, start + length));
    }
    const length = size ?? data.byteLength - offset;
    return new Uint8Array(data.slice(offset, offset + length));
}

function makeDevice(log: GpuLog): GPUDevice {
    const plain = (): object => ({});
    const device = {
        limits: { maxTextureDimension2D: 8192, maxTextureArrayLayers: 256, minUniformBufferOffsetAlignment: 256, maxUniformBufferBindingSize: 65536 },
        features: new Set<string>(),
        createBuffer(desc: { size: number; label?: string }): FakeBuffer {
            const buffer: FakeBuffer = {
                label: desc.label,
                size: desc.size,
                bytes: new Uint8Array(desc.size),
                destroyed: false,
                destroy() {
                    buffer.destroyed = true;
                },
            };
            Object.assign(buffer, { getMappedRange: () => buffer.bytes.buffer, unmap() {} });
            log.buffers.push(buffer);
            return buffer;
        },
        createTexture(desc: { size: { width: number; height?: number; depthOrArrayLayers?: number } | number[]; format: string; label?: string }): FakeTexture {
            const size = Array.isArray(desc.size) ? { width: desc.size[0]!, height: desc.size[1], depthOrArrayLayers: desc.size[2] } : desc.size;
            const texture: FakeTexture = {
                label: desc.label,
                width: size.width,
                height: size.height ?? 1,
                depthOrArrayLayers: size.depthOrArrayLayers ?? 1,
                format: desc.format,
                bytes: null,
                destroyed: false,
                createView: () => ({ texture }),
                destroy() {
                    texture.destroyed = true;
                },
            };
            log.textures.push(texture);
            return texture;
        },
        createSampler: plain,
        createShaderModule: plain,
        createBindGroupLayout: plain,
        createPipelineLayout: plain,
        createRenderPipeline: plain,
        createComputePipeline: plain,
        createBindGroup: plain,
        createCommandEncoder: plain,
        queue: {
            writeBuffer(buffer: FakeBuffer, bufferOffset: number, data: ArrayBuffer | ArrayBufferView, dataOffset?: number, size?: number): void {
                const bytes = toBytes(data, dataOffset ?? 0, size);
                buffer.bytes.set(bytes.subarray(0, Math.max(0, buffer.size - bufferOffset)), bufferOffset);
            },
            writeTexture(destination: { texture: FakeTexture }, data: ArrayBuffer | ArrayBufferView): void {
                destination.texture.bytes = toBytes(data);
            },
            submit(): void {},
            onSubmittedWorkDone: () => Promise.resolve(),
        },
    };
    return device as unknown as GPUDevice;
}

/** The floats of a stand-in buffer, as the library last wrote them. */
export function bufferFloats(buffer: GPUBuffer): Float32Array {
    const bytes = (buffer as unknown as FakeBuffer).bytes;
    return new Float32Array(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
}

/** The floats of the last data written to a stand-in texture, or an empty array. */
export function textureFloats(texture: FakeTexture): Float32Array {
    const bytes = texture.bytes;
    return bytes ? new Float32Array(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength)) : new Float32Array(0);
}

/**
 * What one frame sends to the GPU as the scene's lights: the shared lights buffer, as floats, after the
 * refresh the render loop runs at the start of a frame. Entry `i` (16 floats) starts at float `4 + 16 * i`;
 * floats 4..6 of an entry are its diffuse colour times its intensity.
 */
export async function lightsOnGpu(engine: EngineContext, scene: SceneContext): Promise<Float32Array> {
    const { refreshSceneLightsUBO } = await import("../../babylon-lite/packages/babylon-lite/src/render/scene-lights-ubo");
    return bufferFloats(refreshSceneLightsUBO(engine, scene));
}

/** Run the scene's clustered-light refresh, as a frame does before it draws, for the scene's camera. */
export function refreshClusteredLights(engine: EngineContext, scene: SceneContext): void {
    const canvas = (engine as unknown as { canvas: { width: number; height: number } }).canvas;
    scene._clusteredLightUpdater?.(scene.camera, canvas.width, canvas.height);
}

/** The clustered lights the GPU holds: each [x, y, z, range, r, g, b, intensity], from the newest light-data texture. */
export function clusteredLightsOnGpu(gpu: GpuLog, count: number): number[][] {
    const texture = gpu.textures.filter((t) => t.label === "clustered-light-data").at(-1);
    if (!texture) {
        return [];
    }
    const floats = textureFloats(texture);
    const out: number[][] = [];
    for (let i = 0; i < count && (i + 1) * 8 <= floats.length; i++) {
        out.push(Array.from(floats.slice(i * 8, i * 8 + 8)));
    }
    return out;
}

/**
 * Run one shadow-map update of a PCF generator, the step the scene's shadow pass runs each frame,
 * with a stand-in render task that draws nothing. Returns the depth range of the light's shadow
 * camera and the light matrix that receivers get. Call it again to run the next frame's update.
 */
export async function updatePcfShadowMap(
    engine: EngineContext,
    scene: SceneContext,
    generator: import("@babylonjs/lite").ShadowGenerator,
    casters: readonly import("@babylonjs/lite").Mesh[] = []
): Promise<{ near: number; far: number; lightMatrix: Float32Array }> {
    const { createShadowCamera } = await import("../../babylon-lite/packages/babylon-lite/src/shadow/shadow-base");
    const holder = generator as unknown as { _probeState?: Record<string, unknown> };
    const state = (holder._probeState ??= {
        _task: { record() {}, execute: () => 0, dispose() {} },
        _camera: createShadowCamera(generator),
        _lastCasterVersion: -1,
        _lastLightVersion: -1,
        _lastFoVersion: -1,
        _shadowUboData: new Float32Array(24),
        _casterMeshes: casters,
        _casterMaterials: [],
        _casterMatGens: [],
        _casterMeshGens: [],
        _casterMatFeatures: [],
        _scene: scene,
    });
    generator._renderShadowMap!(engine, state as never);
    const camera = state._camera as { nearPlane: number; farPlane: number };
    return { near: camera.nearPlane, far: camera.farPlane, lightMatrix: Float32Array.from(generator._lightMatrix) };
}

/**
 * A real scene on the library's null engine, with a stand-in GPU device and a canvas of the given size.
 * Nothing is drawn; buffers and textures only remember the bytes written to them.
 */
export async function makeGpuScene(width = 800, height = 600): Promise<{ engine: EngineContext; scene: SceneContext; gpu: GpuLog }> {
    const lite = await import("@babylonjs/lite");
    const gpu: GpuLog = { buffers: [], textures: [] };
    const engine = lite.createNullEngine();
    const writable = engine as unknown as Record<string, unknown>;
    writable._device = makeDevice(gpu);
    writable.canvas = { width, height, clientWidth: width, clientHeight: height };
    const scene = lite.createSceneContext(engine, { defaultRenderTask: false });
    return { engine, scene, gpu };
}
