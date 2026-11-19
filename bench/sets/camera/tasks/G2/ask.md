# Centre the globe camera on a latitude and longitude

Our search box returns places as latitude and longitude in degrees. Please write `src/center-on.ts` exporting:

```ts
import type { GeospatialCamera } from "@babylonjs/lite";

export function centerOnLatLon(camera: GeospatialCamera, latitudeDeg: number, longitudeDeg: number): void;
```

It moves the camera's centre point, and with it the camera's view, to the ground point at that latitude and longitude, on the planet's surface (a sphere of the camera's planet radius, centred at the origin). The zoom, heading and tilt stay as they were.

Latitude is positive to the north, longitude positive to the east. Latitude 0, longitude 0 is the point a newly created camera is centred on. North and east must be the camera's own: a camera centred there and given a heading of 90° (east) must be looking toward the places of positive longitude. We pass latitudes between -80 and 80.
