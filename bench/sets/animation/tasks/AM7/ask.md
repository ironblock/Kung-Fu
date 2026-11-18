# Two clips at full weight

We will layer an upper-body clip over a lower-body clip with masks, and must pick the weights. Answer from Babylon Lite.

Setup: a skinned glTF character with parentless bones `Upper` and `Lower`, both resting at y = 4. Its clips play on one manager made with an engine, skeletal blending on. Clip A holds `Upper` at y = 2, `Lower` at y = 3. Clip B holds `Upper` at y = 6, `Lower` at y = 7. A joins the manager before B unless said otherwise. Read bones after one update.

Write `notes/am7-full-weight.json`:

```json
{ "bothFullUpperY": 0, "bothFullBAddedFirstUpperY": 0, "layeredLowerY": 0, "layeredLowerYWithBAtHalf": 0 }
```

- `bothFullUpperY`: no masks, both at weight 1.
- `bothFullBAddedFirstUpperY`: the same, B added first.
- `layeredLowerY`: A's mask leaves out `Upper`; B's keeps only `Upper`; both at 1.
- `layeredLowerYWithBAtHalf`: those masks, A at 1, B at 0.5.
