// List the names a directory of TypeScript exports, one per line as "file<TAB>kind<TAB>name", with the
// TypeScript compiler's own parser. Usage: node exports.js DIR
const ts = require("typescript"), fs = require("fs"), path = require("path");
const dir = process.argv[2];
for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".ts")).sort()) {
  const source = ts.createSourceFile(file, fs.readFileSync(path.join(dir, file), "utf8"), ts.ScriptTarget.Latest, true);
  const out = (kind, name) => console.log([file, kind, name].join("\t"));
  for (const node of source.statements) {
    const exported = (ts.getCombinedModifierFlags(node) & ts.ModifierFlags.Export) !== 0;
    if (ts.isExportDeclaration(node)) {
      if (node.exportClause && ts.isNamedExports(node.exportClause))
        for (const el of node.exportClause.elements) out(node.moduleSpecifier ? "passed on" : "listed", el.name.text);
      else out("passed on", "* from " + node.moduleSpecifier.text);
    } else if (!exported) continue;
    else if (ts.isVariableStatement(node)) for (const d of node.declarationList.declarations) out("variable", d.name.getText(source));
    else if (ts.isFunctionDeclaration(node)) out("function", node.name ? node.name.text : "default");
    else if (ts.isClassDeclaration(node)) out("class", node.name ? node.name.text : "default");
    else if (ts.isInterfaceDeclaration(node)) out("interface", node.name.text);
    else if (ts.isTypeAliasDeclaration(node)) out("type", node.name.text);
    else if (ts.isEnumDeclaration(node)) out("enum", node.name.text);
    else out(ts.SyntaxKind[node.kind], "?");
  }
}
