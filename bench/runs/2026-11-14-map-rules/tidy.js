#!/usr/bin/env node
// Make a copy of a tree of TypeScript in which nothing the code does is changed, and one thing about how
// it is written is.
//
// Usage: node tidy.js KIND SOURCE OUT MODULES
//   KIND     comments   every comment is taken out
//            names      every parameter, and every variable declared inside a function, gets a new name
//            format     every file is printed again by the formatter at 80 columns, where the library uses 180
//   SOURCE   the tree to copy; OUT where the copy goes; MODULES a node_modules that holds typescript and prettier
//
// A row of a ledger that passes on SOURCE and fails on OUT gave a false alarm, unless its claim is about
// the thing that was changed. For `names` the copy is checked: it must parse, and each file must draw the
// same kinds of complaint from the compiler, in the same number, as it did before.
const fs = require("fs"), path = require("path");
const [kind, source, out, modules] = process.argv.slice(2);
if (!["comments", "names", "format"].includes(kind) || !modules) {
    console.error("usage: node tidy.js comments|names|format SOURCE OUT MODULES");
    process.exit(2);
}
const ts = require(path.join(modules, "typescript"));

function files(dir) {
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
        const p = path.join(dir, e.name);
        return e.isDirectory() ? files(p) : [p];
    });
}
const all = files(source);
const code = all.filter((f) => /\.tsx?$/.test(f) && !/\.d\.ts$/.test(f));
const texts = new Map(code.map((f) => [path.resolve(f), fs.readFileSync(f, "utf8")]));

function write(changed) {
    for (const f of all) {
        const to = path.join(out, path.relative(source, f));
        fs.mkdirSync(path.dirname(to), { recursive: true });
        const text = changed.get(path.resolve(f));
        if (text === undefined) fs.copyFileSync(f, to);
        else fs.writeFileSync(to, text);
    }
}

// Apply edits {start, end, text}, none of which overlap, to one text.
function apply(text, edits) {
    edits.sort((a, b) => b.start - a.start || b.end - a.end);
    let last = Infinity;
    for (const e of edits) {
        if (e.end > last) throw new Error("two edits overlap");
        text = text.slice(0, e.start) + e.text + text.slice(e.end);
        last = e.start;
    }
    return text;
}

function comments() {
    const changed = new Map();
    let taken = 0;
    for (const [file, text] of texts) {
        const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
        const ranges = new Map();
        const note = (r) => r && r.forEach((c) => ranges.set(c.pos, c.end));
        const walk = (node) => {
            if (node.kind >= ts.SyntaxKind.FirstJSDocNode && node.kind <= ts.SyntaxKind.LastJSDocNode) return;
            const kids = node.getChildren(sf);
            // Only a token is followed or led by trivia that is not inside some other token.
            if (kids.length === 0 && node.kind !== ts.SyntaxKind.JsxText) {
                note(ts.getLeadingCommentRanges(text, node.getFullStart()));
                note(ts.getTrailingCommentRanges(text, node.getEnd()));
            }
            kids.forEach(walk);
        };
        walk(sf);
        taken += ranges.size;
        const comment = new Uint8Array(text.length);
        for (const [start, end] of ranges) comment.fill(1, start, end);
        // Build the new text line by line from the old. A line that held only comment goes with it.
        const built = [];
        let offset = 0;
        for (const old of text.split("\n")) {
            let line = "", touched = false;
            for (let k = 0; k < old.length; k++) {
                if (comment[offset + k]) touched = true;
                else line += old[k];
            }
            offset += old.length + 1;
            if (!(touched && line.trim() === "")) built.push(touched ? line.replace(/\s+$/, "") : line);
        }
        changed.set(file, built.join("\n"));
    }
    return { changed, said: `${taken} comments taken out of ${texts.size} files` };
}

