import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

// The grader's config: the app's own, with the hidden checks in place of the app's tests.
const lite = resolve(import.meta.dirname, "../babylon-lite/packages/babylon-lite/src");

export default defineConfig({
    resolve: {
        alias: {
            "@babylonjs/lite": resolve(lite, "index.ts"),
            "babylon-lite/shader/wgsl.js": resolve(lite, "shader/wgsl.ts"),
        },
    },
    test: {
        environment: "node",
        include: ["checks/**/*.test.ts"],
    },
});
