// Does a G1 answer leave the camera working? Written 2026-11-18, after both runs.
// The task's check writes camera.radius and camera.yaw and reads them back. An answer that puts its own
// accessors on the camera, with its own storage, reads back right while the camera itself never moves.
// This probe keeps the camera's own accessors from before the answer runs, and reads the real values
// through them. Copy each answer's src/mode-limits.ts to g1/<name>.ts beside a copy of the library, list
// the names in g1/list.txt, and run it with the bench's runner.
import { it } from "vitest";
import { createGeospatialCamera, createGeospatialLimits } from "@babylonjs/lite";
import { readFileSync, writeFileSync } from "node:fs";

const names = readFileSync(new URL("../g1/list.txt", import.meta.url), "utf8").trim().split("\n").map((l) => l.split(" ")[0]);

function mode(radiusMin: number, radiusMax: number, yawMin: number, yawMax: number) {
    const l = createGeospatialLimits(1000);
    l.radiusMin = radiusMin; l.radiusMax = radiusMax; l.yawMin = yawMin; l.yawMax = yawMax;
    return l;
}

it("probe", async () => {
    const out: string[] = [];
    for (const n of names) {
        try {
            const m = await import(`../g1/${n}.ts`);
            const cam: any = createGeospatialCamera({ planetRadius: 1000 });
            const dr = Object.getOwnPropertyDescriptor(cam, "radius")!;
            const dy = Object.getOwnPropertyDescriptor(cam, "yaw")!;
            const real = () => `${dr.get!.call(cam).toFixed(0)}/${dy.get!.call(cam).toFixed(2)}`;
            const before = real();
            m.useModeLimits(cam, mode(50, 2000, -0.5, 0.5));
            cam.radius = 700; cam.yaw = 0.25;
            const inRange = `${Number(cam.radius).toFixed(0)}/${Number(cam.yaw).toFixed(2)} real ${real()}`;
            cam.radius = 5000; cam.yaw = 1.2;
            const over = `${Number(cam.radius).toFixed(0)}/${Number(cam.yaw).toFixed(2)} real ${real()}`;
            out.push(`${n} start ${before} | wrote 700/0.25: reads ${inRange} | wrote 5000/1.2: reads ${over}`);
        } catch (e: any) {
            out.push(`${n} ERROR ${String(e.message).slice(0, 80)}`);
        }
    }
    writeFileSync(new URL("../g1/out.txt", import.meta.url), out.join("\n") + "\n");
});
