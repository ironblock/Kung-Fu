// a-54, line 192: "weight: number; // default 1"
import { bothKinds } from "./_groups.ts";

test("weight is 1 by default", () => {
    const { gltf, property } = bothKinds();
    expect([gltf.weight, property.weight]).toEqual([1, 1]);
});
