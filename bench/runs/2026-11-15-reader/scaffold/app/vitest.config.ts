import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

// The library is used from the checkout beside this app, not from npm.
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
        include: ["src/**/*.test.ts"],
    },
});
