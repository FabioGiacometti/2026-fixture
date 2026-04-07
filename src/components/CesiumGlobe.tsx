import { useEffect, useRef, useState } from "react";
import type { HistoricalEvent, Safari } from "@/data/historical-events";
import {
  ACTIVE_EVENT_COLOR,
  getEventCameraHeight,
  getMarkerAppearance,
  getWorldCupCountryBounds,
  getZoomIndicatorState,
} from "@/lib/globe-ui";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Cesium: any;
  }
}

interface CesiumGlobeProps {
  events: HistoricalEvent[];
  allEvents: HistoricalEvent[];
  selectedEvent: HistoricalEvent | null;
  activeSafari: Safari | null;
  onSelectEvent: (event: HistoricalEvent) => void;
  onHoverEvent: (event: HistoricalEvent | null, x: number, y: number) => void;
  isMobile: boolean;
  mapStyle: "political" | "geographic";
}

export default function CesiumGlobe({
  events,
  allEvents,
  selectedEvent,
  activeSafari,
  onSelectEvent,
  onHoverEvent,
  isMobile,
  mapStyle,
}: CesiumGlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const viewerRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const entitiesRef = useRef<Map<string, any>>(new Map());
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const polylineRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const countryOutlineRef = useRef<any>(null);
  const onSelectRef = useRef(onSelectEvent);
  const onHoverRef = useRef(onHoverEvent);
  const allEventsRef = useRef(allEvents);
  const [zoomIndicator, setZoomIndicator] = useState(() => getZoomIndicatorState(22_000_000));

  useEffect(() => { onSelectRef.current = onSelectEvent; }, [onSelectEvent]);
  useEffect(() => { onHoverRef.current = onHoverEvent; }, [onHoverEvent]);
  useEffect(() => { allEventsRef.current = allEvents; }, [allEvents]);

  /* ── Initialize Cesium viewer once ── */
  useEffect(() => {
    if (!containerRef.current || viewerRef.current) return;

    const Cesium = window.Cesium;
    if (!Cesium) {
      console.error("CesiumJS no está cargado todavía.");
      return;
    }

    Cesium.Ion.defaultAccessToken = "";

    // In CesiumJS 1.107+, `imageryProvider` in Viewer constructor is deprecated.
    // Must use `baseLayer` with ImageryLayer.fromProviderAsync
    const initialProvider = mapStyle === "geographic" 
      ? new Cesium.UrlTemplateImageryProvider({
          url: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          maximumLevel: 19,
          credit: "Tiles © Esri",
        })
      : new Cesium.UrlTemplateImageryProvider({
          url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png",
          subdomains: ["a", "b", "c", "d"],
          maximumLevel: 19,
          credit: "© OpenStreetMap contributors, © CARTO",
        });

    const viewer = new Cesium.Viewer(containerRef.current, {
      baseLayer: Cesium.ImageryLayer.fromProviderAsync(Promise.resolve(initialProvider)),
      baseLayerPicker: false,
      geocoder: false,
      homeButton: false,
      sceneModePicker: false,
      navigationHelpButton: false,
      animation: false,
      timeline: false,
      fullscreenButton: false,
      vrButton: false,
      infoBox: false,
      selectionIndicator: false,
      creditContainer: document.createElement("div"),
    });

    // Scene settings
    viewer.scene.backgroundColor = Cesium.Color.fromCssColorString("#111319");
    viewer.scene.globe.show = true;
    viewer.scene.skyBox.show = false;
    viewer.scene.sun.show = false;
    viewer.scene.moon.show = false;
    viewer.scene.skyAtmosphere.show = false; // off — prevents blue haze over tiles

    const updateZoomIndicator = () => {
      const cameraHeight = viewer.camera.positionCartographic?.height ?? 22_000_000;
      setZoomIndicator(getZoomIndicatorState(cameraHeight));
    };

    viewer.camera.percentageChanged = 0.02;
    viewer.camera.changed.addEventListener(updateZoomIndicator);
    updateZoomIndicator();

    // Initial camera
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(15, 20, 22_000_000),
      duration: 2,
    });

    // Click handler
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    handler.setInputAction((click: any) => {
      const picked = viewer.scene.pick(click.position);
      if (Cesium.defined(picked) && picked.id && picked.id._customEventId) {
        const eventId: string = picked.id._customEventId;
        const found = allEventsRef.current.find((e) => e.id === eventId);
        if (found) onSelectRef.current(found);
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    // Hover handler
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    handler.setInputAction((move: any) => {
      const picked = viewer.scene.pick(move.endPosition);
      if (Cesium.defined(picked) && picked.id && picked.id._customEventId) {
        const eventId: string = picked.id._customEventId;
        const found = allEventsRef.current.find((e) => e.id === eventId);
        if (found) {
          const rect = viewer.scene.canvas.getBoundingClientRect();
          onHoverRef.current(
            found,
            move.endPosition.x + rect.left,
            move.endPosition.y + rect.top
          );
          viewer.scene.canvas.style.cursor = "pointer";
        } else {
          onHoverRef.current(null, 0, 0);
          viewer.scene.canvas.style.cursor = "default";
        }
      } else {
        onHoverRef.current(null, 0, 0);
        viewer.scene.canvas.style.cursor = "default";
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    viewerRef.current = viewer;

    return () => {
      viewer.camera.changed.removeEventListener(updateZoomIndicator);
      handler.destroy();
      if (viewerRef.current && !viewerRef.current.isDestroyed()) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once to initialize viewer

  /* ── Dynamic Layer Switching ── */
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || !window.Cesium) return;
    
    const Cesium = window.Cesium;
    const layers = viewer.scene.imageryLayers;
    
    // Create new provider based on selected style
    const newProvider = mapStyle === "geographic"
      ? new Cesium.UrlTemplateImageryProvider({
          url: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          maximumLevel: 19,
          credit: "Tiles © Esri",
        })
      : new Cesium.UrlTemplateImageryProvider({
          url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png",
          subdomains: ["a", "b", "c", "d"],
          maximumLevel: 19,
          credit: "© OpenStreetMap contributors, © CARTO",
        });

    // We use Promise.resolve as fromProviderAsync expects a promise
    const newLayer = Cesium.ImageryLayer.fromProviderAsync(Promise.resolve(newProvider));
    
    // Add the new layer
    layers.add(newLayer);
    
    // Remove the old layers (excluding the one we just added)
    // We loop backwards to safely remove from the collection
    for (let i = layers.length - 2; i >= 0; i--) {
      layers.remove(layers.get(i));
    }
  }, [mapStyle]);

  /* ── Update markers when visible events change ── */
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || !window.Cesium) return;
    const Cesium = window.Cesium;

    const newIds = new Set(events.map((e) => e.id));
    entitiesRef.current.forEach((entity, id) => {
      if (!newIds.has(id)) {
        viewer.entities.remove(entity);
        entitiesRef.current.delete(id);
      }
    });

    events.forEach((event) => {
      if (entitiesRef.current.has(event.id)) return;

      const isSelected = selectedEvent?.id === event.id;
      const markerAppearance = getMarkerAppearance(isSelected);

      const entity = viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(event.lng, event.lat),
        point: {
          pixelSize: markerAppearance.pixelSize,
          color: Cesium.Color.fromCssColorString(markerAppearance.color).withAlpha(markerAppearance.colorAlpha),
          outlineColor: Cesium.Color.fromCssColorString(markerAppearance.outlineColor),
          outlineWidth: markerAppearance.outlineWidth,
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, event.importance === 1 ? 30000000.0 : event.importance === 2 ? 9000000.0 : 3000000.0),
        },
        label: {
          text: event.title,
          font: "11px 'Space Mono', monospace",
          fillColor: Cesium.Color.fromCssColorString(markerAppearance.labelColor),
          outlineColor: Cesium.Color.fromCssColorString("#111319"),
          outlineWidth: 2,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          pixelOffset: new Cesium.Cartesian2(0, -14),
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
          show: isMobile || isSelected,
          scale: isSelected ? 1 : 0.9,
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, event.importance === 1 ? 30000000.0 : event.importance === 2 ? 9000000.0 : 3000000.0),
        },
      });

      entity._customEventId = event.id;
      entitiesRef.current.set(event.id, entity);
    });
  }, [events, selectedEvent, isMobile]);

  /* ── Highlight selected event and fly camera ── */
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || !window.Cesium) return;
    const Cesium = window.Cesium;

    entitiesRef.current.forEach((entity, id) => {
      const isSelected = selectedEvent?.id === id;
      const markerAppearance = getMarkerAppearance(isSelected);

      if (entity.point) {
        entity.point.pixelSize = markerAppearance.pixelSize;
        entity.point.color = Cesium.Color.fromCssColorString(markerAppearance.color).withAlpha(markerAppearance.colorAlpha);
        entity.point.outlineColor = Cesium.Color.fromCssColorString(markerAppearance.outlineColor);
        entity.point.outlineWidth = markerAppearance.outlineWidth;
      }
      if (entity.label) {
        entity.label.show = isMobile || isSelected;
        entity.label.fillColor = Cesium.Color.fromCssColorString(markerAppearance.labelColor);
        entity.label.scale = isSelected ? 1 : 0.9;
      }
    });

    const worldCupCountryBounds = activeSafari?.id.startsWith("world-cup-")
      ? getWorldCupCountryBounds(selectedEvent?.tournamentId ?? activeSafari.id)
      : null;

    if (worldCupCountryBounds && (!selectedEvent || selectedEvent.eventType !== "match")) {
      viewer.camera.flyTo({
        destination: Cesium.Rectangle.fromDegrees(
          worldCupCountryBounds.west,
          worldCupCountryBounds.south,
          worldCupCountryBounds.east,
          worldCupCountryBounds.north
        ),
        duration: 1.8,
        easingFunction: Cesium.EasingFunction.QUARTIC_IN_OUT,
        orientation: {
          heading: 0,
          pitch: -Cesium.Math.PI_OVER_TWO,
          roll: 0,
        },
      });
      return;
    }

    if (selectedEvent) {
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(
          selectedEvent.lng,
          selectedEvent.lat,
          getEventCameraHeight(selectedEvent)
        ),
        duration: 1.6,
        easingFunction: Cesium.EasingFunction.QUARTIC_IN_OUT,
        orientation: {
          heading: 0,
          pitch: -Cesium.Math.PI_OVER_TWO,
          roll: 0,
        },
      });
    }
  }, [selectedEvent, isMobile, activeSafari]);

  /* ── Render World Cup host outline ── */
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || !window.Cesium) return;
    const Cesium = window.Cesium;

    if (countryOutlineRef.current) {
      viewer.entities.remove(countryOutlineRef.current);
      countryOutlineRef.current = null;
    }

    if (!activeSafari?.id.startsWith("world-cup-")) return;

    const bounds = getWorldCupCountryBounds(activeSafari.id);
    if (!bounds) return;

    countryOutlineRef.current = viewer.entities.add({
      polyline: {
        positions: Cesium.Cartesian3.fromDegreesArray([
          bounds.west, bounds.south,
          bounds.east, bounds.south,
          bounds.east, bounds.north,
          bounds.west, bounds.north,
          bounds.west, bounds.south,
        ]),
        width: 2,
        clampToGround: true,
        material: Cesium.Color.fromCssColorString(activeSafari.color || ACTIVE_EVENT_COLOR).withAlpha(0.9),
      },
    });
  }, [activeSafari]);

  /* ── Render Safari Polyline ── */
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || !window.Cesium) return;
    const Cesium = window.Cesium;

    // Remove old polyline if it exists
    if (polylineRef.current) {
      viewer.entities.remove(polylineRef.current);
      polylineRef.current = null;
    }

    // Only draw if we have an active safari with at least 2 events
    if (activeSafari && activeSafari.eventIds.length > 1) {
      const safariEvents = activeSafari.eventIds
        .map(id => allEvents.find(e => e.id === id))
        .filter((e): e is HistoricalEvent => !!e);

      if (safariEvents.length > 1) {
        const positions = safariEvents.map(e => 
          Cesium.Cartesian3.fromDegrees(e.lng, e.lat)
        );

        polylineRef.current = viewer.entities.add({
          polyline: {
            positions: positions,
            width: 1,
            material: new Cesium.PolylineDashMaterialProperty({
              color: Cesium.Color.fromCssColorString(activeSafari.color || "#F2A900"),
              dashLength: 20,
              gapColor: Cesium.Color.TRANSPARENT,
            }),
            arcType: Cesium.ArcType.GEODESIC,
            clampToGround: true,
          }
        });
      }
    }
  }, [activeSafari, allEvents]);

  return (
    <div className="absolute inset-0">
      <div
        ref={containerRef}
        className="absolute inset-0"
        style={{ background: "#111319" }}
      />

      <div
        className="pointer-events-none absolute bottom-24 left-4 z-30 min-w-[160px] rounded-xl px-3 py-2 sm:bottom-28 sm:left-6"
        style={{
          background: "hsl(var(--card) / 0.82)",
          border: "1px solid hsl(var(--border))",
          backdropFilter: "blur(8px)",
        }}
      >
        <div className="mb-1 flex items-center justify-between gap-3">
          <span
            className="font-mono-space text-[10px] uppercase tracking-[0.2em]"
            style={{ color: "hsl(var(--muted-foreground))" }}
          >
            Zoom
          </span>
          <span
            className="font-mono-space text-[10px]"
            style={{ color: "hsl(var(--foreground))" }}
          >
            {zoomIndicator.percent}%
          </span>
        </div>

        <div
          className="h-1.5 overflow-hidden rounded-full"
          style={{ background: "hsl(var(--border) / 0.55)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-200"
            style={{
              width: `${zoomIndicator.percent}%`,
              background: ACTIVE_EVENT_COLOR,
            }}
          />
        </div>

        <div className="mt-1.5 flex items-center justify-between gap-3">
          <span
            className="font-mono-space text-[11px]"
            style={{ color: ACTIVE_EVENT_COLOR }}
          >
            {zoomIndicator.label}
          </span>
          <span
            className="font-mono-space text-[10px]"
            style={{ color: "hsl(var(--muted-foreground))" }}
          >
            {zoomIndicator.altitudeKm.toLocaleString()} km
          </span>
        </div>
      </div>
    </div>
  );
}