function host(map) {
    const options = { target: ts.ScriptTarget.ESNext, module: ts.ModuleKind.ESNext, moduleResolution: ts.ModuleResolutionKind.Bundler,
        noEmit: true, allowJs: false, skipLibCheck: true, strict: true, types: [] };
    return {
        options,
        service: ts.createLanguageService({
            getScriptFileNames: () => [...map.keys()],
            getScriptVersion: () => "1",
            getScriptSnapshot: (f) => {
                const t = map.has(f) ? map.get(f) : fs.existsSync(f) ? fs.readFileSync(f, "utf8") : undefined;
                return t === undefined ? undefined : ts.ScriptSnapshot.fromString(t);
            },
            getCurrentDirectory: () => path.resolve(source),
            getCompilationSettings: () => options,
            getDefaultLibFileName: (o) => ts.getDefaultLibFilePath(o),
            fileExists: (f) => map.has(f) || fs.existsSync(f),
            readFile: (f) => (map.has(f) ? map.get(f) : fs.readFileSync(f, "utf8")),
        }),
    };
}

// For each file, the kinds of complaint the compiler makes about it and how many of each.
function complaints(map) {
    const { service } = host(map);
    const got = new Map();
    for (const f of map.keys()) {
        const counts = {};
        for (const d of [...service.getSyntacticDiagnostics(f), ...service.getSemanticDiagnostics(f)]) counts[d.code] = (counts[d.code] || 0) + 1;
        got.set(f, JSON.stringify(Object.entries(counts).sort()));
    }
    return got;
}

function names() {
    const { service } = host(texts);
    const program = service.getProgram();
    const changed = new Map();
    let renamed = 0, skipped = 0;
    for (const [file, text] of texts) {
        const sf = program.getSourceFile(file);
        const used = new Set();
        const targets = [];
        const inFunction = (node) => {
            for (let p = node.parent; p; p = p.parent) if (ts.isFunctionLike(p) && p.body) return true;
            return false;
        };
        const bound = (name, into) => {
            if (ts.isIdentifier(name)) into.push(name);
            else name.elements.forEach((e) => !ts.isOmittedExpression(e) && bound(e.name, into));
        };
        const walk = (node) => {
            if (ts.isIdentifier(node)) used.add(node.text);
            if (ts.isParameter(node) && node.parent.body && !(ts.isIdentifier(node.name) && node.name.text === "this")
                && !ts.hasSyntacticModifier(node, ts.ModifierFlags.ParameterPropertyModifier)) bound(node.name, targets);
            else if (ts.isVariableDeclaration(node) && inFunction(node)) bound(node.name, targets);
            ts.forEachChild(node, walk);
        };
        walk(sf);
        const edits = [];
        const seen = new Set();
        for (const id of targets) {
            let suffix = "_n";
            while (used.has(id.text + suffix)) suffix += "n";
            const places = service.findRenameLocations(file, id.getStart(sf), false, false, { providePrefixAndSuffixTextForRename: true });
            if (!places || places.some((p) => p.fileName !== file)) { skipped++; continue; }
            const mine = places.map((p) => ({ start: p.textSpan.start, end: p.textSpan.start + p.textSpan.length,
                text: (p.prefixText || "") + id.text + suffix + (p.suffixText || "") }));
            if (mine.some((e) => seen.has(e.start))) { skipped++; continue; }
            mine.forEach((e) => seen.add(e.start));
            edits.push(...mine);
            renamed++;
        }
        changed.set(file, apply(text, edits));
    }
    const before = complaints(texts), after = complaints(changed);
    let differ = 0;
    for (const f of texts.keys()) if (before.get(f) !== after.get(f)) { differ++; if (differ <= 5) console.error("differs:", path.relative(source, f), before.get(f), after.get(f)); }
    return { changed, said: `${renamed} parameters and variables given a new name in ${texts.size} files, ${skipped} left as they were; ` +
        `${differ} files draw other complaints from the compiler than before` };
}

async function format() {
    const prettier = require(path.join(modules, "prettier"));
    const changed = new Map();
    let moved = 0;
    for (const [file, text] of texts) {
        const again = await prettier.format(text, { parser: "typescript", trailingComma: "es5", tabWidth: 4, printWidth: 80, endOfLine: "auto" });
        if (again !== text) moved++;
        changed.set(file, again);
    }
    return { changed, said: `${moved} of ${texts.size} files read differently at 80 columns` };
}

(async () => {
    const { changed, said } = kind === "comments" ? comments() : kind === "names" ? names() : await format();
    for (const [file, text] of changed) {
        const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, false);
        if (sf.parseDiagnostics.length) throw new Error(`${file} does not parse after the change`);
    }
    write(changed);
    console.log(said);
})();
