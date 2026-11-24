// Runs the library's glTF animation parser on a tiny hand-made glTF. Not a probe itself.
// parseAnimationData is internal (src/index.ts does not export it); it is what the glTF loader calls
// to build the GltfAnimationData that it hands to createAnimationGroups.
import { parseAnimationData } from "#lite-src/loader-gltf/gltf-animation.ts";
import type { GltfAnimationData } from "@babylonjs/lite";
import { recorder } from "./_fx.ts";

/** Node "a" (root) with child "b". One animation with two samplers: inputs [0, 1] and [0, 2.5]. */
export function parsed(): GltfAnimationData {
    const floats = [0, 1, 0, 0, 0, 10, 0, 0, 0, 2.5, 0, 0, 0, 0, 5, 0];
    const bin = new Float32Array(floats);
    const view = new DataView(bin.buffer);
    const acc = (byteOffset: number, count: number, type: string) => ({ bufferView: 0, byteOffset, componentType: 5126, count, type });
    const json = {
        nodes: [{ name: "a", children: [1] }, { name: "b" }],
        bufferViews: [{ buffer: 0, byteOffset: 0, byteLength: bin.byteLength }],
        accessors: [acc(0, 2, "SCALAR"), acc(8, 2, "VEC3"), acc(32, 2, "SCALAR"), acc(40, 2, "VEC3")],
        animations: [
            {
                name: "two",
                samplers: [{ input: 0, output: 1 }, { input: 2, output: 3 }],
                channels: [
                    { sampler: 0, target: { node: 0, path: "translation" } },
                    { sampler: 1, target: { node: 1, path: "translation" } },
                ],
            },
        ],
    };
    const result = parseAnimationData(json, view, [], new Map([[1, 0]]), new Map(), [recorder(), recorder()] as never);
    if (!result) {
        throw new Error("parser returned null");
    }
    return result;
}
