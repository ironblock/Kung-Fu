# Conflicts

One group holds members that state different numbers.

## GeospatialCamera centre moved off a pole (group from fw-1:n37, fw-3:n38, fw-6:n34)

- fw-3:n38 (tested, kept as the group's text, the longest tested member): "A geospatial center written with spherical latitude asin(z/|center|) beyond +-87.13 degrees (0.05 rad from the +-Z pole) is moved to +-87.13, keeping its distance from the origin and its longitude."
- fw-1:n37 (tested): "A GeospatialCamera centre on the Z axis (a pole) is moved to latitude about 89.96 degrees at the same distance from the origin."
- fw-6:n34 (read, holds): "Every GeospatialCamera orientation change moves center off the poles to |sin(latitude)| <= 0.998749 (about 89.96 deg), keeping its distance from the origin; center is never snapped to the planet surface."

The numbers differ: fw-3:n38 gives a latitude limit of about 87.13 degrees; fw-1:n37 and fw-6:n34 give about 89.96 degrees. Both fw-1:n37 and fw-3:n38 are tested notes, so the rule "keep the fw-1 to fw-3 member" does not decide between them; the longer tested member was kept by step 3.
