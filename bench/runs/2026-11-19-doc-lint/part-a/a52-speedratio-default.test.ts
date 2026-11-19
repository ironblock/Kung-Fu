// a-52, line 190: "speedRatio: number; // default 1"
import { bothKinds } from "./_groups.ts";

test("speedRatio is 1 by default", () => {
    const { gltf, property } = bothKinds();
    expect([gltf.speedRatio, property.speedRatio]).toEqual([1, 1]);
});
