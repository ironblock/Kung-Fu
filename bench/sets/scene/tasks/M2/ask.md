# Group parts under one node

Our furniture models are built from several meshes (legs, top, drawers). We want to treat each piece of furniture as one thing. Please write `src/group.ts` exporting:

```ts
import type { Mesh, TransformNode } from "@babylonjs/lite";

export function groupParts(name: string, parts: Mesh[]): TransformNode;
```

It returns a new node with that name, at the origin with no rotation or scaling, with every part placed under it. Grouping must not move any part. After that the group behaves as a unit: moving, turning or scaling the node moves the parts with it; adding the node to a scene adds all of its parts; and hiding the node with the library's call that hides a node together with everything under it hides every part. The parts given have no parent yet.
