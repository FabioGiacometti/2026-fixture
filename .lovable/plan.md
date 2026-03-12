
## Root cause & fix

The current `NaturalEarthII` texture is a single low-res image bundled with Cesium — it does NOT stream higher-res tiles when zooming. It's a static ~2k texture, hence the blurry California.

**Solution:** Replace `NaturalEarthII` with **OpenStreetMap tiles via `UrlTemplateImageryProvider`**. This streams progressive zoom levels (0–19) on demand, giving full detail when zoomed in.

Previous attempts at OSM failed due to incorrect API usage for newer Cesium. The correct approach for CesiumJS 1.107+ is to pass the provider directly in `baseLayer` using `ImageryLayer.fromProviderAsync`:

```js
baseLayer: Cesium.ImageryLayer.fromProviderAsync(
  Promise.resolve(
    new Cesium.UrlTemplateImageryProvider({
      url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
      maximumLevel: 19,
      credit: "© OpenStreetMap contributors",
    })
  )
)
```

`UrlTemplateImageryProvider` is synchronous (not async), so we wrap it in `Promise.resolve()` so `fromProviderAsync` accepts it without errors.

### Why previous OSM attempts failed
`fromProviderAsync` expects a `Promise<ImageryProvider>`. In older code the provider was passed directly (not as a promise), causing silent failure and falling back to the blue globe default.

### Additional tweak
Keep `skyAtmosphere.show = false` (already done) to prevent the blue atmospheric tint. The tiles themselves will be vivid and sharp at all zoom levels.

### QA plan (browser tools)
After implementing, I'll:
1. Navigate to the preview
2. Screenshot at world zoom level — confirm continents are visible
3. Zoom into California/Europe — confirm tile detail loads progressively
4. Check console logs for any tile 403/CORS errors

### Only file changed
`src/components/CesiumGlobe.tsx` — swap the `baseLayer` constructor argument only (lines 48–53).
