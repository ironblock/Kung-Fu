I'm working on a small viewer app in /Users/Shared/kf/boxes/fe1b95/app. It uses Babylon Lite 1.39.0, imported as "@babylonjs/lite". The library is not on this machine, so there is nothing to look it up in or to run.

What I do have is the library's type declarations for its animation code, in /Users/Shared/kf/boxes/fe1b95/app/animation-api.d.ts, and some notes on how that code behaves, in /Users/Shared/kf/boxes/fe1b95/app/animation-notes.md. Read them first.

# Set a clip's share at once

Please add `src/set-share.ts`. It exports:

```ts
export function setShareNow(manager: AnimationManager, group: AnimationGroup, share: number): void;
```

The types come from `@babylonjs/lite`. `share` is between 0 and 1.

`group` plays on `manager`, mixed by weight with other groups on the same property. Weighted blending is already on for the manager. Only our loop steps it, once a frame. Elsewhere we fade groups' shares over time with the library's fade. A slider can also set a share, and it must take over at once.

When I call `setShareNow`, the group's weight must be `share` right away. The very next frame, however short, is mixed with it. On every later frame it stays at `share`, whatever fade was under way for this group before; fades of other groups go on. If I later fade this group again with the library's fade, it must work as usual.

Please keep every change inside /Users/Shared/kf/boxes/fe1b95/app. When you are done, tell me in a sentence or two what you did, and say if there was anything you were not sure of.
