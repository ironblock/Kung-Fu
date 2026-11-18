I'm working on a small viewer app in /Users/Shared/kf/boxes/54aec0/app. It uses Babylon Lite 1.39.0, imported as "@babylonjs/lite". The library is not on this machine, so there is nothing to look it up in or to run.

What I do have is the library's type declarations for its animation code, in /Users/Shared/kf/boxes/54aec0/app/animation-api.d.ts, and some notes on how that code behaves, in /Users/Shared/kf/boxes/54aec0/app/animation-notes.md. Read them first.

A floating pickup bobs up and down. Write `src/hover.ts`, exporting

```ts
export function startHover(manager: AnimationManager, node: { position: { y: number } }): (strength: number) => void
```

using `@babylonjs/lite` (`AnimationManager` is its type).

The height `node.position.y` has when `startHover` is called is the pickup's rest height. The bob starts at once on `manager`, which we update ourselves every frame. Each second, the height rises at a steady rate to 0.5 above rest over half a second, comes back down to rest over the next half, and this repeats.

The returned function sets the bob's strength, from 0 to 1 (it starts at 1). At strength s the bob rises only s × 0.5 above rest, on the same rhythm, so at 0 the pickup sits still at rest. A new strength first shows at the next update and does not restart the bob. Many pickups may share one manager.

Please keep every change inside /Users/Shared/kf/boxes/54aec0/app. When you are done, tell me in a sentence or two what you did, and say if there was anything you were not sure of.
