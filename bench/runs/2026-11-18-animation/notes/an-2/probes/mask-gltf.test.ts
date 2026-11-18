import { AnimationGroupMaskMode, addAnimationGroup, createAnimationGroupMask, createAnimationGroups, createAnimationManager, updateAnimationManager } from "@babylonjs/lite";
import { gltfData, recorder } from "./gltf-fixture.ts";

test("a mask on a glTF group skips masked-out nodes' channels; their targets are written with the rest pose", () => {
    const targets = [recorder(), recorder()];
    const [move] = createAnimationGroups(gltfData(targets));
    move!.mask = createAnimationGroupMask(["root"], AnimationGroupMaskMode.Include);
    const manager = createAnimationManager();
    addAnimationGroup(manager, move!);
    updateAnimationManager(manager, 500);
    expect(targets[0]!.p).toEqual([5, 0, 0]);
    expect(targets[1]!.p).toEqual([0, 0, 0]);
});

test("changing mode, disabled, or replacing names takes effect at the next update; an in-place edit at the same length does not", () => {
    const targets = [recorder(), recorder()];
    const [move] = createAnimationGroups(gltfData(targets));
    const mask = createAnimationGroupMask(["root"]);
    move!.mask = mask;
    const manager = createAnimationManager();
    addAnimationGroup(manager, move!);
    updateAnimationManager(manager, 500);
    expect(targets[1]!.p).toEqual([0, 0, 0]);

    mask.names[0] = "arm";
    updateAnimationManager(manager, 0);
    expect(targets[1]!.p).toEqual([0, 0, 0]);
    expect(targets[0]!.p).toEqual([5, 0, 0]);

    mask.names = ["arm"];
    updateAnimationManager(manager, 0);
    expect(targets[1]!.p).toEqual([0, 2.5, 0]);
    expect(targets[0]!.p).toEqual([0, 0, 0]);

    mask.mode = AnimationGroupMaskMode.Exclude;
    updateAnimationManager(manager, 0);
    expect(targets[0]!.p).toEqual([5, 0, 0]);
    expect(targets[1]!.p).toEqual([0, 0, 0]);

    mask.disabled = true;
    updateAnimationManager(manager, 0);
    expect(targets[1]!.p).toEqual([0, 2.5, 0]);
    move!.mask = undefined;
    updateAnimationManager(manager, 0);
    expect(targets[1]!.p).toEqual([0, 2.5, 0]);
});
