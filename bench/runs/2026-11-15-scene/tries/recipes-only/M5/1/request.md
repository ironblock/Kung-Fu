I'm working on a small viewer app in /home/dev/90bcaf/app. It uses Babylon Lite 1.39.0, imported as "@babylonjs/lite". The library is not on this machine, so there is nothing to look it up in or to run.

What I do have is some recipes for building a scene with it, in /home/dev/90bcaf/app/scene-recipes.md. Read them first.

# Cut down one tree

Our forest is a single tree mesh drawn many times, one instance per tree (thin instances). Alongside it we keep `treeIds`, where `treeIds[i]` is the id of the tree that instance `i` draws. Please write `src/forest.ts` exporting:

```ts
import type { Mesh } from "@babylonjs/lite";

export function removeTree(forest: Mesh, treeIds: string[], id: string): void;
```

It stops drawing the tree with that id, and changes `treeIds` in place so that afterwards it still says, for every instance the mesh draws, which tree that instance is: same length as the number of instances drawn, and `treeIds[i]` names the tree drawn by instance `i`. Every other tree stays exactly where it was. An id that is not in the list changes nothing.

Please keep every change inside /home/dev/90bcaf/app. When you are done, tell me in a sentence or two what you did, and say if there was anything you were not sure of.
