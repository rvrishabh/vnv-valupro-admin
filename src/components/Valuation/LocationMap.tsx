/** Parses "lat, lng" as entered against M-Doc's GPS co-ordinates cell. */
function parseCoordinates(value: string): { lat: number; lng: number } | null {
  const parts = value.split(",").map((part) => part.trim());
  if (parts.length !== 2) return null;

  const [lat, lng] = parts.map(Number);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;

  return { lat, lng };
}

export function LocationMap({ coordinates }: { coordinates: string }) {
  const parsed = parseCoordinates(coordinates);

  if (!parsed) {
    return (
      <div className="flex h-48 items-center justify-center rounded-md border bg-muted/40 text-xs text-muted-foreground">
        Enter GPS co-ordinates as "lat, lng" to preview the location on the map.
      </div>
    );
  }

  const { lat, lng } = parsed;

  return (
    <iframe
      title="Property location"
      className="h-48 w-full rounded-md border"
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      src={`https://maps.google.com/maps?q=${lat},${lng}&z=16&output=embed`}
    />
  );
}
