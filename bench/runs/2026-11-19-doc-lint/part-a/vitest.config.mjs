// Runs the part-a probes against a checkout of the library.
// LITE_SRC must name the checkout's packages/babylon-lite/src directory.
// VITEST_CACHE may name a cache directory outside the repository.
// Run from a directory whose node_modules holds vitest, for example:
//   LITE_SRC=<checkout>/packages/babylon-lite/src LITE_DEPS=<node_modules> npx vitest run --config <this file>
// "@babylonjs/lite" is the package's public entry (src/index.ts).
// "#lite-src/" reaches one internal module; only the probes marked "internal" use it.
// LITE_DEPS must name a node_modules directory that holds the library's own dependencies
// (the checkout has none of its own); bare imports of those packages are sent there.
import { resolve } from "node:path";
import { tmpdir } from "node:os";

const here = import.meta.dirname;
const lite = process.env.LITE_SRC;
const deps = process.env.LITE_DEPS;
if (!lite || !deps) {
    throw new Error("Set LITE_SRC to the library's packages/babylon-lite/src directory and LITE_DEPS to a node_modules directory with its dependencies");
}

const cache = process.env.VITEST_CACHE ?? resolve(tmpdir(), "lint-doc-a-cache");

export default {
    root: here,
    cacheDir: cache,
    resolve: {
        alias: [
            { find: "@babylonjs/lite", replacement: resolve(lite, "index.ts") },
            { find: "babylon-lite/shader/wgsl.js", replacement: resolve(lite, "shader/wgsl.ts") },
            { find: /^(text-shaper|manifold-3d|mathcat|navcat|@recast-navigation\/[^/]+|@babylonjs\/havok)(\/.*)?$/, replacement: resolve(deps) + "/$1$2" },
            { find: /^#lite-src\/(.*)$/, replacement: resolve(lite) + "/$1" },
        ],
    },
    test: {
        environment: "node",
        globals: true,
        include: ["*.test.ts"],
        // Keep vitest's module cache out of the repository.
        fsModuleCachePath: resolve(cache, "modules"),
    },
};
