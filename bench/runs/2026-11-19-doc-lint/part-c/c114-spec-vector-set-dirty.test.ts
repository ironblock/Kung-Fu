// c-114. Line 744: "**Manual vector animation**: Verify `position` calls `.set(x, y, z)` and marks world matrices dirty"
// Checked on a real Lite transform node: animating "position" calls position.set(x, y, z), the node's
// worldMatrixVersion changes, and its world matrix then holds the new translation.
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, createTransformNode, updateAnimationManager } from "@babylonjs/lite";

test("position.set and dirty world matrix", () => {
    const node = createTransformNode("n");
    const calls: number[][] = [];
    const original = node.position.set.bind(node.position);
    (node.position as { set: (x: number, y: number, z: number) => unknown }).set = (x, y, z) => {
        calls.push([x, y, z]);
        return original(x, y, z);
    };
    void node.worldMatrix;
    const version = node.worldMatrixVersion;
    const manager = createAnimationManager();
    createPropertyAnimationGroup(manager, node, createPropertyAnimationClip("c", [{ path: "position", keys: [{ time: 0, value: [1, 2, 3] }, { time: 1, value: [1, 2, 3] }] }]));
    updateAnimationManager(manager, 100);
    expect(calls).toEqual([[1, 2, 3]]);
    const m = node.worldMatrix as unknown as ArrayLike<number>;
    expect(node.worldMatrixVersion).not.toBe(version);
    expect([m[12], m[13], m[14]]).toEqual([1, 2, 3]);
});
