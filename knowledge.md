# History Map - Knowledge Base

Este documento sirve como guía para entender la arquitectura, componentes principales y dónde viven las distintas funcionalidades del proyecto `history-map`. Úsalo como referencia rápida para futuros desarrollos.

## Arquitectura General
El proyecto es una aplicación web React (construida con Vite), usando TypeScript y centrada en la visualización geoespacial de eventos históricos a través de CesiumJS.

*   **Página Principal (`src/pages/Index.tsx`)**: Es el "cerebro" (Orquestador). Mantiene el estado principal de la aplicación:
    *   `currentYear`: El año actualmente seleccionado en la línea de tiempo.
    *   `selectedEvent`: El evento histórico que el usuario ha clickeado para ver el detalle.
    *   `mapStyle`: El estilo actual del mapa base ("political" o "geographic").
    *   `visibleEvents`: Los eventos filtrados según la ventana de tiempo cercana al `currentYear`.

*   **Librería UI**: Se utiliza [shadcn/ui](https://ui.shadcn.com/) y Tailwind CSS para todos los componentes de la interfaz (`src/components/ui/*`).

## Componentes Principales

### 1. El Globo 3D (`src/components/CesiumGlobe.tsx`)
*   **Responsabilidad**: Cargar, configurar y renderizar la vista de la Tierra usando CesiumJS.
*   **Manejo de Capas**: Soporta alternar entre un mapa político (vía `OpenStreetMap`) y uno satelital/geográfico (vía `Esri World Imagery`). Realiza esto manipulando dinámicamente `viewer.scene.imageryLayers`.
*   **Marcadores**: Recibe la lista de `events` y los dibuja como entidades de Cesium (`viewer.entities.add`). Los colores (amarillo) y su tamaño reaccionan según cuál es el `selectedEvent`.
*   **Interacción Mouse**: Controla la cámara. Al clickear sobre un marcador (evento), se emite el evento al `Index.tsx` y la cámara hace un vuelo suavizado (`flyTo`) a la coordenada correspondiente.

### 2. La Línea de Tiempo (`src/components/TimelineBar.tsx`)
*   **Responsabilidad**: Permitir al usuario navegar por la historia (actualmente mapeada desde 3000 a.C. a 2024 d.C.).
*   **UI**: Es un *slider* arrastrable (input `type="range"`) estilizado en la parte inferior.
*   **Datos mostrados**: Según la posición, muestra dinámicamente el año formatado, la Era histórica (Ej. "Edad Media", "Época Clásica"), y cuántos eventos hay "cerca" (±300 años de la posición actual de la barra).

### 3. Panel de Eventos (`src/components/EventsListPanel.tsx`)
*   **Responsabilidad**: Es el panel lateral derecho que coordina el descubrimiento de eventos sin usar estrictamente el mapa 3D.
*   **Estados del Panel**: Puede estar "colapsado" (solo la pestaña visible), en "lista" (muestra los eventos en la ventana de tiempo actual agrupados por color de región) o en "detalle" (se expande cuando un evento ha sido seleccionado en la lista o en el globo).
*   **Diseño**: Se ancla a la derecha y empuja animaciones CSS / Tailwind para expandirse fluídamente.

## Gestión de Datos
*   **`src/data/historical-events.ts`**: Un catálogo crudo de eventos. En el futuro, esto podría venir de una API real, pero actualmente está estático. Provee:
    *   Tipificado de `HistoricalEvent` (año, título, descripción, lat, lng, región, id).
    *   Lógica para encontrar todos los eventos dados unos parámetros `getEventsInRange(year, windowSeconds)`.
    *   Asignación de colores estándar por "región" (Europa, Asia, África, etc.).

## Tareas Comunes a Futuro

1.  **Añadir un nuevo estilo de Mapa Base**:
    *   Editar `CesiumGlobe.tsx`: Agrega un nuevo string en el chequeo condicional de capas en `initialProvider` y en el `useEffect` de Dynamic Layer Switching. Define un nuevo `Cesium.UrlTemplateImageryProvider`.
    *   Editar `Index.tsx`: Añadir esta opción al tipado de `mapStyle` y modificar la lógica de UI del botón/radio.

2.  **Modificar el Vuelo de la Cámara (Camera FlyTo)**:
    *   Ir a `CesiumGlobe.tsx` y buscar `viewer.camera.flyTo`. Se puede ajustar la `duration`, la curba de `easingFunction`, y la altura (el z en `destination: Cesium.Cartesian3.fromDegrees(...)`).

3.  **Estilos Generales UI**:
    *   Revisar variables en `src/index.css` (para personalizar variables CSS de shadcn, tema oscuro por defecto como `hsl(var(--primary))`).
    *   Tailwind config `tailwind.config.ts`.
