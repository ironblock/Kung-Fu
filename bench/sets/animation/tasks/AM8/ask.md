# Putting a clip back

For property clips on one property, we want the clip started last to win, by taking a clip off its manager and putting it back. Answer from Babylon Lite before we build on it.

Setup: one manager, no blending, all weights 1. Clip A holds `x` of an object at 10; clip B holds it at 30. A's group was made on the manager first, then B's. Each field starts from this setup and reads `x` after one update.

Write `notes/am8-order.json`:

```json
{ "xAtStart": 0, "xAfterReAddingA": 0, "indexOfAAfterReAddingA": 0, "xAfterClearThenBThenA": 0, "xAfterNewGroupForA": 0 }
```

- `xAtStart`: no change.
- `xAfterReAddingA`: A's group taken off the manager, then put back.
- `indexOfAAfterReAddingA`: then, its index in the manager's list of groups.
- `xAfterClearThenBThenA`: manager cleared, then B's group added, then A's.
- `xAfterNewGroupForA`: a second group for clip A, on the same manager and object.
