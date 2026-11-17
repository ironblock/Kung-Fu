import * as L2 from "@babylonjs/lite";
import * as H2 from "./helpers";
import * as V2 from "vitest";

for (const attach of [L2.attachFreeControl, L2.attachConfigurableFreeControl]) {
    V2.it(`47 (after check 2): ${attach.name}: the glide depends on speed (default 2) and drag size`, () => {
        V2.expect(L2.createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 }).speed).toBe(2);
        const turns = (speed: number, px: number) => {
            const scene = H2.makeScene();
            const cam = L2.createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 });
            cam.speed = speed;
            V2.expect(cam.angularSensitivity).toBe(2000);
            const c = H2.makeCanvas();
            attach(cam, H2.asCanvas(c), scene);
            H2.fire(c, "pointerdown", H2.pointer({ clientX: 0 }));
            H2.fire(c, "pointermove", H2.pointer({ clientX: px }));
            H2.fire(c, "pointerup", H2.pointer());
            let n = 0;
            for (let i = 0; i < 20; i++) {
                const y = cam._yaw;
                H2.tick(scene);
                if (cam._yaw !== y) n++;
            }
            return n;
        };
        V2.expect(turns(1000, 200)).toBe(1);
        V2.expect(turns(1000, 3000)).toBeGreaterThan(1);
        V2.expect(turns(2, 200)).toBeGreaterThan(1);
    });
}
