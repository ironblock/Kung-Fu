I'm working on a small viewer app in /home/dev/c0c46c/app. It uses Babylon Lite 1.39.0, imported as "@babylonjs/lite". The library is not on this machine, so there is nothing to look it up in or to run.

What I do have is the library's type declarations for its animation code, in /home/dev/c0c46c/app/animation-api.d.ts, and the makers' own document about that code, in /home/dev/c0c46c/app/animation-doc.md. Read them first.

# How weights mix on a skinned character

We must decide whether a lone clip can fade out to the rest pose, or whether we need an idle clip to cross-fade into. Answer from what Babylon Lite does.

Setup: a skinned glTF character. Its clips are on one manager made with an engine, with the library's skeletal blending on. The bone `Spine` has no parent. At rest it sits at y = 4, not turned. Clip A holds `Spine` at y = 2, turned 90° about the Y axis. Clip B holds it at y = 6, with no rotation track. Read the bone after one update.

Write `notes/am6-weights.json`:

```json
{ "aloneHalfY": 0, "aloneHalfTurnDegrees": 0, "bothHalfY": 0, "bothThreeQuartersY": 0 }
```

- `aloneHalfY`, `aloneHalfTurnDegrees`: only A plays, at weight 0.5.
- `bothHalfY`: A and B play, each at weight 0.5.
- `bothThreeQuartersY`: A and B play, each at weight 0.75.

Please keep every change inside /home/dev/c0c46c/app. When you are done, tell me in a sentence or two what you did, and say if there was anything you were not sure of.
