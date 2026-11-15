// What the hidden scene and mesh checks share, beside `helpers.ts`. A subject never sees this file.
//
// The library reads the WebGPU flag namespaces when its modules load, and Node has none, so this
// file defines them. It imports nothing from the library: a check imports it FIRST, before the
// library and before the subject's file, so the flags exist when those modules load.
//
// The null engine has no GPU device, and every mesh factory uploads its geometry to one. `withGpu`
// gives an engine a stand-in device whose buffers accept writes and hold nothing, so meshes can be
// made and added to a scene with no browser and no GPU. Nothing is ever drawn.
const g = globalThis as Record<string, unknown>;
g.GPUBufferUsage ??= { MAP_READ: 1, MAP_WRITE: 2, COPY_SRC: 4, COPY_DST: 8, INDEX: 16, VERTEX: 32, UNIFORM: 64, STORAGE: 128, INDIRECT: 256, QUERY_RESOLVE: 512 };
g.GPUMapMode ??= { READ: 1, WRITE: 2 };
g.GPUTextureUsage ??= { COPY_SRC: 1, COPY_DST: 2, TEXTURE_BINDING: 4, STORAGE_BINDING: 8, RENDER_ATTACHMENT: 16 };
g.GPUShaderStage ??= { VERTEX: 1, FRAGMENT: 2, COMPUTE: 4 };
g.GPUColorWrite ??= { RED: 1, GREEN: 2, BLUE: 4, ALPHA: 8, ALL: 15 };

interface FakeBuffer {
    size: number;
    destroyed: boolean;
    getMappedRange(): ArrayBuffer;
    unmap(): void;
    destroy(): void;
}

/** Give `engine` (the null engine of a scene from `makeScene`) a stand-in GPU device, and return it. */
export function withGpu<T extends object>(engine: T): T {
    const device = {
        createBuffer(desc: { size: number }): FakeBuffer {
            const store = new ArrayBuffer(desc.size);
            return {
                size: desc.size,
                destroyed: false,
                getMappedRange: () => store,
                unmap(): void {},
                destroy(): void {
                    this.destroyed = true;
                },
            };
        },
        queue: { writeBuffer(): void {}, submit(): void {}, onSubmittedWorkDone: () => Promise.resolve() },
    };
    (engine as { _device?: unknown })._device = device;
    return engine;
}

/** The world position (translation part) of a node's world matrix. */
export function worldPosition(node: { worldMatrix: ArrayLike<number> }): [number, number, number] {
    const m = node.worldMatrix;
    return [m[12]!, m[13]!, m[14]!];
}
