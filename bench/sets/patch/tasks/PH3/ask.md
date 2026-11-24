# Show the latest amendment on the sheet

When a manifest has been amended, the sheet only says how many amendments there are. The yard hand wants to see the most recent one without ringing the office.

Please change `renderManifest` in `src/manifest.ts`. Straight after the line that counts the amendments, add one line for the most recent of the amendments that line counts, in this form:

```
Latest: <what was noted> (<who noted it>)
```

For example, if the most recent amendment was noted by R. Okafor and says "gas bottle swapped", the line is:

```
Latest: gas bottle swapped (R. Okafor)
```

Only the most recent amendment gets a line. A sheet with no amendments stays exactly as it is now.
