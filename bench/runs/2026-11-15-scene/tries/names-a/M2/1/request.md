I'm working on a small viewer app in /home/dev/7b5384/app. It uses Babylon Lite 1.39.0, imported as "@babylonjs/lite". The library is not on this machine, so there is nothing to look it up in or to run.

What I do have is the library's type declarations for the parts I use (meshes, lights, shadows and the scene), in /home/dev/7b5384/app/scene-api.d.ts. Read them first.

# Group parts under one node

Our furniture models are built from several meshes (legs, top, drawers). We want to treat each piece of furniture as one thing. Please write `src/group.ts` exporting:

```ts
import type { Mesh, TransformNode } from "@babylonjs/lite";

export function groupParts(name: string, parts: Mesh[]): TransformNode;
```

It returns a new node with that name, at the origin with no rotation or scaling, with every part placed under it. Grouping must not move any part. After that the group behaves as a unit: moving, turning or scaling the node moves the parts with it; adding the node to a scene adds all of its parts; and hiding the node with the library's call that hides a node together with everything under it hides every part. The parts given have no parent yet.

Please keep every change inside /home/dev/7b5384/app. When you are done, tell me in a sentence or two what you did, and say if there was anything you were not sure of.
