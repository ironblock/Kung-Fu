import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, updateAnimationManager } from "@babylonjs/lite";

test("a key value that is an object such as { x, y, z } throws nothing and writes nothing", () => {
    const v = (x: number) => ({ x, y: x, z: x }) as unknown as number[];
    const clip = createPropertyAnimationClip("c", [{ path: "position", keys: [{ time: 0, value: v(1) }, { time: 1, value: v(2) }] }]);
    const manager = createAnimationManager();
    const target = { position: { x: 0, y: 0, z: 0 } };
    createPropertyAnimationGroup(manager, target, clip);
    updateAnimationManager(manager, 500);
    expect(target.position).toEqual({ x: 0, y: 0, z: 0 });
});
