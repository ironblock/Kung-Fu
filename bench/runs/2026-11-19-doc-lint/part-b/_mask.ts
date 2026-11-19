// Fixture for the mask probes (b-73 to b-75). Not a probe itself.
// Nine named nodes, no parents. Clip 0 "agree" moves nothing much; clip 1 "walk" moves every node's
// x from 0 to 10 over 1 s. Node i rests at x = 100 + i. Node 1 (LeftUpLeg) is also the one bone of a skin.
import { addAnimationGroup, createAnimationGroups, createAnimationManager } from "@babylonjs/lite";
import { boneRig, gltf, moveClip, nodeRecorder, rest } from "./_fx";

export const names = [
    "mixamorig:Hips",
    "mixamorig:LeftUpLeg",
    "mixamorig:LeftLeg",
    "mixamorig:LeftFoot",
    "mixamorig:RightUpLeg",
    "mixamorig:RightLeg",
    "mixamorig:RightFoot",
    "mixamorig:Spine",
    "mixamorig:LeftArm",
];

export function xbotLike() {
    const rig = boneRig(1);
    const targets = names.map(() => nodeRecorder());
    const walkClip = {
        name: "walk",
        duration: 1,
        channels: names.map((_, i) => ({ samplerIdx: 0, nodeIdx: i, path: 0 as const })),
        samplers: [{ input: new Float32Array([0, 1]), output: new Float32Array([0, 0, 0, 10, 0, 0]), interpolation: 0 as const }],
    };
    const groups = createAnimationGroups(
        gltf([moveClip("agree", 0, 1), walkClip], names.map((_, i) => rest(-1, 100 + i)), { targets, names, skeletons: [rig.skeleton] })
    );
    const manager = createAnimationManager({ engine: rig.engine });
    for (const g of groups) {
        addAnimationGroup(manager, g);
    }
    return { rig, targets, groups, manager, xbot: { animationGroups: groups } };
}
