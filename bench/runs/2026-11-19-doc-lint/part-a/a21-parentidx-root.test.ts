// a-21, line 53: "readonly parentIdx: number; // -1 for root nodes"
// internal: NodeRest is not a public name; its values come from the glTF parser, so this probe runs the parser (see _loader.ts).
import { parsed } from "./_loader.ts";

test("the root node's parentIdx is -1 and a child's is its parent's index", () => {
    const d = parsed();
    expect(d.nodes.map((n) => n.parentIdx)).toEqual([-1, 0]);
});
