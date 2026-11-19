// c-117. Line 747: "**Manual weighted blend**: Verify two groups targeting one scalar write a single weighted result
// independent of group order"
// Checked with the property mixer on: groups (10, weight 0.3) and (20, weight 0.6) added in either order write 15, in one
// write per update.
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, enablePropertyAnimationBlending, setAnimationWeight, updateAnimationManager } from "@babylonjs/lite";

function run(order: [number, number][]): { value: number; writes: number } {
    const manager = createAnimationManager();
    enablePropertyAnimationBlending(manager);
    let value = 0;
    let writes = 0;
    const target = {};
    Object.defineProperty(target, "v", { get: () => value, set: (x: number) => ((value = x), writes++), enumerable: true });
    for (const [v, w] of order) {
        setAnimationWeight(createPropertyAnimationGroup(manager, target, createPropertyAnimationClip("c", [{ path: "v", keys: [{ time: 0, value: v }, { time: 1, value: v }] }])), w);
    }
    updateAnimationManager(manager, 0);
    return { value, writes };
}

test("order does not matter", () => {
    const ab = run([[10, 0.3], [20, 0.6]]);
    const ba = run([[20, 0.6], [10, 0.3]]);
    expect(ab.value).toBeCloseTo(15, 5);
    expect(ba.value).toBeCloseTo(15, 5);
    expect([ab.writes, ba.writes]).toEqual([1, 1]);
});
