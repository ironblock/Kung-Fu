// Type-checks each probe in this directory against the library's public entry, and says which compile.
// A probe "holds" when the compiler reports no error in that probe file. Errors inside the library's own
// files are not counted (the checkout is compiled without all of its optional dependencies).
// Usage, from a directory whose node_modules holds typescript and @webgpu/types:
//   LITE_SRC=<checkout>/packages/babylon-lite/src node <this file>
import { execFileSync } from "node:child_process";
import { mkdtempSync, readdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const here = import.meta.dirname;
const lite = process.env.LITE_SRC;
if (!lite) {
    throw new Error("Set LITE_SRC to the library's packages/babylon-lite/src directory");
}
const probes = readdirSync(here).filter((f) => /^a\d.*\.ts$/.test(f)).sort();
const work = mkdtempSync(join(process.cwd(), "typecheck-"));
const config = {
    compilerOptions: {
        target: "ES2022",
        module: "ESNext",
        moduleResolution: "bundler",
        lib: ["ES2022", "DOM", "DOM.Iterable"],
        strict: true,
        noUncheckedIndexedAccess: true,
        skipLibCheck: true,
        noEmit: true,
        allowImportingTsExtensions: true,
        types: ["@webgpu/types"],
        typeRoots: [resolve(process.cwd(), "node_modules")],
        paths: { "@babylonjs/lite": [resolve(lite, "index.ts")] },
    },
    files: probes.map((f) => join(here, f)),
};
writeFileSync(join(work, "tsconfig.json"), JSON.stringify(config, null, 2));
let out = "";
try {
    out = execFileSync(resolve(process.cwd(), "node_modules/.bin/tsc"), ["-p", join(work, "tsconfig.json"), "--pretty", "false"], { encoding: "utf8", maxBuffer: 64 << 20 });
} catch (e) {
    out = e.stdout ?? "";
}
const byFile = new Map(probes.map((f) => [f, []]));
for (const line of out.split("\n")) {
    const m = /^(.*?)\((\d+),\d+\): error (TS\d+: .*)$/.exec(line);
    if (!m) continue;
    const file = m[1].split("/").at(-1);
    if (resolve(m[1]).startsWith(here) && byFile.has(file)) byFile.get(file).push(`line ${m[2]}: ${m[3]}`);
}
for (const [file, errors] of byFile) {
    console.log(`${errors.length === 0 ? "holds  " : "differs"} ${file}`);
    for (const e of errors) console.log(`        ${e}`);
}
