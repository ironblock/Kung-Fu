# Cut down one tree

Our forest is a single tree mesh drawn many times, one instance per tree (thin instances). Alongside it we keep `treeIds`, where `treeIds[i]` is the id of the tree that instance `i` draws. Please write `src/forest.ts` exporting:

```ts
import type { Mesh } from "@babylonjs/lite";

export function removeTree(forest: Mesh, treeIds: string[], id: string): void;
```

It stops drawing the tree with that id, and changes `treeIds` in place so that afterwards it still says, for every instance the mesh draws, which tree that instance is: same length as the number of instances drawn, and `treeIds[i]` names the tree drawn by instance `i`. Every other tree stays exactly where it was. An id that is not in the list changes nothing.
