# Set a clip's share at once

Please add `src/set-share.ts`. It exports:

```ts
export function setShareNow(manager: AnimationManager, group: AnimationGroup, share: number): void;
```

The types come from `@babylonjs/lite`. `share` is between 0 and 1.

`group` plays on `manager`, mixed by weight with other groups on the same property. Weighted blending is already switched on for the manager. Our own loop steps it each frame. Elsewhere in the app we fade the shares of groups over time with the library's fade. A slider can also set a share, and it must take over at once.

When I call `setShareNow`, the group's weight must be `share` right away. The very next frame, however short, is mixed with it. On every later frame it stays at `share`, whatever fade was under way for this group before. If I later fade this group again with the library's fade, that fade must work as usual.
