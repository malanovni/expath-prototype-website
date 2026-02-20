# Valencia Interactive Map (React + MapLibre)

Interactive map of Valencia with metro/train lines and POIs. UI: layer toggles, route toggles, fit-to-city, reset.

## Run
1) Install deps (pinned):
```
npm install
```
2) Dev server:
```
npm run dev
```
3) Open printed URL (default http://localhost:5173).

Env:
- Copy `env.example` to `.env` and set `VITE_MAPTILER_KEY=...` (MapTiler API key).

## Build / preview
```
npm run build
npm run preview
```

## Tests (data sanity)
```
npm test
```

## Data model
- `src/data/valencia.js` — POI categories (icon/color/coords) + routes (line colors, widths, optional dash) + view bounds.
- All coordinates kept within Valencia bounds; tests enforce it.

## Notes
- Map tiles: `https://demotiles.maplibre.org/style.json` (public demo). Swap to your tileserver for production.
- Ready for new addresses: add entries to `categories` or `routes`; UI auto-renders checkboxes and map layers.

# Expath
