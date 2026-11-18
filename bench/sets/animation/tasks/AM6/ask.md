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
