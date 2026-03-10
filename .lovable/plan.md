
## 🌍 Geo-Temporal Explorer — "Taller Terreno" MVP

### Stack & Librerías
- **CesiumJS** via CDN (script tag en `index.html`) para el globo 3D interactivo
- **React + Vite + TypeScript** (ya instalados)
- **Fuente de datos:** JSON estático con ~80 eventos históricos geolocalizados (~3000 a.C. → 2024 d.C.)
- **Google Fonts:** Space Mono + Source Sans 3
- **Sin autenticación**, despliegue inmediato

---

### Datos — `src/data/historical-events.ts`
Un array tipado con ~80 eventos cuidadosamente seleccionados, cubriendo:
- Civilizaciones antiguas (Mesopotamia, Egipto, Grecia, Roma)
- Edad Media (Caída de Roma, Cruzadas, Peste Negra, Imperios islámicos)
- Era de los Descubrimientos (Colón, Magallanes, Copérnico)
- Revolución Industrial y Guerras Mundiales
- Era Moderna (1950–2024)

Cada evento: `{ id, title, description, year, lat, lng }`  
Años negativos = a.C. (ej: `-3000` = 3000 a.C.)

---

### Arquitectura de Componentes

```
App.tsx
├── CesiumGlobe.tsx          ← Globo 3D, marcadores, interacción
├── TimelineBar.tsx          ← Barra inferior, scrubber, "Pulso Temporal"
└── EventPanel.tsx           ← Panel lateral deslizante (33% derecha)
```

**`CesiumGlobe.tsx`**
- Monta CesiumJS en un `div` de pantalla completa
- Recibe `events[]` filtrados por el año actual del slider
- Renderiza marcadores como puntos ámbar (`#F2A900`) via `viewer.entities`
- Al hacer clic en marcador → selecciona el evento (estado global)
- Rotación suave al evento seleccionado (sin vuelo dramático, solo `camera.setView` suave)
- Sin clusters, sin iconos de categoría

**`TimelineBar.tsx`**
- Barra sólida anclada al `bottom: 0`, altura generosa (~80px)
- Input `range` personalizado con CSS: track en Pizarra Húmeda, thumb en Ámbar
- Rango: `-3000` a `2024`
- Muestra el año en Space Mono (formato: `3000 a.C.` / `500 d.C.`)
- **"Pulso Temporal":** Al mover el scrubber, los marcadores que aparecen/desaparecen emiten un flash de opacidad ámbar usando `opacity` animada en CSS/JS antes de quitarse
- Filtro de eventos: solo carga los del rango ±200 años alrededor del año actual (ventana deslizante de ~400 años)

**`EventPanel.tsx`**
- Panel `position: fixed, right: 0` que se desliza con `transform: translateX`
- Ocupa 33% del ancho, fondo `#2D3039` (Pizarra Húmeda)
- Muestra: `AÑO` (Space Mono grande), `TÍTULO` (Space Mono), `Descripción` (Source Sans 3)
- Botón X para cerrar en esquina superior derecha

---

### Diseño Visual (fiel al brief)
- **Fondo:** `#111319` (Negro Volcánico) — el vacío del espacio
- **Paneles/Barra:** `#2D3039` (Pizarra Húmeda)
- **Acento:** `#F2A900` (Ámbar) — solo para el punto activo y el scrubber
- **Texto:** `#E1E3E8` (Hueso)
- **Fuentes:** Space Mono (títulos/años/UI) + Source Sans 3 (descripciones)
- Sin header, sin footer, sin menú de búsqueda — solo globo + timeline

---

### Configuración de CesiumJS
- Token de Cesium Ion gratuito (incluido en código con un token de acceso anónimo / Bing Maps base layer)
- Deshabilitar: widgets de créditos, botón home, selector de escenas, animación nativa — interfaz 100% limpia
- Imagery: `OpenStreetMap` o `Natural Earth` (sin costo)

---

### Paleta de Implementación — `index.css`
Actualiza las variables CSS del tema para reflejar la paleta geológica de Taller Terreno. El tema oscuro es el predeterminado y único.

---

### Orden de Implementación
1. Configurar fuentes e `index.css` con paleta oscura geológica
2. Crear `src/data/historical-events.ts` con ~80 eventos
3. Integrar CesiumJS en `index.html` + `CesiumGlobe.tsx`
4. Construir `TimelineBar.tsx` con scrubber y filtro temporal
5. Construir `EventPanel.tsx` con animación de entrada
6. Conectar estado global (año actual + evento seleccionado) en `App.tsx`
7. Implementar el "Pulso Temporal" en los marcadores al cambiar el año
