I'm working on a small viewer app in /Users/Shared/kf/boxes/b5a3e3/app. It uses Babylon Lite 1.39.0, imported as "@babylonjs/lite". The library is not on this machine, so there is nothing to look it up in or to run.

What I do have is the library's type declarations for its animation code, in /Users/Shared/kf/boxes/b5a3e3/app/animation-api.d.ts, and some notes on how that code behaves, in /Users/Shared/kf/boxes/b5a3e3/app/animation-notes.md. Read them first.

In our editor, grabbing an object takes manual control of one of its properties, named by a dotted path from the object, such as `"position.x"`. Write `src/release.ts`, exporting

```ts
export function releaseProperty(manager: AnimationManager, target: object, path: string): void
```

using `@babylonjs/lite` (`AnimationManager` is its type). The groups on `manager` were made by other code from property animation clips, some perhaps blended by weight, and we update the manager ourselves every frame.

`releaseProperty` stops every group on `manager` that animates that property of `target`, so that once it returns, nothing on the manager writes to that property any more and our code can set it freely. Every other group keeps playing exactly as before: groups that animate other properties of the same object, and groups that animate the same property of other objects. Paths may be one or more levels deep.

Please keep every change inside /Users/Shared/kf/boxes/b5a3e3/app. When you are done, tell me in a sentence or two what you did, and say if there was anything you were not sure of.
