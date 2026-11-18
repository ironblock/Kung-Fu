In our editor, grabbing an object takes manual control of one of its properties, named by a dotted path from the object, such as `"position.x"`. Write `src/release.ts`, exporting

```ts
export function releaseProperty(manager: AnimationManager, target: object, path: string): void
```

using `@babylonjs/lite` (`AnimationManager` is its type). The groups on `manager` were made by other code from property animation clips, and we update the manager ourselves every frame.

`releaseProperty` stops every group on `manager` that animates that property of `target`, so that once it returns, nothing on the manager writes to that property any more and our code can set it freely. Every other group keeps playing exactly as before: groups that animate other properties of the same object, and groups that animate the same property of other objects. Paths may be one or more levels deep.
