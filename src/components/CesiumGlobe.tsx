import { useEffect, useRef, useState } from "react";
import type { HistoricalEvent } from "@/data/historical-events";

declare global {
  interface Window {
    Cesium: any;
  }
}

interface CesiumGlobeProps {
  events: HistoricalEvent[];
  selectedEvent: HistoricalEvent | null;
  onSelectEvent: (event: HistoricalEvent) => void;
  onHoverEvent: (event: HistoricalEvent | null, x: number, y: number) => void;
  isMobile: boolean;
  mapStyle: "political" | "geographic";
}

export default function CesiumGlobe({
  events,
  selectedEvent,
  onSelectEvent,
  onHoverEvent,
  isMobile,
  mapStyle,
}: CesiumGlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const entitiesRef = useRef<Map<string, any>>(new Map());
  const onSelectRef = useRef(onSelectEvent);
  const onHoverRef = useRef(onHoverEvent);

  useEffect(() => { onSelectRef.current = onSelectEvent; }, [onSelectEvent]);
  useEffect(() => { onHoverRef.current = onHoverEvent; }, [onHoverEvent]);

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

    // Initial camera
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(15, 20, 22_000_000),
      duration: 2,
    });

    // Click handler
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction((click: any) => {
      const picked = viewer.scene.pick(click.position);
      if (Cesium.defined(picked) && picked.id && picked.id._customEventId) {
        const eventId: string = picked.id._customEventId;
        import("@/data/historical-events").then(({ historicalEvents }) => {
          const found = historicalEvents.find((e) => e.id === eventId);
          if (found) onSelectRef.current(found);
        });
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    // Hover handler
    handler.setInputAction((move: any) => {
      const picked = viewer.scene.pick(move.endPosition);
      if (Cesium.defined(picked) && picked.id && picked.id._customEventId) {
        const eventId: string = picked.id._customEventId;
        import("@/data/historical-events").then(({ historicalEvents }) => {
          const found = historicalEvents.find((e) => e.id === eventId);
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
        });
      } else {
        onHoverRef.current(null, 0, 0);
        viewer.scene.canvas.style.cursor = "default";
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    viewerRef.current = viewer;

    return () => {
      handler.destroy();
      if (viewerRef.current && !viewerRef.current.isDestroyed()) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
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
      const entity = viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(event.lng, event.lat),
        point: {
          pixelSize: isSelected ? 14 : 8,
          color: isSelected
            ? Cesium.Color.fromCssColorString("#F2A900")
            : Cesium.Color.fromCssColorString("#F2A900").withAlpha(0.7),
          outlineColor: Cesium.Color.fromCssColorString("#F2A900").withAlpha(0.3),
          outlineWidth: isSelected ? 6 : 0,
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
        label: {
          text: event.title,
          font: "11px 'Space Mono', monospace",
          fillColor: Cesium.Color.fromCssColorString("#E1E3E8"),
          outlineColor: Cesium.Color.fromCssColorString("#111319"),
          outlineWidth: 2,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          pixelOffset: new Cesium.Cartesian2(0, -14),
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
          show: isMobile, // always show on mobile, hide on desktop (tooltip handles it)
          scale: 0.9,
        },
      });

      entity._customEventId = event.id;
      entitiesRef.current.set(event.id, entity);
    });
  }, [events, selectedEvent]);

  /* ── Highlight selected event and fly camera ── */
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || !window.Cesium) return;
    const Cesium = window.Cesium;

    entitiesRef.current.forEach((entity, id) => {
      const isSelected = selectedEvent?.id === id;
      if (entity.point) {
        entity.point.pixelSize = isSelected ? 16 : 8;
        entity.point.color = isSelected
          ? Cesium.Color.fromCssColorString("#F2A900")
          : Cesium.Color.fromCssColorString("#F2A900").withAlpha(0.65);
        entity.point.outlineWidth = isSelected ? 8 : 0;
      }
      if (entity.label) {
        entity.label.show = isMobile || isSelected;
      }
    });

    if (selectedEvent) {
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(
          selectedEvent.lng,
          selectedEvent.lat,
          3_500_000
        ),
        duration: 1.6,
        easingFunction: Cesium.EasingFunction.QUARTIC_IN_OUT,
      });
    }
  }, [selectedEvent, isMobile]);

  /* ── Toggle mobile labels ── */
  useEffect(() => {
    if (!viewerRef.current || !window.Cesium) return;
    entitiesRef.current.forEach((entity, id) => {
      if (entity.label) {
        entity.label.show = isMobile || selectedEvent?.id === id;
      }
    });
  }, [isMobile, selectedEvent]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0"
      style={{ background: "#111319" }}
    />
  );
}
