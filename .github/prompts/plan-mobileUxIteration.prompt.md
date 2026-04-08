## Plan: Adaptive Mobile Re-orchestration

Refocus the mobile iteration as a **re-orchestration of the existing World Cup experience** rather than a new feature build. The goal is to make the current app understandable and useful in the first 10 seconds on mobile by reusing the existing map, popup, panel, drawer, routing, and filter systems with a simpler hierarchy and stronger defaults.

**Branch**
- `feature/mobile-ux-iteration`

**Product intent**
- Keep the app **map-first**
- Personalize the initial view with **existing filter logic**
- Reduce visible complexity through **progressive disclosure**
- Reuse current components instead of introducing new systems

---

### Phase 1 — Clarify the first mobile impression

1. **Make the map the dominant surface**
   - Keep `CesiumGlobe` as the primary visual on mobile and reduce competing UI on initial load. Make political map and match markers immediately visible and interactive.
   - Minimize simultaneous overlays from the top badges, right panel, and bottom controls.
   - Remove or defer any non-essential modals, drawers, or panels that currently compete for attention on mobile. Only keep the new match popup as the initial card.

2. **Use a smarter default state without adding new logic families**
   - Reuse the current visitor-country and quick-filter behavior already present in `EventsListPanel.tsx`.
   - Default to detected country when available; otherwise start from the broad all-countries state.

3. **Show only one clear contextual card at first**
   - Reuse the current map popup in `Index.tsx` as the main mobile entry card.
   - Keep only the most relevant next-match summary visible initially.

4. **Reduce initial decision load**
   - Hide or defer secondary controls until the user interacts.
   - Preserve the current progressive flow: marker → popup → details/filter.

*Verification for Phase 1:* a first-time mobile user should understand “this is a World Cup map with my relevant next matches” without opening multiple panels.

---

### Phase 2 — Re-orchestrate existing surfaces for progressive disclosure

5. **Use the popup as the lightweight mobile card**
   - Keep the existing popup actions for team, group, venue, and match details.
   - Treat this popup as the primary mobile summary surface rather than a transient desktop-only tooltip.

6. **Use `EventsListPanel.tsx` as the deeper-detail layer**
   - Keep the existing panel but adapt when and how it opens on mobile.
   - Avoid presenting it as a permanent desktop-like side panel; reserve it for drill-down after an explicit user action.

7. **Keep the current filter model, simplify its presentation**
   - Reuse `panelQuickFilters`, route state, and chip logic already in `Index.tsx`, `EventsListPanel.tsx`, and `app-route-state.ts`.
   - Expose only the most relevant chips on mobile: current team, group, and venue context.

8. **Preserve the current zoom-out journey**
   - Keep the same path already implied by filters:
     - team
     - group
     - all groups
   - Reorder emphasis rather than invent new filter mechanics.

*Verification for Phase 2:* users can move from “next relevant match” to “broader competition context” through the current filters without confusion.

---

### Phase 3 — Simplify hierarchy across current UI elements

9. **Make mobile hierarchy explicit**
   - `Index.tsx` should coordinate which existing elements are visible at each stage:
     - initial state: map + one card
     - engaged state: map + contextual filter chips
     - drill-down state: detail panel

10. **Reduce overlap between bottom navigation and match context**
   - Reuse `WorldCupGroupsDrawer.tsx` and `TimelineBar.tsx`, but make them lower-priority during the first mobile interaction.
   - Ensure the user does not see multiple competing drawers/cards at once.

11. **Make current controls feel touch-first**
   - Increase clarity of existing affordances rather than adding new controls:
     - tap marker
     - tap card
     - tap chip
     - close/dismiss
   - Keep the number of visible actions small and obvious.

12. **Avoid “cajitas dentro de cajitas”**
   - Flatten nesting in the current mobile composition.
   - Use spacing, typography, and sequencing to guide the journey instead of more containers.

*Verification for Phase 3:* the interface feels like one coherent mobile flow rather than a compressed desktop layout.

---

### Phase 4 — Product evolution through reuse, not feature expansion

13. **Personalize using existing memory/state**
   - Reuse current route state and filter persistence patterns rather than creating a new personalization system.
   - If prior filters are useful, expose them as lightweight secondary chips only.

14. **Focus the MVP around utility**
   - Keep the differentiator: geographic understanding of the World Cup through an interactive map.
   - Prioritize quick date/location comprehension over content density.

15. **Iterate based on comprehension and retention**
   - Use the current analytics and route-state tracking to evaluate:
     - whether users interact in the first 10 seconds
     - whether they open details
     - whether they broaden from team to group to all

*Verification for Phase 4:* product decisions are guided by how well the existing experience becomes clearer and more useful on mobile.

---

## Relevant files

- `c:\projects\history-map\src\pages\Index.tsx`
  - main orchestration point for mobile visibility, popup priority, filter defaults, and layout sequencing

- `c:\projects\history-map\src\components\CesiumGlobe.tsx`
  - keep map interaction simple and contextual for mobile

- `c:\projects\history-map\src\components\EventsListPanel.tsx`
  - reuse as the drill-down/detail surface rather than a persistent first-view panel

- `c:\projects\history-map\src\components\WorldCupGroupsDrawer.tsx`
  - retain as an existing exploration surface, but reduce first-load dominance

- `c:\projects\history-map\src\components\TimelineBar.tsx`
  - preserve functionality while lowering initial mobile complexity

- `c:\projects\history-map\src\lib\app-route-state.ts`
  - maintain shareable state and analytics-friendly filter progression

- `c:\projects\history-map\src\hooks\use-mobile.tsx`
  - existing mobile breakpoint behavior to guide adaptive orchestration

---

## Scope boundaries

**Included**
- reordering the mobile hierarchy of existing UI
- adapting defaults and visibility rules
- simplifying presentation of current filters, popup, panel, and drawer
- using current analytics/routing to evaluate usage

**Excluded**
- brand new features
- new content systems
- new navigation products
- major backend or data-model changes
- external-link workflows as primary UX

---

## Verification

1. Run `npm test` and `npm run build` after each implementation phase.
2. Manually test on a phone-sized viewport:
   - first load
   - marker tap
   - popup actions
   - detail opening
   - filter broadening from team → group → all
3. Confirm the UI is understandable without prior app knowledge in under 10 seconds.
4. Verify no mobile state creates competing overlays or obscures the map.

---

## Decisions captured

- This iteration is **adaptive**, not additive.
- We should **reuse and re-sequence** existing components rather than invent new ones.
- The mobile success metric is **clarity of first impression**.
- The core journey remains: **map → contextual card → deeper detail**.
