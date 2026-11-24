// b-71. Lines 495-519: "Weighted glTF skeleton blend:" and the code under it (weights 0 for all,
// then walk 0.5 and run 0.5, then enableAnimationBlending, then the manager ticked each frame).
// No network: Xbot.glb is stood in for by hand-made glTF data with one skinned bone (node 0) and three
// clips "idle", "run", "walk", made by createAnimationGroups as loadGltf makes them; the engine records
// bone-texture uploads. The rest of the code is as written. walk moves the bone 0 -> 10 and run 0 -> 20
// over 1 s, so after 0.5 s a half-and-half blend puts the bone's translation at 0.5*5 + 0.5*10 = 7.5.
// (Matrix element 12 is the bone's x translation; its sign depends on the engine's handedness.)
import { addAnimationGroups, createAnimationGroups, createAnimationManager, enableAnimationBlending, playAnimation, setAnimationWeight, updateAnimationManager } from "@babylonjs/lite";
import { boneRig, gltf, moveClip, rest } from "./_fx";

function setup() {
    const rig = boneRig(0);
    const xbot = { animationGroups: createAnimationGroups(gltf([moveClip("idle", 0, 0), moveClip("run", 0, 20), moveClip("walk", 0, 10)], [rest()], { skeletons: [rig.skeleton] })) };
    const engine = rig.engine;
    const manager = createAnimationManager({ engine });
    addAnimationGroups(manager, xbot.animationGroups ?? []);
    return { rig, xbot, manager };
}

function snippet(xbot: ReturnType<typeof setup>["xbot"], manager: ReturnType<typeof setup>["manager"]) {
    for (const group of xbot.animationGroups ?? []) {
        setAnimationWeight(group, 0);
    }
    setAnimationWeight(xbot.animationGroups!.find((group) => group.name === "walk")!, 0.5);
    setAnimationWeight(xbot.animationGroups!.find((group) => group.name === "run")!, 0.5);
    enableAnimationBlending(manager);
}

test("the example as written blends walk and run half and half", () => {
    const { rig, xbot, manager } = setup();
    snippet(xbot, manager);
    updateAnimationManager(manager, 500);
    expect(rig.uploads).toBeGreaterThan(0);
    expect(Math.abs(rig.skeleton.boneMatrices[12]!)).toBeCloseTo(7.5, 5);
});

test("context, not the claim: with walk and run started by playAnimation the same code blends them", () => {
    const { rig, xbot, manager } = setup();
    for (const name of ["walk", "run"]) {
        playAnimation(xbot.animationGroups.find((g) => g.name === name)!);
    }
    snippet(xbot, manager);
    updateAnimationManager(manager, 500);
    expect(Math.abs(rig.skeleton.boneMatrices[12]!)).toBeCloseTo(7.5, 5);
});
