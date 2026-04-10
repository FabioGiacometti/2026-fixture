import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import type { HistoricalEvent, Safari } from "@/data/historical-events";
import {
  ACTIVE_EVENT_COLOR,
  DEFAULT_MAX_CAMERA_HEIGHT,
  MIN_CAMERA_HEIGHT,
  getCameraHeightForZoomPercent,
  getEventZoomPercent,
  getMapThemeColors,
  getMarkerAppearance,
  getMaxZoomOutCameraHeight,
  getSafariPathEvents,
  getWheelZoomCameraHeight,
  getUpcomingMatchTooltipLabel,
  isUpcomingWorldCupMatch,
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
  focusedEvent?: HistoricalEvent | null;
  activeSafari: Safari | null;
  onSelectEvent: (event: HistoricalEvent) => void;
  onSelectVenue?: (event: HistoricalEvent, x: number, y: number) => void;
  onHoverEvent: (event: HistoricalEvent | null, x: number, y: number) => void;
  isMobile: boolean;
  mapStyle: "political" | "geographic";
  showSafariPath?: boolean;
}

export default function CesiumGlobe({
  events,
  allEvents,
  selectedEvent,
  focusedEvent = null,
  activeSafari,
  onSelectEvent,
  onSelectVenue,
  onHoverEvent,
  isMobile,
  mapStyle,
  showSafariPath = true,
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
  const onSelectVenueRef = useRef(onSelectVenue);
  const onHoverRef = useRef(onHoverEvent);
  const allEventsRef = useRef(allEvents);
  const maxZoomOutHeightRef = useRef(DEFAULT_MAX_CAMERA_HEIGHT);
  const pinchStartDistanceRef = useRef<number | null>(null);
  const pinchStartHeightRef = useRef(DEFAULT_MAX_CAMERA_HEIGHT);
  const isSyncingCameraRef = useRef(false);
  const [zoomIndicator, setZoomIndicator] = useState(() => getZoomIndicatorState(DEFAULT_MAX_CAMERA_HEIGHT));
  const showZoomIndicator = false;
  const { theme } = useTheme();
  const themeKey = theme ?? "geological-dark";
  const mapThemeColors = getMapThemeColors();

  useEffect(() => { onSelectRef.current = onSelectEvent; }, [onSelectEvent]);
  useEffect(() => { onSelectVenueRef.current = onSelectVenue; }, [onSelectVenue]);
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
    viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

    // Scene settings
    viewer.scene.backgroundColor = Cesium.Color.fromCssColorString(mapThemeColors.sceneBackground);
    viewer.scene.globe.show = true;
    viewer.scene.skyBox.show = false;
    viewer.scene.sun.show = false;
    viewer.scene.moon.show = false;
    viewer.scene.skyAtmosphere.show = false; // off — prevents blue haze over tiles
    viewer.camera.constrainedAxis = Cesium.Cartesian3.UNIT_Z;

    const cameraController = viewer.scene.screenSpaceCameraController;

    const updateZoomIndicator = () => {
      const cameraHeight = viewer.camera.positionCartographic?.height ?? maxZoomOutHeightRef.current;
      setZoomIndicator(getZoomIndicatorState(cameraHeight, maxZoomOutHeightRef.current));
    };

    const applyCenteredZoom = (nextHeight: number) => {
      const cameraPosition = viewer.camera.positionCartographic;
      if (!cameraPosition) return;

      const clampedHeight = Math.min(
        maxZoomOutHeightRef.current,
        Math.max(MIN_CAMERA_HEIGHT, nextHeight)
      );

      isSyncingCameraRef.current = true;
      viewer.camera.setView({
        destination: Cesium.Cartesian3.fromRadians(
          cameraPosition.longitude,
          cameraPosition.latitude,
          clampedHeight
        ),
        orientation: {
          heading: viewer.camera.heading,
          pitch: -Cesium.Math.PI_OVER_TWO,
          roll: 0,
        },
      });
      isSyncingCameraRef.current = false;
      updateZoomIndicator();
    };

    const lockCameraToTopDownView = () => {
      if (isSyncingCameraRef.current) return;

      const cameraPosition = viewer.camera.positionCartographic;
      if (!cameraPosition) return;

      const clampedHeight = Math.min(
        maxZoomOutHeightRef.current,
        Math.max(MIN_CAMERA_HEIGHT, cameraPosition.height ?? maxZoomOutHeightRef.current)
      );
      const needsPitchReset = Math.abs(viewer.camera.pitch + Cesium.Math.PI_OVER_TWO) > 1e-4;
      const needsRollReset = Math.abs(viewer.camera.roll) > 1e-4;
      const needsHeightClamp = Math.abs(clampedHeight - (cameraPosition.height ?? clampedHeight)) > 1;

      if (!needsPitchReset && !needsRollReset && !needsHeightClamp) {
        return;
      }

      applyCenteredZoom(clampedHeight);
    };

    const syncInteractionConstraints = () => {
      const viewportWidth = containerRef.current?.clientWidth ?? viewer.scene.canvas.clientWidth ?? window.innerWidth;
      const viewportHeight = containerRef.current?.clientHeight ?? viewer.scene.canvas.clientHeight ?? window.innerHeight;
      const maxZoomOutHeight = getMaxZoomOutCameraHeight(viewportWidth, viewportHeight);

      maxZoomOutHeightRef.current = maxZoomOutHeight;
      cameraController.enableRotate = true;
      cameraController.enableZoom = true;
      cameraController.enableTilt = false;
      cameraController.enableLook = false;
      cameraController.enableTranslate = false;
      cameraController.minimumZoomDistance = MIN_CAMERA_HEIGHT;
      cameraController.maximumZoomDistance = maxZoomOutHeight;
      cameraController.rotateEventTypes = [Cesium.CameraEventType.LEFT_DRAG];
      cameraController.zoomEventTypes = [];
      cameraController.translateEventTypes = [];
      cameraController.tiltEventTypes = [];
      cameraController.lookEventTypes = [];
      cameraController.inertiaSpin = 0.85;
      cameraController.inertiaTranslate = 0;
      cameraController.inertiaZoom = 0.7;

      lockCameraToTopDownView();
      updateZoomIndicator();
    };

    viewer.camera.percentageChanged = 0.02;
    viewer.camera.changed.addEventListener(updateZoomIndicator);
    viewer.camera.changed.addEventListener(lockCameraToTopDownView);
    syncInteractionConstraints();
    window.addEventListener("resize", syncInteractionConstraints);

    // Initial camera
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(15, 20, maxZoomOutHeightRef.current),
      duration: 2,
      orientation: {
        heading: 0,
        pitch: -Cesium.Math.PI_OVER_TWO,
        roll: 0,
      },
    });

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      const currentHeight = viewer.camera.positionCartographic?.height ?? maxZoomOutHeightRef.current;
      const nextHeight = getWheelZoomCameraHeight(currentHeight, event.deltaY, maxZoomOutHeightRef.current);
      applyCenteredZoom(nextHeight);
    };

    const getTouchDistance = (touches: TouchList) => {
      const firstTouch = touches.item(0);
      const secondTouch = touches.item(1);
      if (!firstTouch || !secondTouch) return null;

      return Math.hypot(
        secondTouch.clientX - firstTouch.clientX,
        secondTouch.clientY - firstTouch.clientY
      );
    };

    const handleTouchStart = (event: TouchEvent) => {
      if (event.touches.length !== 2) return;

      const touchDistance = getTouchDistance(event.touches);
      if (!touchDistance) return;

      pinchStartDistanceRef.current = touchDistance;
      pinchStartHeightRef.current = viewer.camera.positionCartographic?.height ?? maxZoomOutHeightRef.current;
      event.preventDefault();
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (event.touches.length !== 2 || pinchStartDistanceRef.current == null) return;

      const touchDistance = getTouchDistance(event.touches);
      if (!touchDistance) return;

      const scale = pinchStartDistanceRef.current / touchDistance;
      applyCenteredZoom(pinchStartHeightRef.current * scale);
      event.preventDefault();
    };

    const handleTouchEnd = () => {
      pinchStartDistanceRef.current = null;
    };

    viewer.scene.canvas.addEventListener("wheel", handleWheel, { passive: false });
    viewer.scene.canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
    viewer.scene.canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
    viewer.scene.canvas.addEventListener("touchend", handleTouchEnd);
    viewer.scene.canvas.addEventListener("touchcancel", handleTouchEnd);

    // Click handler
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    handler.setInputAction((click: any) => {
      const picked = viewer.scene.pick(click.position);
      if (Cesium.defined(picked) && picked.id && picked.id._customEventId) {
        const eventId: string = picked.id._customEventId;
        const found = allEventsRef.current.find((e) => e.id === eventId);
        if (!found) return;

        if (isUpcomingWorldCupMatch(found) && onSelectVenueRef.current) {
          const rect = viewer.scene.canvas.getBoundingClientRect();
          onSelectVenueRef.current(
            found,
            click.position.x + rect.left,
            click.position.y + rect.top
          );
          return;
        }

        onSelectRef.current(found);
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
      window.removeEventListener("resize", syncInteractionConstraints);
      viewer.scene.canvas.removeEventListener("wheel", handleWheel);
      viewer.scene.canvas.removeEventListener("touchstart", handleTouchStart);
      viewer.scene.canvas.removeEventListener("touchmove", handleTouchMove);
      viewer.scene.canvas.removeEventListener("touchend", handleTouchEnd);
      viewer.scene.canvas.removeEventListener("touchcancel", handleTouchEnd);
      viewer.camera.changed.removeEventListener(updateZoomIndicator);
      viewer.camera.changed.removeEventListener(lockCameraToTopDownView);
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

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || !window.Cesium) return;

    const Cesium = window.Cesium;
    viewer.scene.backgroundColor = Cesium.Color.fromCssColorString(mapThemeColors.sceneBackground);
  }, [themeKey, mapThemeColors.sceneBackground]);

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

      const isSelected = selectedEvent?.id === event.id || focusedEvent?.id === event.id;
      const isUpcomingVenueMarker = isUpcomingWorldCupMatch(event);
      const markerAppearance = getMarkerAppearance(isSelected, isUpcomingVenueMarker);
      const maxDisplayDistance = isUpcomingVenueMarker
        ? 30_000_000.0
        : event.importance === 1
          ? 30_000_000.0
          : event.importance === 2
            ? 9_000_000.0
            : 3_000_000.0;
      const labelText = isUpcomingVenueMarker
        ? getUpcomingMatchTooltipLabel(event)
        : event.title;

      const entity = viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(event.lng, event.lat),
        point: {
          pixelSize: markerAppearance.pixelSize,
          color: Cesium.Color.fromCssColorString(markerAppearance.color).withAlpha(markerAppearance.colorAlpha),
          outlineColor: Cesium.Color.fromCssColorString(markerAppearance.outlineColor),
          outlineWidth: markerAppearance.outlineWidth,
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, maxDisplayDistance),
        },
        label: {
          text: labelText,
          font: isUpcomingVenueMarker
            ? "600 13px 'Source Sans 3', 'Segoe UI Emoji', 'Apple Color Emoji', sans-serif"
            : "12px 'Source Sans 3', sans-serif",
          fillColor: Cesium.Color.fromCssColorString(markerAppearance.labelColor),
          outlineColor: Cesium.Color.fromCssColorString(mapThemeColors.labelOutlineColor),
          outlineWidth: 0,
          style: Cesium.LabelStyle.FILL,
          showBackground: isUpcomingVenueMarker,
          backgroundColor: Cesium.Color.fromCssColorString(mapThemeColors.tooltipBackgroundColor).withAlpha(
            isUpcomingVenueMarker ? 0.92 : 0
          ),
          horizontalOrigin: isUpcomingVenueMarker ? Cesium.HorizontalOrigin.LEFT : Cesium.HorizontalOrigin.CENTER,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          pixelOffset: isUpcomingVenueMarker ? new Cesium.Cartesian2(16, -8) : new Cesium.Cartesian2(0, -14),
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
          show: isUpcomingVenueMarker ? false : (isMobile || isSelected),
          scale: isSelected ? 1 : 0.9,
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, maxDisplayDistance),
        },
      });

      entity._customEventId = event.id;
      entitiesRef.current.set(event.id, entity);
    });
  }, [events, selectedEvent, isMobile, mapThemeColors.labelOutlineColor, mapThemeColors.tooltipBackgroundColor]);

  /* ── Highlight selected event and fly camera ── */
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || !window.Cesium) return;
    const Cesium = window.Cesium;

    entitiesRef.current.forEach((entity, id) => {
      const linkedEvent = events.find((event) => event.id === id) ?? allEvents.find((event) => event.id === id);
      const isSelected = selectedEvent?.id === id || focusedEvent?.id === id;
      const isUpcomingVenueMarker = isUpcomingWorldCupMatch(linkedEvent);
      const markerAppearance = getMarkerAppearance(isSelected, isUpcomingVenueMarker);

      if (entity.point) {
        entity.point.pixelSize = markerAppearance.pixelSize;
        entity.point.color = Cesium.Color.fromCssColorString(markerAppearance.color).withAlpha(markerAppearance.colorAlpha);
        entity.point.outlineColor = Cesium.Color.fromCssColorString(markerAppearance.outlineColor);
        entity.point.outlineWidth = markerAppearance.outlineWidth;
      }
      if (entity.label) {
        entity.label.show = isUpcomingVenueMarker ? false : (isMobile || isSelected);
        entity.label.fillColor = Cesium.Color.fromCssColorString(markerAppearance.labelColor);
        entity.label.outlineColor = Cesium.Color.fromCssColorString(mapThemeColors.labelOutlineColor);
        entity.label.outlineWidth = 0;
        entity.label.style = Cesium.LabelStyle.FILL;
        entity.label.showBackground = isUpcomingVenueMarker;
        entity.label.backgroundColor = Cesium.Color.fromCssColorString(mapThemeColors.tooltipBackgroundColor).withAlpha(
          isUpcomingVenueMarker ? 0.92 : 0
        );
        entity.label.horizontalOrigin = isUpcomingVenueMarker ? Cesium.HorizontalOrigin.LEFT : Cesium.HorizontalOrigin.CENTER;
        entity.label.pixelOffset = isUpcomingVenueMarker ? new Cesium.Cartesian2(16, -8) : new Cesium.Cartesian2(0, -14);
        entity.label.scale = isSelected ? 1 : 0.9;
      }
    });

    const cameraTargetEvent = selectedEvent ?? focusedEvent;
    const worldCupCountryBounds = activeSafari?.id.startsWith("world-cup-")
      ? getWorldCupCountryBounds(cameraTargetEvent?.tournamentId ?? activeSafari.id)
      : null;

    if (worldCupCountryBounds && (!cameraTargetEvent || cameraTargetEvent.eventType !== "match")) {
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

    if (cameraTargetEvent) {
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(
          cameraTargetEvent.lng,
          cameraTargetEvent.lat,
          getCameraHeightForZoomPercent(getEventZoomPercent(cameraTargetEvent))
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
  }, [selectedEvent, focusedEvent, isMobile, activeSafari, allEvents, events, themeKey, mapThemeColors.labelOutlineColor, mapThemeColors.tooltipBackgroundColor]);

  /* ── Render World Cup host outline ── */
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || !window.Cesium) return;
    const Cesium = window.Cesium;

    if (countryOutlineRef.current) {
      viewer.entities.remove(countryOutlineRef.current);
      countryOutlineRef.current = null;
    }

    if (!showSafariPath || !activeSafari?.id.startsWith("world-cup-")) return;

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
        material: Cesium.Color.fromCssColorString(mapThemeColors.countryOutlineColor).withAlpha(0.9),
      },
    });
  }, [activeSafari, showSafariPath, themeKey, mapThemeColors.countryOutlineColor]);

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

    if (!showSafariPath) return;

    const safariPathEvents = getSafariPathEvents(activeSafari, allEvents, events);

    if (safariPathEvents.length > 1) {
      const positions = safariPathEvents.map((event) =>
        Cesium.Cartesian3.fromDegrees(event.lng, event.lat)
      );

      polylineRef.current = viewer.entities.add({
        polyline: {
          positions,
          width: 1,
          material: new Cesium.PolylineDashMaterialProperty({
            color: Cesium.Color.fromCssColorString(mapThemeColors.safariPathColor),
            dashLength: 20,
            gapColor: Cesium.Color.TRANSPARENT,
          }),
          arcType: Cesium.ArcType.GEODESIC,
          clampToGround: true,
        }
      });
    }
  }, [activeSafari, allEvents, events, showSafariPath, themeKey, mapThemeColors.safariPathColor]);

  return (
    <div className="absolute inset-0">
      <div
        ref={containerRef}
        className="absolute inset-0"
        style={{ background: "hsl(var(--map-scene-background))" }}
      />

      {showZoomIndicator && (
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
                background: mapThemeColors.safariPathColor,
              }}
            />
          </div>

          <div className="mt-1.5 flex items-center justify-between gap-3">
            <span
              className="font-mono-space text-[11px]"
              style={{ color: mapThemeColors.safariPathColor }}
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
      )}
    </div>
  );
}
