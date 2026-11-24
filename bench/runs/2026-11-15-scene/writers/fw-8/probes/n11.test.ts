// n11: registerScene installs no shadow task; registerSceneWithShadowSupport adds one named "shadow".
import { makeGpuEngine } from "./scene-helpers";
import { createSceneContext, registerScene, registerSceneWithShadowSupport } from "@babylonjs/lite";
import { describe, expect, it } from "vitest";

describe("n11 shadow task", () => {
    it("registerScene: no shadow task", async () => {
        const { engine } = makeGpuEngine();
        const scene = createSceneContext(engine, { defaultRenderTask: false });
        await registerScene(scene);
        expect(scene._frameGraph._tasks.map((t) => t.name)).not.toContain("shadow");
    });

    it("registerSceneWithShadowSupport: one task named shadow", async () => {
        const { engine } = makeGpuEngine();
        const scene = createSceneContext(engine, { defaultRenderTask: false });
        await registerSceneWithShadowSupport(scene);
        expect(scene._frameGraph._tasks.map((t) => t.name)).toEqual(["shadow"]);
    });
});
