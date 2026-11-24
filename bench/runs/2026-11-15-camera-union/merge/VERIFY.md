# Verify

Script check (all 80 groups): every text is word for word a member's text; every from id exists; no note in two groups; no "false" note of fw-4 to fw-6 used (fw-3:n38 is "false" only against its old text; the mended text is the one used); votes equals the number of different writers; fw-1 to fw-3 member preferred for the text. All passed. Order did NOT follow the rule (14 adjacent pairs out of order, position taken as index in the list file used); fixed by re-sorting.

Read check of the 68 groups with 2+ votes: all members state the same behaviour, with two notes:
- Mean-position order: ties and positions use the 0-based index in each writer's list file (mended for fw-1 to fw-3).
- The pole group (fw-3:n38, fw-1:n37, fw-6:n34) keeps one behaviour but fw-1 and fw-6 give "89.96 degrees" where fw-3 (checked, sin 0.998749) gives 87.13; left as in CONFLICTS.md, kept text is the fw-3 one.

Read check of the 12 single-vote groups (all there were):
- Merged fw-5:n14 (offscreen/clipped/z definitions) into the projectWorldToScreen group with fw-6:n20 and fw-5:n15; votes stay 5.
- Merged fw-5:n50 (flight frames pass through limits, centre on a great circle) into the flyGeospatialCameraToAsync group with fw-4:n24 and fw-6:n39; votes 3 to 4.
- Left single: fw-1:n41 (double-click flight; a different facet from the sphere-pick group), fw-5:n32, fw-5:n22, fw-5:n17, fw-4:n37 and the rest (facets not covered above).

Result: 78 groups, re-sorted by votes then smaller mean position. Post-fix script check passes.
