
## Three Major Changes

### 1. Fix Globe Map Tiles

**Root cause:** `Cesium.OpenStreetMapImageryProvider` was removed in CesiumJS 1.115+. Must use `new Cesium.UrlTemplateImageryProvider({ url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png" })` as the direct replacement.

Also set `viewer.scene.globe.show = true` and remove the `baseColor` override (dark baseColor hides the texture).

---

### 2. Hover Tooltips on Globe Markers

**Approach:** React overlay `<div>` positioned absolutely, fed by Cesium's `MOUSE_MOVE` handler.

- On `MOUSE_MOVE`: pick entity → if it has `_customEventId`, find the event data and pass it up via a new `onHoverEvent` prop callback
- In `Index.tsx`: store `hoveredEvent` + mouse position in state
- Render a React `<TooltipOverlay>` component over the canvas that uses `pointer-events-none`
- **Desktop:** shows title + truncated description (2 lines)
- **Mobile detection:** use `useIsMobile()` hook. On mobile, instead of a floating tooltip, always show a small label chip per marker by setting Cesium `label.show = true` with just the title (short font, always visible)

```
CesiumGlobeProps additions:
  onHoverEvent: (event: HistoricalEvent | null, x: number, y: number) => void
  isMobile: boolean
```

Mobile labels: toggle `label.show` on all entities based on `isMobile` prop (new `useEffect`).

---

### 3. Collapsible Events List Panel (right side of globe)

**Architecture: new `EventsListPanel.tsx` component**

This panel lives on the **right edge** of the screen, to the left of (or behind) the existing `EventPanel` detail panel.

States:
- **Collapsed:** only a vertical tab strip (`▶ EVENTOS`) is visible, ~36px wide, clicking opens the list
- **List view:** shows events near the current timeline year (uses `visibleEvents` from `Index`), ~280px wide, with a header showing the year range. Each row = event card with year + title. Clicking → opens detail
- **Detail view:** shows the full `EventPanel` content inline. Has a `← Volver` back button

**Panel behavior:**
- Opens automatically when hovering the timeline slider (via `onTimelineHover` → `hoveredYear`)  
- Opens on marker click (selects event + opens detail immediately)
- Has a close/collapse button
- The existing floating `EventPanel` will be removed — detail is now inside the list panel

**Layout:**
```
[Globe fills full screen]
[Events panel anchored right: 36px collapsed | 300px list | 300px detail]
[Timeline bar at bottom — unchanged]
```

**Data flow changes in `Index.tsx`:**
```
panelState: "collapsed" | "list" | "detail"
selectedEvent: HistoricalEvent | null
hoveredEvent: HistoricalEvent | null   (for tooltip)
mousePos: { x, y }
```

**Timeline hover integration:**
`TimelineBar` emits `onHoverYear(year | null)` — when hovering the slider, the events panel opens in list mode filtered to that hovered year's window, without changing `currentYear`.

---

### Files to Create/Modify

| File | Action |
|---|---|
| `src/components/CesiumGlobe.tsx` | Fix imagery provider, add hover handler, add mobile label toggle |
| `src/components/EventsListPanel.tsx` | **New** — collapsible list + detail panel |
| `src/components/TimelineBar.tsx` | Add `onHoverYear` callback |
| `src/pages/Index.tsx` | Wire new state: hoveredEvent, panelState, mousePos |
| `src/components/EventPanel.tsx` | Keep as-is or remove (detail migrated into EventsListPanel) |

