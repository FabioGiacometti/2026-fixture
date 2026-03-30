const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/data/historical-events.ts');
let content = fs.readFileSync(filePath, 'utf8');

const massiveEnrichment = `
  // ── MORE ANCIENT & CLASSICAL EVENTS ──────────────────────────────────────
  {
    id: "olmec-colossal-heads",
    title: "Cabezas Colosales Olmecas",
    description: "La civilización Olmeca, 'cultura madre' de Mesoamérica, esculpe sus características cabezas colosales de basalto en San Lorenzo y La Venta.",
    year: -1200,
    lat: 17.97,
    lng: -94.03,
    region: "América",
    importance: 2
  },
  {
    id: "carthage-foundation",
    title: "Fundación de Cartago",
    description: "Los fenicios de Tiro fundan Cartago en la costa del norte de África, que se convertiría en el mayor imperio comercial del Mediterráneo occidental.",
    year: -814,
    lat: 36.85,
    lng: 10.33,
    region: "África",
    importance: 2
  },
  {
    id: "sparta-thermopylae",
    title: "Batalla de las Termópilas",
    description: "El rey espartano Leónidas y sus 300 guerreros resisten heroicamente ante el masivo ejército persa de Jerjes I durante tres días.",
    year: -480,
    lat: 38.79,
    lng: 22.53,
    region: "Europa",
    importance: 2
  },
  {
    id: "ashoka-empire",
    title: "Imperio Maurya bajo Ashoka",
    description: "Tras la sangrienta guerra de Kalinga, el emperador indio Ashoka se convierte al budismo y promueve la paz, la tolerancia y el bienestar en todo el subcontinente.",
    year: -260,
    lat: 25.61,
    lng: 85.14,
    region: "Asia",
    importance: 1
  },
  {
    id: "nazca-lines",
    title: "Creación de las Líneas de Nazca",
    description: "La cultura Nazca traza enormes geoglifos en el desierto del sur de Perú, con formas de animales y figuras geométricas visibles solo desde el aire.",
    year: 200,
    lat: -14.73,
    lng: -75.13,
    region: "América",
    importance: 2
  },
  {
    id: "maya-tikal",
    title: "Apogeo de Tikal (Civilización Maya)",
    description: "Bajo el gobierno de Jasaw Chan K'awiil I, la ciudad maya de Tikal domina la región del Petén con sus imponentes templos piramidales.",
    year: 700,
    lat: 17.22,
    lng: -89.62,
    region: "América",
    importance: 2
  },

  // ── MORE MIDDLE AGES ──────────────────────────────────────────────────────
  {
    id: "axum-empire",
    title: "El Reino de Aksum",
    description: "El Imperio de Aksum se convierte en una potencia comercial crucial entre el Imperio Romano y la India, adoptando el cristianismo de forma temprana.",
    year: 350,
    lat: 14.13,
    lng: 38.71,
    region: "África",
    importance: 3
  },
  {
    id: "islamic-golden-age",
    title: "Fundación de la Casa de la Sabiduría",
    description: "El califa abasí Al-Mamún funda en Bagdad la Casa de la Sabiduría (Bayt al-Hikmah), centro intelectual que tradujo y preservó el conocimiento clásico mundial.",
    year: 830,
    lat: 33.31,
    lng: 44.36,
    region: "Asia",
    importance: 1
  },
  {
    id: "srivijaya-empire",
    title: "Imperio Srivijaya",
    description: "El poderoso imperio marítimo de Srivijaya controla el Estrecho de Malaca, dominando el comercio entre India, China y el Sudeste Asiático.",
    year: 850,
    lat: -2.99,
    lng: 104.75,
    region: "Asia",
    importance: 2
  },
  {
    id: "angkor-wat",
    title: "Construcción de Angkor Wat",
    description: "El rey jemer Suryavarman II ordena la construcción de Angkor Wat en Camboya, el monumento religioso más grande jamás construido en el mundo.",
    year: 1150,
    lat: 13.41,
    lng: 103.86,
    region: "Asia",
    importance: 1
  },
  {
    id: "great-zimbabwe",
    title: "Gran Zimbabue",
    description: "Florece la ciudad de piedra del Gran Zimbabue, capital de un próspero reino comercial en el sur de África vinculado a la red del Océano Índico.",
    year: 1300,
    lat: -20.26,
    lng: 30.93,
    region: "África",
    importance: 2
  },
  {
    id: "mansa-musa",
    title: "Peregrinaje de Mansa Musa",
    description: "Mansa Musa, emperador del Imperio de Malí y posiblemente el hombre más rico de la historia, realiza su legendario viaje a La Meca repartiendo oro.",
    year: 1324,
    lat: 16.77,
    lng: -3.00,
    region: "África",
    importance: 2
  },
  {
    id: "polynesian-expansion",
    title: "Asentamiento de Nueva Zelanda",
    description: "Navegantes polinesios cruzan vastas extensiones del Océano Pacífico para establecerse en Aotearoa (Nueva Zelanda), desarrollando la cultura Maorí.",
    year: 1300,
    lat: -38.13,
    lng: 176.24,
    region: "Oceanía",
    importance: 2
  },

  // ── EARLY MODERN TO 19TH CENTURY REFINEMENTS ──────────────────────────────
  {
    id: "taj-mahal",
    title: "Construcción del Taj Mahal",
    description: "El emperador mogol Shah Jahan erige el Taj Mahal en Agra como mausoleo para su esposa favorita, obra cumbre de la arquitectura indoislámica.",
    year: 1648,
    lat: 27.17,
    lng: 78.04,
    region: "Asia",
    importance: 1
  },
  {
    id: "battle-sekigahara",
    title: "Batalla de Sekigahara",
    description: "Tokugawa Ieyasu logra una victoria decisiva que unifica Japón bajo el shogunato Tokugawa, iniciando un largo período de paz y aislamiento.",
    year: 1600,
    lat: 35.37,
    lng: 136.46,
    region: "Asia",
    importance: 2
  },
  {
    id: "cook-australia",
    title: "Expedición de James Cook",
    description: "El capitán James Cook llega a la costa este de Australia (Bahía Botánica), reclamando el territorio para Gran Bretaña y allanando el camino a la colonización.",
    year: 1770,
    lat: -34.00,
    lng: 151.22,
    region: "Oceanía",
    importance: 2
  },
  {
    id: "waterloo",
    title: "Batalla de Waterloo",
    description: "Las fuerzas de coalición comandadas por el Duque de Wellington derrotan definitivamente a Napoleón Bonaparte, poniendo fin a sus Guerras Napoleónicas.",
    year: 1815,
    lat: 50.67,
    lng: 4.40,
    region: "Europa",
    importance: 2
  },
  {
    id: "treaty-waitangi",
    title: "Tratado de Waitangi",
    description: "Jefes maoríes y representantes de la Corona británica firman el documento fundacional de Nueva Zelanda, trayendo profundas consecuencias sobre tierras y soberanía.",
    year: 1840,
    lat: -35.26,
    lng: 174.08,
    region: "Oceanía",
    importance: 3
  },
  {
    id: "gettysburg",
    title: "Batalla de Gettysburg",
    description: "El punto de inflexión de la Guerra Civil Estadounidense, donde el ejército de la Unión detiene la invasión del general confederado Robert E. Lee.",
    year: 1863,
    lat: 39.82,
    lng: -77.23,
    region: "América",
    importance: 3
  },

  // ── MORE LATIN AMERICAN & SPANISH EVENTS ──────────────────────────────────
  {
    id: "bogota-foundation",
    title: "Fundación de Bogotá",
    description: "Gonzalo Jiménez de Quesada funda Santa Fe de Bogotá en el territorio del pueblo Muisca tras la expedición a la cordillera de los Andes.",
    year: 1538,
    lat: 4.59,
    lng: -74.07,
    region: "América",
    importance: 3
  },
  {
    id: "lima-foundation",
    title: "Fundación de Lima",
    description: "Francisco Pizarro funda la Ciudad de los Reyes (Lima), que rápidamente se convierte en el centro del poder español y capital del Virreinato del Perú.",
    year: 1535,
    lat: -12.04,
    lng: -77.02,
    region: "América",
    importance: 3
  },
  {
    id: "santiago-foundation",
    title: "Fundación de Santiago de Chile",
    description: "Pedro de Valdivia funda la ciudad de Santiago del Nuevo Extremo a los pies del cerro Santa Lucía (Huelén).",
    year: 1541,
    lat: -33.43,
    lng: -70.64,
    region: "América",
    importance: 3
  },
  {
    id: "grito-de-dolores",
    title: "Grito de Dolores",
    description: "El cura Miguel Hidalgo lanza su famoso llamado a las armas en el pueblo de Dolores, marcando el inicio de la Guerra de Independencia de México.",
    year: 1810,
    lat: 21.15,
    lng: -100.93,
    region: "América",
    importance: 2
  },
  {
    id: "battle-ayacucho",
    title: "Batalla de Ayacucho",
    description: "Un ejército independentista al mando de Antonio José de Sucre derrota a las fuerzas realistas del Virreinato, sellando la independencia del Perú y Sudamérica.",
    year: 1824,
    lat: -13.13,
    lng: -74.19,
    region: "América",
    importance: 2
  },
  {
    id: "guerra-pacifico",
    title: "Guerra del Pacífico",
    description: "Conflicto bélico en el que Chile se enfreta a Perú y Bolivia por el control del desierto de Atacama y sus valiosos yacimientos de salitre.",
    year: 1879,
    lat: -23.65,
    lng: -70.39,
    region: "América",
    importance: 2
  },
  {
    id: "mexican-revolution",
    title: "Revolución Mexicana",
    description: "Francisco I. Madero promulga el Plan de San Luis para derrocar al dictador Porfirio Díaz, detonando uno de los mayores conflictos armados y sociales de América.",
    year: 1910,
    lat: 19.43,
    lng: -99.13,
    region: "América",
    importance: 2
  },

  // ── MORE 20TH & 21ST CENTURY ─────────────────────────────────────────────
  {
    id: "panama-canal",
    title: "Apertura del Canal de Panamá",
    description: "Se completa una de las obras de ingeniería más grandes del mundo, transformando drásticamente las rutas comerciales marítimas globales al unir el Atlántico y el Pacífico.",
    year: 1914,
    lat: 9.10,
    lng: -79.68,
    region: "América",
    importance: 1
  },
  {
    id: "battle-stalingrad",
    title: "Batalla de Stalingrado",
    description: "El Ejército Rojo soviético frena y derrota a la Wehrmacht alemana tras el sitio urbano más mortífero de la historia, revirtiendo el rumbo de la 2ª Guerra Mundial.",
    year: 1943,
    lat: 48.70,
    lng: 44.51,
    region: "Europa",
    importance: 2
  },
  {
    id: "cuban-revolution",
    title: "Triunfo de la Revolución Cubana",
    description: "Las fuerzas rebeldes lideradas por Fidel Castro derrocan al dictador Fulgencio Batista, instaurando el primer estado socialista del hemisferio occidental.",
    year: 1959,
    lat: 23.11,
    lng: -82.36,
    region: "América",
    importance: 2
  },
  {
    id: "sputnik-soyuz",
    title: "Vostok 1: Yuri Gagarin al espacio",
    description: "El cosmonauta soviético Yuri Gagarin se convierte en el primer ser humano en viajar al espacio exterior y orbitar la Tierra.",
    year: 1961,
    lat: 45.96,
    lng: 63.30,
    region: "Asia",
    importance: 1
  },
  {
    id: "falklands-war",
    title: "Guerra de las Malvinas",
    description: "Conflicto armado de diez semanas entre Argentina y el Reino Unido por la soberanía de los archipiélagos del Atlántico Sur.",
    year: 1982,
    lat: -51.69,
    lng: -57.85,
    region: "América",
    importance: 3
  },
  {
    id: "chernobyl",
    title: "Desastre Nuclear de Chernóbil",
    description: "Explosión del reactor nuclear número 4 de la central de Chernóbil en Ucrania soviética, siendo el peor accidente nuclear civil de la historia.",
    year: 1986,
    lat: 51.38,
    lng: 30.09,
    region: "Europa",
    importance: 1
  },
  {
    id: "rwanda-genocide",
    title: "Genocidio de Ruanda",
    description: "Masacre planificada de aproximadamente 800.000 miembros de la minoría tutsi por extremistas hutus en tan solo 100 días.",
    year: 1994,
    lat: -1.94,
    lng: 30.06,
    region: "África",
    importance: 2
  },
  {
    id: "fukushima",
    title: "Terremoto y Tsunami de Tōhoku",
    description: "Un terremoto de magnitud 9.0 desata un tsunami enorme en la costa este de Japón, desencadenando la fusión de tres reactores en la planta nuclear de Fukushima.",
    year: 2011,
    lat: 38.29,
    lng: 141.02,
    region: "Asia",
    importance: 2
  }
`;

content = content.replace(/\s*\];\s*$/, ',\n' + massiveEnrichment.trim() + '\n];\n');
fs.writeFileSync(filePath, content, 'utf8');
console.log('Massive enrichment completed.');
