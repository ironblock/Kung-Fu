// What the hidden scene checks share, beside helpers.ts. A subject never sees this file.
//
// The library's null engine has no GPU device, so nothing that builds a mesh or a shadow map can run on it.
// `makeEngine` gives it a stand-in device that accepts every call and hands back plain objects, so meshes,
// lights and shadow generators can be made and their CPU-side state read. Nothing is drawn.
//
// Import this file before the library and before the subject's file: the library reads the WebGPU flag
// constants once, when it is first loaded, and Node has none, so they are set here first.
import type { EngineContext, Mesh, SceneContext } from "@babylonjs/lite";

const g = globalThis as Record<string, unknown>;
g.GPUBufferUsage ??= { MAP_READ: 1, MAP_WRITE: 2, COPY_SRC: 4, COPY_DST: 8, INDEX: 16, VERTEX: 32, UNIFORM: 64, STORAGE: 128, INDIRECT: 256, QUERY_RESOLVE: 512 };
g.GPUTextureUsage ??= { COPY_SRC: 1, COPY_DST: 2, TEXTURE_BINDING: 4, STORAGE_BINDING: 8, RENDER_ATTACHMENT: 16 };
g.GPUShaderStage ??= { VERTEX: 1, FRAGMENT: 2, COMPUTE: 4 };
g.GPUColorWrite ??= { RED: 1, GREEN: 2, BLUE: 4, ALPHA: 8, ALL: 15 };
g.GPUMapMode ??= { READ: 1, WRITE: 2 };

const { createNullEngine, createSceneContext } = await import("@babylonjs/lite");

function stub(label: string): unknown {
    const target = function () {} as unknown as Record<string | symbol, unknown>;
    const cache = new Map<string | symbol, unknown>();
    return new Proxy(target, {
        get(_t, prop) {
            if (prop === "then") {
                return undefined;
            }
            if (prop === Symbol.toPrimitive) {
                return () => 0;
            }
            if (!cache.has(prop)) {
                cache.set(prop, stub(`${label}.${String(prop)}`));
            }
            return cache.get(prop);
        },
        set(_t, prop, value) {
            cache.set(prop, value);
            return true;
        },
        apply(_t, _this, args) {
            const out = stub(`${label}()`) as Record<string, unknown>;
            const first = args[0] as Record<string, unknown> | undefined;
            if (first && typeof first === "object") {
                for (const key of ["size", "label", "format", "usage"]) {
                    if (key in first) {
                        out[key] = first[key];
                    }
                }
            }
            return out;
        },
    });
}

/** A null engine with a stand-in GPU device, so meshes and shadow generators can be created. */
export function makeEngine(): EngineContext {
    const engine = createNullEngine();
    const device = stub("device") as Record<string, unknown>;
    device.limits = { maxStorageBufferBindingSize: 1 << 27, maxUniformBufferBindingSize: 65536, minUniformBufferOffsetAlignment: 256, maxBufferSize: 1 << 28 };
    device.features = new Set<string>();
    device.createBuffer = (desc: { size: number; usage: number; label?: string }) => {
        const bytes = new ArrayBuffer(Math.max(4, desc.size));
        return { size: desc.size, usage: desc.usage, label: desc.label ?? "", getMappedRange: () => bytes, unmap(): void {}, destroy(): void {}, mapAsync: async (): Promise<void> => {} };
    };
    const e = engine as unknown as Record<string, unknown>;
    e._device = device;
    e.canvas = { width: 800, height: 600, clientWidth: 800, clientHeight: 600 };
    e._currentEncoder = stub("encoder");
    return engine;
}

/** A real scene on that engine, with no render task. */
export function makeSceneOn(engine: EngineContext): SceneContext {
    return createSceneContext(engine, { defaultRenderTask: false });
}

/** The world-space corners of a mesh's local box, once per thin instance when it has any. */
export function worldCorners(mesh: Mesh): [number, number, number][] {
    const bmin = mesh.boundMin ?? [-0.5, -0.5, -0.5];
    const bmax = mesh.boundMax ?? [0.5, 0.5, 0.5];
    const world = mesh.worldMatrix;
    const ti = mesh.thinInstances;
    const instances: Float32Array[] = [];
    if (ti && ti.count > 0) {
        for (let i = 0; i < ti.count; i++) {
            instances.push(ti.matrices.subarray(i * 16, i * 16 + 16));
        }
    } else {
        instances.push(new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]));
    }
    const out: [number, number, number][] = [];
    for (const m of instances) {
        for (let c = 0; c < 8; c++) {
            const x = c & 1 ? bmax[0] : bmin[0];
            const y = c & 2 ? bmax[1] : bmin[1];
            const z = c & 4 ? bmax[2] : bmin[2];
            const ix = m[0]! * x + m[4]! * y + m[8]! * z + m[12]!;
            const iy = m[1]! * x + m[5]! * y + m[9]! * z + m[13]!;
            const iz = m[2]! * x + m[6]! * y + m[10]! * z + m[14]!;
            out.push([
                world[0]! * ix + world[4]! * iy + world[8]! * iz + world[12]!,
                world[1]! * ix + world[5]! * iy + world[9]! * iz + world[13]!,
                world[2]! * ix + world[6]! * iy + world[10]! * iz + world[14]!,
            ]);
        }
    }
    return out;
}

/** Take a world point through a column-major 4x4 matrix, with the perspective divide. */
export function project(m: Float32Array, p: [number, number, number]): [number, number, number] {
    const x = m[0]! * p[0] + m[4]! * p[1] + m[8]! * p[2] + m[12]!;
    const y = m[1]! * p[0] + m[5]! * p[1] + m[9]! * p[2] + m[13]!;
    const z = m[2]! * p[0] + m[6]! * p[1] + m[10]! * p[2] + m[14]!;
    const w = m[3]! * p[0] + m[7]! * p[1] + m[11]! * p[2] + m[15]!;
    return [x / w, y / w, z / w];
}

/** The fog slice of the scene uniforms (mode, start, end, density, r, g, b) as the render task would upload
 *  it this frame: a zeroed block, then every writer the scene has registered for it. */
export function fogUniforms(scene: SceneContext): number[] {
    const data = new Float32Array(96);
    for (const write of scene._sceneUboContributors ?? []) {
        write(data, scene);
    }
    return Array.from(data.subarray(80, 87));
}

/** Each triangle of a mesh, as its three corner positions and the normals stored at those corners. */
export function triangles(positions: Float32Array, normals: Float32Array, indices: Uint32Array): { p: [number, number, number][]; n: [number, number, number][] }[] {
    const out: { p: [number, number, number][]; n: [number, number, number][] }[] = [];
    for (let t = 0; t + 2 < indices.length; t += 3) {
        const p: [number, number, number][] = [];
        const n: [number, number, number][] = [];
        for (let k = 0; k < 3; k++) {
            const i = indices[t + k]!;
            p.push([positions[i * 3]!, positions[i * 3 + 1]!, positions[i * 3 + 2]!]);
            n.push([normals[i * 3]!, normals[i * 3 + 1]!, normals[i * 3 + 2]!]);
        }
        out.push({ p, n });
    }
    return out;
}

/** (b - a) x (c - a): the face direction that the index order of a triangle gives. */
export function windingNormal(p: [number, number, number][]): [number, number, number] {
    const [a, b, c] = p as [[number, number, number], [number, number, number], [number, number, number]];
    const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
    const v = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
    return [u[1]! * v[2]! - u[2]! * v[1]!, u[2]! * v[0]! - u[0]! * v[2]!, u[0]! * v[1]! - u[1]! * v[0]!];
}
