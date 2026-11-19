// c-40. Lines 592-595: "N/A — Animation is a CPU-side system. GPU interaction is limited to:" writeTexture for bone
// matrices and writeBuffer for morph weights.
// Checked: a device stand-in records every property read on the device and its queue. A direct glTF group with a
// skeleton and a morph channel, a weighted glTF blend, and a property group are each updated; nothing on the device is
// touched except queue.writeTexture and queue.writeBuffer.
import {
    addAnimationGroup,
    addAnimationGroups,
    createAnimationGroups,
    createAnimationManager,
    createPropertyAnimationClip,
    createPropertyAnimationGroup,
    enableAnimationBlending,
    playAnimation,
    setAnimationWeight,
    updateAnimationManager,
} from "@babylonjs/lite";
import type { ClipSpec } from "./_fx";
import { gltf, morphBinding, moveClip, recordingEngine, rest, skeleton } from "./_fx";

test("only writeTexture and writeBuffer", () => {
    const rec = recordingEngine();
    const both: ClipSpec = {
        name: "both",
        duration: 1,
        channels: [
            { samplerIdx: 0, nodeIdx: 0, path: 0 },
            { samplerIdx: 1, nodeIdx: 0, path: 3 },
        ],
        samplers: [
            { input: new Float32Array([0, 1]), output: new Float32Array([0, 0, 0, 10, 0, 0]), interpolation: 0 },
            { input: new Float32Array([0, 1]), output: new Float32Array([0, 1]), interpolation: 0 },
        ],
    };
    const [direct] = createAnimationGroups(gltf([both], [rest()], { skeletons: [skeleton(0)], morphBindings: [morphBinding(0, 1)] }));
    const m1 = createAnimationManager({ engine: rec.engine });
    addAnimationGroup(m1, direct!);
    updateAnimationManager(m1, 100);

    const blended = createAnimationGroups(gltf([moveClip("a", 0, 10), moveClip("b", 0, 20)], [rest()], { skeletons: [skeleton(0)] }));
    const m2 = createAnimationManager({ engine: rec.engine });
    enableAnimationBlending(m2);
    addAnimationGroups(m2, blended);
    playAnimation(blended[1]!);
    setAnimationWeight(blended[0]!, 0.5);
    updateAnimationManager(m2, 100);

    const m3 = createAnimationManager({ engine: rec.engine });
    createPropertyAnimationGroup(m3, { v: 0 }, createPropertyAnimationClip("p", [{ path: "v", keys: [{ time: 0, value: 0 }, { time: 1, value: 1 }] }]));
    updateAnimationManager(m3, 100);

    expect(new Set(rec.calls.map((c) => c.method))).toEqual(new Set(["writeTexture", "writeBuffer"]));
    expect(rec.otherAccess).toEqual([]);
});
