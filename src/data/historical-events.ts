export type MediaType = 'image' | 'video' | 'link';

export interface MediaItem {
  id: string;
  type: MediaType;
  url: string;
  title: string;
  description?: string;
  thumbnail?: string;
  sourceName?: string;
}

export interface HistoricalEvent {
  id: string;
  title: string;
  description: string;
  year: number; // negative = BC
  lat: number;
  lng: number;
  region: string;
  importance: number; // 1: Global/Major, 2: Continental, 3: Regional/Local
  relatedEvents?: string[]; // IDs of related events
  media?: MediaItem[];
  dataset?: "historical" | "worldcup";
  eventType?: "milestone" | "match";
  tournamentId?: string;
  stage?: "group" | "round16" | "quarterfinal" | "semifinal" | "third-place" | "final";
  homeTeam?: string;
  awayTeam?: string;
  homeFlag?: string;
  awayFlag?: string;
  score?: {
    home: number;
    away: number;
    penalties?: { home: number; away: number };
    note?: string;
  };
  formationHome?: string;
  formationAway?: string;
  winnerTeam?: string;
  scorers?: Array<{
    team: string;
    player: string;
    minute: number;
    penalty?: boolean;
    ownGoal?: boolean;
  }>;
  matchTimeline?: Array<{
    minute: number;
    type: "kickoff" | "halftime" | "goal" | "fulltime" | "penalty-shootout";
    description: string;
    team?: string;
  }>;
}

export interface Safari {
  id: string;
  name: string;
  description: string;
  overview: string;
  eventIds: string[];
  color?: string;
  thumbnail?: string;
  thumbnailLabel?: string;
}

export const historicalEvents: HistoricalEvent[] = [
  // ── ANCIENT WORLD (3000 BC – 500 BC) ──────────────────────────────────────
  {
    id: "egypt-unification",
    title: "Unificación del Antiguo Egipto",
    description: "El rey Narmer une el Alto y Bajo Egipto, fundando la primera dinastía y uno de los estados más duraderos de la historia.",
    year: -3100,
    lat: 26.82,
    lng: 30.8,
    region: "África",
    importance: 1
  },
  {
    id: "sumerian-writing",
    title: "Invención de la escritura cuneiforme",
    description: "Los sumerios de Mesopotamia desarrollan el primer sistema de escritura conocido, usando tablillas de arcilla con marcas en forma de cuña.",
    year: -3000,
    lat: 31.99,
    lng: 45.85,
    region: "Asia",
    importance: 1
  },
  {
    id: "stonehenge",
    title: "Construcción de Stonehenge",
    description: "Las poblaciones neolíticas de la isla de Gran Bretaña erigen Stonehenge, un monumento megalítico cuyo propósito astronómico aún se debate.",
    year: -2800,
    lat: 51.18,
    lng: -1.83,
    region: "Europa",
    importance: 1
  },
  {
    id: "pyramids-giza",
    title: "Construcción de las Pirámides de Giza",
    description: "El faraón Keops ordena la construcción de la Gran Pirámide de Giza, la más grande de las tres y la única de las Siete Maravillas del Mundo Antiguo que aún existe.",
    year: -2560,
    lat: 29.98,
    lng: 31.13,
    region: "África",
    importance: 1
  },
  {
    id: "indus-valley",
    title: "Apogeo de la Civilización del Indo",
    description: "Las ciudades de Mohenjo-Daro y Harappa alcanzan su máximo esplendor, con sistemas de alcantarillado, urbanismo planificado y comercio a larga distancia.",
    year: -2500,
    lat: 27.33,
    lng: 68.14,
    region: "Asia",
    importance: 1
  },
  {
    id: "akkadian-empire",
    title: "Imperio Acadio de Sargón",
    description: "Sargón de Acad funda el primer imperio multiétnico de la historia, unificando Mesopotamia bajo un solo gobierno centralizado.",
    year: -2334,
    lat: 33.35,
    lng: 44.41,
    region: "Asia",
    importance: 1
  },
  {
    id: "hammurabi-code",
    title: "Código de Hammurabi",
    description: "El rey babilonio Hammurabi promulga uno de los conjuntos de leyes escritas más antiguos del mundo, tallado en una estela de basalto negro.",
    year: -1754,
    lat: 32.54,
    lng: 44.42,
    region: "Asia",
    importance: 1
  },
  {
    id: "shang-dynasty",
    title: "Dinastía Shang en China",
    description: "La dinastía Shang consolida su poder en el valle del río Amarillo, desarrollando la escritura china primitiva y la fundición avanzada del bronce.",
    year: -1600,
    lat: 34.75,
    lng: 113.65,
    region: "Asia",
    importance: 1
  },
  {
    id: "battle-kadesh",
    title: "Batalla de Qadesh",
    description: "Ramsés II de Egipto y el rey hitita Muwatalli II se enfrentan en la mayor batalla de carros de la Antigüedad, concluida con el primer tratado de paz documentado.",
    year: -1274,
    lat: 34.57,
    lng: 36.52,
    region: "Asia",
    importance: 1
  },
  {
    id: "trojan-war",
    title: "Guerra de Troya",
    description: "Según la tradición griega, una coalición de reinos micénicos sitia Troya durante diez años, conflicto inmortalizado en la Ilíada de Homero.",
    year: -1200,
    lat: 39.96,
    lng: 26.24,
    region: "Europa",
    importance: 1
  },
  {
    id: "phoenician-alphabet",
    title: "Invención del Alfabeto Fenicio",
    description: "Los fenicios de la costa del Levante desarrollan el primer alfabeto consonántico, antecesor directo de los alfabetos griego, latino y árabe.",
    year: -1050,
    lat: 33.89,
    lng: 35.5,
    region: "Asia",
    importance: 1
  },
  {
    id: "founding-rome",
    title: "Fundación Tradicional de Roma",
    description: "Según la leyenda, Rómulo funda la ciudad de Roma en las siete colinas junto al Tíber, iniciando una historia que dominaría el mundo occidental por siglos.",
    year: -753,
    lat: 41.89,
    lng: 12.5,
    region: "Europa",
    importance: 1
  },
  {
    id: "assyrian-empire",
    title: "Apogeo del Imperio Asirio",
    description: "Asiria bajo Sargón II y sus sucesores conquista desde Egipto hasta Persia, creando el mayor imperio del mundo hasta entonces con una formidable maquinaria militar.",
    year: -720,
    lat: 36.36,
    lng: 43.15,
    region: "Asia",
    importance: 1
  },
  {
    id: "cyrus-persia",
    title: "Fundación del Imperio Aqueménida",
    description: "Ciro el Grande conquista Babilonia y funda el Imperio Persa Aqueménida, el mayor estado del mundo antiguo, proclamando el primer decreto de derechos humanos conocido.",
    year: -550,
    lat: 30.19,
    lng: 53.08,
    region: "Asia",
    importance: 1
  },
  {
    id: "athenian-democracy",
    title: "Democracia en Atenas",
    description: "Clístenes establece la democracia directa en Atenas, dando a los ciudadanos el poder de gobernar directamente, un experimento político que inspiraría al mundo moderno.",
    year: -508,
    lat: 37.97,
    lng: 23.73,
    region: "Europa",
    importance: 1
  },

  // ── CLASSICAL PERIOD (500 BC – 500 AD) ───────────────────────────────────
  {
    id: "marathon",
    title: "Batalla de Maratón",
    description: "Diez mil soldados atenienses derrotan al ejército persa de Darío I, salvando a Atenas de la conquista y consolidando la democracia griega.",
    year: -490,
    lat: 38.15,
    lng: 24.02,
    region: "Europa",
    importance: 1
  },
  {
    id: "confucius-analects",
    title: "Enseñanzas de Confucio",
    description: "El filósofo chino Confucio elabora su sistema ético basado en la virtud, la piedad filial y el orden social, que moldearía la cultura del este asiático por milenios.",
    year: -479,
    lat: 35.6,
    lng: 117.0,
    region: "Asia",
    importance: 1
  },
  {
    id: "alexander-conquests",
    title: "Conquistas de Alejandro Magno",
    description: "Alejandro III de Macedonia conquista un vasto territorio desde Grecia hasta la India en solo trece años, difundiendo la cultura helenística por tres continentes.",
    year: -334,
    lat: 37.96,
    lng: 58.3,
    region: "Asia",
    importance: 1
  },
  {
    id: "qin-unification",
    title: "Unificación de China por Qin Shi Huang",
    description: "El rey de Qin derrota a los reinos rivales y se convierte en el primer Emperador de China, iniciando la era imperial y comenzando la Gran Muralla.",
    year: -221,
    lat: 34.38,
    lng: 108.93,
    region: "Asia",
    importance: 1
  },
  {
    id: "punic-wars",
    title: "Guerras Púnicas — Batalla de Zama",
    description: "Escipión el Africano derrota a Aníbal Barca en Zama, poniendo fin a la Segunda Guerra Púnica y estableciendo a Roma como la potencia dominante del Mediterráneo.",
    year: -202,
    lat: 36.26,
    lng: 9.4,
    region: "África",
    importance: 1
  },
  {
    id: "silk-road",
    title: "Apertura de la Ruta de la Seda",
    description: "El emisario chino Zhang Qian establece las primeras rutas comerciales formales hacia Asia Central, conectando China con Persia, Roma y la India.",
    year: -130,
    lat: 39.9,
    lng: 75.0,
    region: "Asia",
    importance: 1
  },
  {
    id: "julius-caesar",
    title: "Asesinato de Julio César",
    description: "Julio César es asesinado en el Senado romano por una conspiración de senadores, desencadenando una serie de guerras civiles que transformarían la República en Imperio.",
    year: -44,
    lat: 41.9,
    lng: 12.47,
    region: "Europa",
    importance: 1
  },
  {
    id: "birth-christianity",
    title: "Crucifixión de Jesús de Nazaret",
    description: "La crucifixión de Jesús en Jerusalén marca el inicio del movimiento cristiano, que se extendería por el Imperio Romano y eventualmente por el mundo entero.",
    year: 33,
    lat: 31.78,
    lng: 35.21,
    region: "Asia",
    importance: 1,
    relatedEvents: ["paul-conversion", "edict-milan", "christianity-official-religion"],
    media: [
      {
        id: "christ-wikipedia",
        type: "link",
        url: "https://es.wikipedia.org/wiki/Crucifixi%C3%B3n_de_Jes%C3%BAs",
        title: "Wikipedia: Crucifixión de Jesús",
        description: "Artículo detallado sobre los aspectos históricos y teológicos de la crucifixión.",
        sourceName: "Wikipedia"
      },
      {
        id: "christ-image-1",
        type: "image",
        url: "https://upload.wikimedia.org/wikipedia/commons/d/d7/Cristo_crucificado.jpg",
        title: "Cristo crucificado (Velázquez)",
        description: "Obra maestra de Diego Velázquez conservada en el Museo del Prado.",
        sourceName: "Wikimedia Commons"
      },
      {
        id: "christ-video-1",
        type: "video",
        url: "https://www.youtube.com/watch?v=wp2p9sIOyVM",
        title: "Documental: La Crucifixión",
        description: "Un análisis histórico sobre los métodos de ejecución romanos.",
        sourceName: "YouTube"
      }
    ]
  },
  {
    id: "paul-conversion",
    title: "Conversión de Pablo de Tarso",
    description: "Saulo de Tarso experimenta una visión en el camino a Damasco que lo transforma de perseguidor de cristianos en el apóstol más influyente del cristianismo primitivo.",
    year: 35,
    lat: 33.51,
    lng: 36.29,
    region: "Asia",
    importance: 2
  },
  {
    id: "edict-milan",
    title: "Edicto de Milán",
    description: "Los emperadores Constantino y Licinio proclaman la libertad religiosa en el Imperio Romano, poniendo fin a las persecuciones de cristianos y marcando un giro histórico para la Iglesia.",
    year: 313,
    lat: 45.46,
    lng: 9.19,
    region: "Europa",
    importance: 1
  },
  {
    id: "christianity-official-religion",
    title: "El Cristianismo como Religión Oficial",
    description: "El emperador Teodosio I promulga el Edicto de Tesalónica, convirtiendo el cristianismo niceno en la única religión oficial del Imperio Romano.",
    year: 380,
    lat: 40.64,
    lng: 22.94,
    region: "Europa",
    importance: 1
  },
  {
    id: "vesuvius",
    title: "Erupción del Vesubio y destrucción de Pompeya",
    description: "La erupción catastrófica del Monte Vesubio entierra bajo cenizas las ciudades romanas de Pompeya y Herculano, preservando instantáneamente la vida cotidiana del siglo I.",
    year: 79,
    lat: 40.82,
    lng: 14.43,
    region: "Europa",
    importance: 1
  },
  {
    id: "rome-divided",
    title: "División del Imperio Romano",
    description: "El emperador Teodosio I divide permanentemente el Imperio Romano en dos mitades: el Imperio Romano de Occidente y el Imperio Romano de Oriente (Bizancio).",
    year: 395,
    lat: 41.01,
    lng: 28.97,
    region: "Europa",
    importance: 1
  },
  {
    id: "fall-western-rome",
    title: "Caída del Imperio Romano de Occidente",
    description: "El jefe bárbaro Odoacro depone al último emperador romano occidental Rómulo Augústulo, marcando el fin del Imperio Romano y el inicio de la Edad Media en Europa.",
    year: 476,
    lat: 45.45,
    lng: 12.33,
    region: "Europa",
    importance: 1
  },

  // ── MIDDLE AGES (500 – 1400) ──────────────────────────────────────────────
  {
    id: "muhammad-hijra",
    title: "La Hégira — Inicio del Islam",
    description: "El profeta Mahoma emigra de La Meca a Medina, evento que marca el inicio del calendario islámico y el comienzo de la expansión rápida de la religión islámica.",
    year: 622,
    lat: 24.47,
    lng: 39.61,
    region: "Asia",
    importance: 1
  },
  {
    id: "battle-tours",
    title: "Batalla de Tours / Poitiers",
    description: "Carlos Martel detiene el avance de los ejércitos islámicos hacia el norte de Europa, preservando la cultura cristiana carolingia en Occidente.",
    year: 732,
    lat: 46.71,
    lng: 0.34,
    region: "Europa",
    importance: 1
  },
  {
    id: "charlemagne",
    title: "Coronación de Carlomagno",
    description: "El papa León III corona a Carlomagno como Emperador Romano en Navidad, reunificando gran parte de Europa occidental y sentando las bases de las naciones europeas modernas.",
    year: 800,
    lat: 41.9,
    lng: 12.47,
    region: "Europa",
    importance: 1
  },
  {
    id: "viking-discovery",
    title: "Los Vikingos llegan a América del Norte",
    description: "Leif Erikson y sus nórdicos establecen el asentamiento de Vinland en Terranova, convirtiéndose en los primeros europeos en pisar el continente americano.",
    year: 1000,
    lat: 51.6,
    lng: -55.6,
    region: "América",
    importance: 1
  },
  {
    id: "battle-hastings",
    title: "Batalla de Hastings",
    description: "Guillermo el Conquistador derrota al rey sajón Haroldo II, conquistando Inglaterra y transformando radicalmente la lengua, cultura y arquitectura inglesas.",
    year: 1066,
    lat: 50.91,
    lng: 0.49,
    region: "Europa",
    importance: 1
  },
  {
    id: "magna-carta",
    title: "Firma de la Magna Carta",
    description: "El rey Juan Sin Tierra de Inglaterra firma la Carta Magna, el primer documento que limita el poder del monarca y garantiza ciertos derechos a los nobles, antecedente del constitucionalismo.",
    year: 1215,
    lat: 51.44,
    lng: -0.56,
    region: "Europa",
    importance: 1
  },
  {
    id: "genghis-khan",
    title: "Imperio Mongol de Gengis Kan",
    description: "Gengis Kan unifica las tribus mongolas y lanza una expansión militar sin precedentes, creando el mayor imperio contiguo de la historia humana.",
    year: 1206,
    lat: 47.9,
    lng: 106.9,
    region: "Asia",
    importance: 1
  },
  {
    id: "black-death",
    title: "La Peste Negra en Europa",
    description: "La pandemia de peste bubónica mata entre un tercio y la mitad de la población europea, transformando radicalmente la sociedad, la economía y la mentalidad medieval.",
    year: 1347,
    lat: 43.3,
    lng: 5.37,
    region: "Europa",
    importance: 1
  },
  {
    id: "aztec-tenochtitlan",
    title: "Fundación de Tenochtitlán",
    description: "Los mexicas fundan Tenochtitlán en una isla del lago Texcoco, ciudad que crecería hasta ser una de las más grandes del mundo y capital del poderoso Imperio Azteca.",
    year: 1325,
    lat: 19.43,
    lng: -99.13,
    region: "América",
    importance: 1
  },
  {
    id: "hundred-years-war",
    title: "Juana de Arco en la Guerra de los Cien Años",
    description: "La joven campesina Juana de Arco lidera al ejército francés al levantamiento del sitio de Orleans, cambiando el curso de la guerra y convirtiéndose en símbolo nacional.",
    year: 1429,
    lat: 47.9,
    lng: 1.9,
    region: "Europa",
    importance: 1
  },
  {
    id: "gutenberg-press",
    title: "Imprenta de Gutenberg",
    description: "Johannes Gutenberg inventa la imprenta de tipos móviles en Maguncia, revolucionando la difusión del conocimiento y haciendo posible la Reforma Protestante y el Renacimiento.",
    year: 1450,
    lat: 49.99,
    lng: 8.27,
    region: "Europa",
    importance: 1
  },

  // ── EARLY MODERN (1400 – 1700) ────────────────────────────────────────────
  {
    id: "fall-constantinople",
    title: "Caída de Constantinopla",
    description: "El sultán otomano Mehmed II conquista Constantinopla poniendo fin al Imperio Bizantino de mil años, abriendo el camino otomano hacia Europa y cerrando las rutas comerciales terrestres con Asia.",
    year: 1453,
    lat: 41.01,
    lng: 28.97,
    region: "Europa",
    importance: 1
  },
  {
    id: "columbus",
    title: "Colón llega a América",
    description: "Cristóbal Colón, financiado por la Corona española, llega a las islas del Caribe el 12 de octubre, iniciando el contacto permanente entre Europa y el continente americano.",
    year: 1492,
    lat: 23.7,
    lng: -75.4,
    region: "América",
    importance: 1
  },
  {
    id: "vasco-da-gama",
    title: "Vasco da Gama llega a la India",
    description: "El navegante portugués Vasco da Gama completa la primera ruta marítima directa de Europa a la India rodeando el Cabo de Buena Esperanza, transformando el comercio mundial.",
    year: 1498,
    lat: 11.26,
    lng: 75.78,
    region: "Asia",
    importance: 1
  },
  {
    id: "reformation-luther",
    title: "Reforma Protestante de Lutero",
    description: "Martín Lutero publica sus 95 Tesis en Wittenberg, cuestionando las prácticas de la Iglesia Católica y desencadenando la Reforma Protestante que dividiría al cristianismo occidental.",
    year: 1517,
    lat: 51.86,
    lng: 12.64,
    region: "Europa",
    importance: 1
  },
  {
    id: "magellan-circumnavigation",
    title: "Primera Circunnavegación del Globo",
    description: "La expedición de Fernando de Magallanes y Juan Sebastián Elcano completa la primera vuelta al mundo, demostrando definitivamente que la Tierra es redonda.",
    year: 1522,
    lat: -10.0,
    lng: -80.0,
    region: "América",
    importance: 1
  },
  {
    id: "spanish-conquest-aztec",
    title: "Conquista Española del Imperio Azteca",
    description: "Hernán Cortés y sus aliados tlaxcaltecas conquistan Tenochtitlán, poniendo fin al Imperio Azteca e iniciando el dominio colonial español en Mesoamérica.",
    year: 1521,
    lat: 19.43,
    lng: -99.13,
    region: "América",
    importance: 1
  },
  {
    id: "copernicus",
    title: "Revolución Copernicana",
    description: "Nicolás Copérnico publica 'De revolutionibus', proponiendo que la Tierra y los planetas giran alrededor del Sol, iniciando la revolución científica que transformaría la visión del cosmos.",
    year: 1543,
    lat: 53.77,
    lng: 20.48,
    region: "Europa",
    importance: 1
  },
  {
    id: "ottoman-suleiman",
    title: "Apogeo del Imperio Otomano bajo Solimán",
    description: "Solimán el Magnífico lleva al Imperio Otomano a su máximo esplendor, controlando territorios desde Hungría hasta Persia y desde el Cáucaso hasta el norte de África.",
    year: 1550,
    lat: 41.01,
    lng: 28.97,
    region: "Europa",
    importance: 1
  },
  {
    id: "armada-invencible",
    title: "Derrota de la Armada Invencible",
    description: "La flota española de Felipe II es derrotada por los ingleses y destruida por tormentas, marcando el inicio del declive del Imperio Español y el ascenso del poder naval inglés.",
    year: 1588,
    lat: 54.0,
    lng: -5.0,
    region: "Europa",
    importance: 1
  },
  {
    id: "galileo",
    title: "Galileo y el Telescopio Astronómico",
    description: "Galileo Galilei mejora el telescopio y lo apunta al cielo, descubriendo los satélites de Júpiter y confirmando el heliocentrismo copernicano, entrando en conflicto con la Inquisición.",
    year: 1610,
    lat: 45.41,
    lng: 11.88,
    region: "Europa",
    importance: 1
  },
  {
    id: "mayflower",
    title: "Llegada del Mayflower a América del Norte",
    description: "Los 'Padres Peregrinos' a bordo del Mayflower establecen la colonia de Plymouth en Massachusetts, iniciando la colonización puritana inglesa de Nueva Inglaterra.",
    year: 1620,
    lat: 41.96,
    lng: -70.67,
    region: "América",
    importance: 1
  },

  // ── MODERN ERA (1700 – 1900) ───────────────────────────────────────────────
  {
    id: "newton-principia",
    title: "Principia Mathematica de Newton",
    description: "Isaac Newton publica su obra maestra en la que formula las leyes del movimiento y la gravitación universal, consolidando la física clásica y la revolución científica.",
    year: 1687,
    lat: 52.2,
    lng: 0.12,
    region: "Europa",
    importance: 1
  },
  {
    id: "american-independence",
    title: "Declaración de Independencia de EE.UU.",
    description: "Las trece colonias norteamericanas declaran su independencia del Imperio Británico, creando los Estados Unidos de América y difundiendo los ideales ilustrados de libertad e igualdad.",
    year: 1776,
    lat: 39.95,
    lng: -75.17,
    region: "América",
    importance: 1
  },
  {
    id: "french-revolution",
    title: "Revolución Francesa",
    description: "La Toma de la Bastilla desencadena la Revolución Francesa, que abolirá la monarquía absolutista, decapitará al rey y difundirá los ideales de libertad, igualdad y fraternidad por Europa.",
    year: 1789,
    lat: 48.85,
    lng: 2.37,
    region: "Europa",
    importance: 1
  },
  {
    id: "haitian-revolution",
    title: "Revolución Haitiana",
    description: "Los esclavos de Saint-Domingue se rebelan liderados por Toussaint Louverture, fundando Haití como la primera república negra libre del mundo en 1804.",
    year: 1791,
    lat: 19.43,
    lng: -72.33,
    region: "América",
    importance: 1
  },
  {
    id: "napoleon-empire",
    title: "Napoleon Bonaparte — Emperador de los Franceses",
    description: "Napoleón se corona Emperador en Notre Dame, iniciando el período napoleónico que redibujará el mapa de Europa y difundirá el Código Civil por el mundo.",
    year: 1804,
    lat: 48.85,
    lng: 2.35,
    region: "Europa",
    importance: 1
  },
  {
    id: "latin-american-independence",
    title: "Independencias de América Latina",
    description: "Las guerras de independencia lideradas por Simón Bolívar, San Martín y otros libertadores transforman las colonias españolas en repúblicas independientes a lo largo de Sudamérica.",
    year: 1819,
    lat: 4.71,
    lng: -74.07,
    region: "América",
    importance: 1
  },
  {
    id: "industrial-revolution",
    title: "Revolución Industrial en Gran Bretaña",
    description: "La mecanización de la producción con la máquina de vapor transforma radicalmente la economía, la sociedad y el medio ambiente, iniciando la era industrial moderna.",
    year: 1830,
    lat: 52.48,
    lng: -1.9,
    region: "Europa",
    importance: 1
  },
  {
    id: "darwin-origin",
    title: "El Origen de las Especies de Darwin",
    description: "Charles Darwin publica su teoría de la evolución por selección natural, revolucionando la biología y la comprensión humana de la vida en la Tierra.",
    year: 1859,
    lat: 51.5,
    lng: -0.12,
    region: "Europa",
    importance: 1
  },
  {
    id: "us-civil-war",
    title: "Guerra Civil Estadounidense y Abolición de la Esclavitud",
    description: "La Unión derrota a los Estados Confederados, Lincoln promulga la Proclama de Emancipación y la esclavitud es abolida en los Estados Unidos.",
    year: 1865,
    lat: 38.9,
    lng: -77.04,
    region: "América",
    importance: 1
  },
  {
    id: "meiji-restoration",
    title: "Restauración Meiji en Japón",
    description: "El joven emperador Meiji inicia la modernización acelerada de Japón, adoptando tecnología y estructuras occidentales para transformar al país en una potencia mundial en pocas décadas.",
    year: 1868,
    lat: 35.69,
    lng: 139.69,
    region: "Asia",
    importance: 1
  },
  {
    id: "suez-canal",
    title: "Inauguración del Canal de Suez",
    description: "El Canal de Suez conecta el Mar Mediterráneo con el Mar Rojo, reduciendo drásticamente las rutas marítimas entre Europa y Asia y transformando el comercio global.",
    year: 1869,
    lat: 30.7,
    lng: 32.34,
    region: "África",
    importance: 1
  },
  {
    id: "scramble-africa",
    title: "Conferencia de Berlín — Reparto de África",
    description: "Las potencias europeas se reúnen para repartirse formalmente el continente africano, estableciendo las fronteras coloniales que en su mayoría persisten hoy.",
    year: 1884,
    lat: 52.52,
    lng: 13.4,
    region: "Europa",
    importance: 1
  },

  // ── 20TH CENTURY ──────────────────────────────────────────────────────────
  {
    id: "wright-brothers",
    title: "Primer Vuelo de los Hermanos Wright",
    description: "Orville Wright realiza el primer vuelo motorizado controlado de la historia en Kitty Hawk, Carolina del Norte, cubriendo 36 metros en 12 segundos y abriendo la era de la aviación.",
    year: 1903,
    lat: 36.02,
    lng: -75.67,
    region: "América",
    importance: 1
  },
  {
    id: "ww1",
    title: "Inicio de la Primera Guerra Mundial",
    description: "El asesinato del Archiduque Francisco Fernando en Sarajevo desencadena la Gran Guerra, el primer conflicto de escala industrial que causó 20 millones de muertes.",
    year: 1914,
    lat: 43.85,
    lng: 18.42,
    region: "Europa",
    importance: 1
  },
  {
    id: "russian-revolution",
    title: "Revolución Rusa de Octubre",
    description: "Los bolcheviques liderados por Lenin toman el poder en Petrogrado, derrocando al gobierno provisional e iniciando el primer estado comunista del mundo.",
    year: 1917,
    lat: 59.94,
    lng: 30.32,
    region: "Europa",
    importance: 1
  },
  {
    id: "spanish-flu",
    title: "Pandemia de Gripe Española",
    description: "La pandemia de influenza H1N1 infecta a un tercio de la población mundial y mata entre 50 y 100 millones de personas, siendo la pandemia más mortífera de la era moderna.",
    year: 1918,
    lat: 48.85,
    lng: 2.35,
    region: "Europa",
    importance: 1
  },
  {
    id: "ww2-start",
    title: "Inicio de la Segunda Guerra Mundial",
    description: "La Alemania Nazi invade Polonia, desencadenando el conflicto más destructivo de la historia humana con más de 70 millones de muertos y el Holocausto.",
    year: 1939,
    lat: 52.23,
    lng: 21.01,
    region: "Europa",
    importance: 1
  },
  {
    id: "d-day",
    title: "Desembarco de Normandía (Día D)",
    description: "Las fuerzas aliadas lanzan la mayor invasión anfibia de la historia en las playas de Normandía, abriendo un segundo frente en Europa y marcando el inicio del fin de la ocupación nazi.",
    year: 1944,
    lat: 49.36,
    lng: -0.87,
    region: "Europa",
    importance: 1
  },
  {
    id: "hiroshima",
    title: "Bombardeo Atómico de Hiroshima",
    description: "EE.UU. lanza la primera bomba atómica usada en guerra sobre Hiroshima, matando a 80.000 personas al instante y acelerando la rendición japonesa y el fin de la Segunda Guerra Mundial.",
    year: 1945,
    lat: 34.39,
    lng: 132.45,
    region: "Asia",
    importance: 1
  },
  {
    id: "un-founded",
    title: "Fundación de las Naciones Unidas",
    description: "Cincuenta y un naciones firman la Carta de las Naciones Unidas en San Francisco, creando el organismo internacional destinado a mantener la paz y seguridad mundiales.",
    year: 1945,
    lat: 37.79,
    lng: -122.41,
    region: "América",
    importance: 1
  },
  {
    id: "india-independence",
    title: "Independencia de la India",
    description: "Tras la lucha no violenta de Mahatma Gandhi, la India obtiene su independencia del Imperio Británico, aunque la partición con Pakistán causa millones de desplazados.",
    year: 1947,
    lat: 28.61,
    lng: 77.21,
    region: "Asia",
    importance: 1
  },
  {
    id: "israel-founded",
    title: "Fundación del Estado de Israel",
    description: "David Ben-Gurión proclama el Estado de Israel en Tierra Santa, dando fin al mandato británico de Palestina e iniciando el conflicto árabe-israelí que persiste hasta hoy.",
    year: 1948,
    lat: 32.08,
    lng: 34.78,
    region: "Asia",
    importance: 1
  },
  {
    id: "dna-discovery",
    title: "Descubrimiento de la Estructura del ADN",
    description: "Watson, Crick, Franklin y Wilkins revelan la estructura de doble hélice del ADN, inaugurando la era de la biología molecular y la medicina genómica.",
    year: 1953,
    lat: 52.2,
    lng: 0.12,
    region: "Europa",
    importance: 1
  },
  {
    id: "sputnik",
    title: "Lanzamiento del Sputnik — Era Espacial",
    description: "La URSS lanza el Sputnik 1, el primer satélite artificial de la historia, inaugurando la era espacial y desencadenando la carrera espacial entre EE.UU. y la URSS.",
    year: 1957,
    lat: 45.92,
    lng: 63.34,
    region: "Asia",
    importance: 1
  },
  {
    id: "cuban-missile-crisis",
    title: "Crisis de los Misiles de Cuba",
    description: "El descubrimiento de misiles soviéticos en Cuba lleva a EE.UU. y la URSS al borde de una guerra nuclear, el momento más peligroso de la Guerra Fría.",
    year: 1962,
    lat: 22.5,
    lng: -79.5,
    region: "América",
    importance: 1
  },
  {
    id: "moon-landing",
    title: "Llegada del Hombre a la Luna",
    description: "Neil Armstrong y Buzz Aldrin se convierten en los primeros seres humanos en pisar la Luna durante la misión Apolo 11, en uno de los mayores logros tecnológicos de la humanidad.",
    year: 1969,
    lat: 0.68,
    lng: 23.47,
    region: "Espacio",
    importance: 1
  },
  {
    id: "internet-arpanet",
    title: "Primera Conexión ARPANET — Inicio de Internet",
    description: "Se transmite el primer mensaje entre computadoras de UCLA y Stanford a través de ARPANET, la red precursora de Internet que transformaría para siempre la comunicación humana.",
    year: 1969,
    lat: 34.07,
    lng: -118.44,
    region: "América",
    importance: 1
  },
  {
    id: "fall-berlin-wall",
    title: "Caída del Muro de Berlín",
    description: "Los alemanes del Este cruzan el Muro de Berlín libremente por primera vez en 28 años, iniciando la reunificación alemana y marcando el fin simbólico de la Guerra Fría.",
    year: 1989,
    lat: 52.51,
    lng: 13.38,
    region: "Europa",
    importance: 1
  },
  {
    id: "ussr-dissolution",
    title: "Disolución de la Unión Soviética",
    description: "Mijail Gorbachov dimite como presidente de la URSS, declarando oficialmente la disolución del estado soviético y el fin de la Guerra Fría, liberando a 15 nuevas naciones.",
    year: 1991,
    lat: 55.75,
    lng: 37.62,
    region: "Europa",
    importance: 1
  },
  {
    id: "south-africa-apartheid",
    title: "Fin del Apartheid — Mandela Presidente",
    description: "Nelson Mandela gana las primeras elecciones democráticas en Sudáfrica tras 27 años en prisión, poniendo fin al apartheid y comenzando la reconciliación nacional.",
    year: 1994,
    lat: -25.74,
    lng: 28.19,
    region: "África",
    importance: 1
  },
  {
    id: "www-invented",
    title: "Nacimiento de la World Wide Web",
    description: "Tim Berners-Lee lanza la primera página web del mundo en el CERN, haciendo pública la World Wide Web y transformando radicalmente la comunicación, el comercio y la cultura global.",
    year: 1991,
    lat: 46.23,
    lng: 6.05,
    region: "Europa",
    importance: 1
  },
  {
    id: "9-11",
    title: "Ataques del 11 de Septiembre",
    description: "Los ataques terroristas de Al-Qaeda contra las Torres Gemelas de Nueva York y el Pentágono causan casi 3.000 muertes y desencadenan la 'Guerra contra el Terror' que redefine la geopolítica global.",
    year: 2001,
    lat: 40.71,
    lng: -74.01,
    region: "América",
    importance: 1
  },
  {
    id: "iphone-launch",
    title: "Steve Jobs presenta el iPhone",
    description: "Apple presenta el primer iPhone en San Francisco, inaugurando la era del smartphone y transformando radicalmente la forma en que 3.000 millones de personas interactúan con el mundo digital.",
    year: 2007,
    lat: 37.78,
    lng: -122.4,
    region: "América",
    importance: 1
  },
  {
    id: "global-financial-crisis",
    title: "Crisis Financiera Global",
    description: "El colapso del banco Lehman Brothers desencadena la mayor crisis financiera desde 1929, causando una recesión global que afecta a millones de personas en todo el mundo.",
    year: 2008,
    lat: 40.71,
    lng: -74.01,
    region: "América",
    importance: 1
  },
  {
    id: "arab-spring",
    title: "Primavera Árabe",
    description: "Una ola de revoluciones populares recorre el mundo árabe comenzando en Túnez, derrocando dictaduras en Egipto, Libia y Yemen, e iniciando una guerra civil en Siria.",
    year: 2011,
    lat: 33.88,
    lng: 9.54,
    region: "África",
    importance: 1
  },
  {
    id: "paris-agreement",
    title: "Acuerdo de París sobre Cambio Climático",
    description: "196 naciones firman el Acuerdo de París comprometiéndose a limitar el calentamiento global a 1.5°C, el mayor esfuerzo diplomático coordinado frente a la crisis climática.",
    year: 2015,
    lat: 48.85,
    lng: 2.35,
    region: "Europa",
    importance: 1
  },
  {
    id: "covid-pandemic",
    title: "Pandemia de COVID-19",
    description: "La OMS declara pandemia mundial por el coronavirus SARS-CoV-2, que causará más de 7 millones de muertes confirmadas, paralizará la economía global y acelerará la transformación digital.",
    year: 2020,
    lat: 30.59,
    lng: 114.3,
    region: "Asia",
    importance: 1
  },
  {
    id: "ukraine-war",
    title: "Invasión Rusa de Ucrania",
    description: "Rusia invade a gran escala Ucrania, desencadenando la mayor guerra en Europa desde 1945, causando millones de desplazados y reordenando las alianzas geopolíticas globales.",
    year: 2022,
    lat: 50.45,
    lng: 30.52,
    region: "Europa",
    importance: 1
  },
  {
    id: "chatgpt-launch",
    title: "Lanzamiento de ChatGPT — Era de la IA Generativa",
    description: "OpenAI lanza ChatGPT al público general, alcanzando 100 millones de usuarios en dos meses y desencadenando la carrera global por la inteligencia artificial generativa.",
    year: 2022,
    lat: 37.79,
    lng: -122.39,
    region: "América",
    importance: 1
  },
  {
    id: "ai-era-2024",
    title: "Explosión de la Inteligencia Artificial",
    description: "Los modelos de IA superan a los humanos en múltiples tareas cognitivas, transformando industrias enteras desde la medicina hasta el arte, mientras el mundo debate su regulación ética.",
    year: 2024,
    lat: 37.79,
    lng: -122.39,
    region: "América",
    importance: 1
  },
  {
    id: "paul-conversion",
    title: "Conversión de San Pablo",
    description: "Saulo de Tarso, un perseguidor de cristianos, tiene una visión en el camino a Damasco que lo transforma en Pablo, el 'Apóstol de los Gentiles' y figura clave en la difusión del cristianismo.",
    year: 34,
    lat: 33.51,
    lng: 36.29,
    region: "Asia",
    importance: 2,
    relatedEvents: ["birth-christianity"]
  },
  {
    id: "edict-milan",
    title: "Edicto de Milán",
    description: "Los emperadores Constantino I y Licinio proclaman la libertad religiosa en todo el Imperio Romano, poniendo fin a las persecuciones cristianas y devolviendo sus bienes a la Iglesia.",
    year: 313,
    lat: 45.46,
    lng: 9.19,
    region: "Europa",
    importance: 1,
    relatedEvents: ["birth-christianity", "christianity-official-religion"]
  },
  {
    id: "christianity-official-religion",
    title: "Edicto de Tesalónica",
    description: "El emperador Teodosio I declara al cristianismo niceno como la única religión oficial del Imperio Romano mediante el Edicto de Tesalónica.",
    year: 380,
    lat: 40.64,
    lng: 22.94,
    region: "Europa",
    importance: 1,
    relatedEvents: ["birth-christianity", "edict-milan"]
  },

  // ── NEW EVENTS: CHRISTIANITY EXPANSION ────────────────────────────────────
  {
    id: "council-nicaea",
    title: "Concilio de Nicea",
    description: "El emperador Constantino convoca el primer concilio ecuménico en Nicea, donde se define el Credo Niceno y se establece la doctrina ortodoxa del cristianismo.",
    year: 325,
    lat: 40.43,
    lng: 29.72,
    region: "Asia",
    importance: 2
  },

  // ── NEW EVENTS: WWI ───────────────────────────────────────────────────────
  {
    id: "assassination-archduke",
    title: "Asesinato del Archiduque Francisco Fernando",
    description: "Gavrilo Princip asesina al archiduque Francisco Fernando de Austria-Hungría y a su esposa Sofía en Sarajevo, encendiendo la mecha de la Primera Guerra Mundial.",
    year: 1914,
    lat: 43.86,
    lng: 18.43,
    region: "Europa",
    importance: 1
  },
  {
    id: "battle-verdun",
    title: "Batalla de Verdún",
    description: "Francia y Alemania se enfrentan durante 303 días en la batalla más larga de la Gran Guerra, con casi 700.000 bajas combinadas convertida en símbolo del horror de la guerra de trincheras.",
    year: 1916,
    lat: 49.16,
    lng: 5.39,
    region: "Europa",
    importance: 2
  },
  {
    id: "us-enters-ww1",
    title: "EE.UU. entra en la Primera Guerra Mundial",
    description: "Tras el hundimiento de barcos mercantes por submarinos alemanes y el telegrama Zimmermann, Estados Unidos declara la guerra a Alemania, inclinando decisivamente la balanza del conflicto.",
    year: 1917,
    lat: 38.9,
    lng: -77.04,
    region: "América",
    importance: 2
  },
  {
    id: "treaty-versailles",
    title: "Tratado de Versalles",
    description: "Las potencias vencedoras imponen duras condiciones a Alemania: pérdidas territoriales, desarme y reparaciones económicas aplastantes que sembrarán el resentimiento que alimentará al nazismo.",
    year: 1919,
    lat: 48.8,
    lng: 2.12,
    region: "Europa",
    importance: 1
  },
  {
    id: "league-of-nations",
    title: "Fundación de la Sociedad de Naciones",
    description: "Se crea la Sociedad de Naciones en Ginebra con el objetivo de mantener la paz mundial, pero la ausencia de EE.UU. y su debilidad institucional la condenarán al fracaso.",
    year: 1920,
    lat: 46.23,
    lng: 6.15,
    region: "Europa",
    importance: 2
  },

  // ── NEW EVENTS: WWII ──────────────────────────────────────────────────────
  {
    id: "rise-of-hitler",
    title: "Ascenso de Adolf Hitler al Poder",
    description: "Adolf Hitler es nombrado Canciller de Alemania, iniciando la transformación de la República de Weimar en la dictadura del Tercer Reich que llevaría al mundo a la guerra más devastadora de la historia.",
    year: 1933,
    lat: 52.52,
    lng: 13.4,
    region: "Europa",
    importance: 1
  },
  {
    id: "fall-of-france",
    title: "Caída de Francia",
    description: "La Wehrmacht ejecuta una blitzkrieg arrolladora a través de las Ardenas, derrotando al ejército francés en seis semanas y ocupando París, dejando a Gran Bretaña sola frente al Eje.",
    year: 1940,
    lat: 48.85,
    lng: 2.35,
    region: "Europa",
    importance: 2
  },
  {
    id: "pearl-harbor",
    title: "Ataque a Pearl Harbor",
    description: "La Armada Imperial Japonesa lanza un devastador ataque sorpresa contra la base naval estadounidense en Hawái, destruyendo gran parte de la flota del Pacífico y forzando la entrada de EE.UU. en la guerra.",
    year: 1941,
    lat: 21.36,
    lng: -157.95,
    region: "América",
    importance: 1
  },
  {
    id: "battle-stalingrad",
    title: "Batalla de Stalingrado",
    description: "El Ejército Rojo rodea y destruye al 6.º Ejército alemán en Stalingrado tras meses de combate cuerpo a cuerpo, marcando el punto de inflexión decisivo en el Frente Oriental.",
    year: 1943,
    lat: 48.71,
    lng: 44.51,
    region: "Europa",
    importance: 1
  },

  // ── NEW EVENTS: COLD WAR ──────────────────────────────────────────────────
  {
    id: "berlin-blockade",
    title: "Bloqueo de Berlín y Puente Aéreo",
    description: "La URSS bloquea todos los accesos terrestres a Berlín Occidental. EE.UU. y sus aliados organizan un puente aéreo de 11 meses que abastece a 2 millones de berlineses y marca la primera gran crisis de la Guerra Fría.",
    year: 1948,
    lat: 52.52,
    lng: 13.4,
    region: "Europa",
    importance: 2
  },
  {
    id: "korean-war",
    title: "Guerra de Corea",
    description: "Corea del Norte, apoyada por China y la URSS, invade Corea del Sur desencadenando un conflicto que causará millones de muertes y dividirá la península coreana hasta hoy.",
    year: 1950,
    lat: 37.57,
    lng: 126.98,
    region: "Asia",
    importance: 1
  },
  {
    id: "berlin-wall-built",
    title: "Construcción del Muro de Berlín",
    description: "La RDA levanta un muro de hormigón que divide Berlín y a Alemania entera, convirtiéndose en el símbolo más potente de la división del mundo durante la Guerra Fría.",
    year: 1961,
    lat: 52.51,
    lng: 13.38,
    region: "Europa",
    importance: 1
  },
  {
    id: "vietnam-war-end",
    title: "Caída de Saigón — Fin de la Guerra de Vietnam",
    description: "Las fuerzas norvietnamitas toman Saigón, poniendo fin a dos décadas de guerra en Vietnam. La evacuación caótica de la embajada estadounidense simboliza la primera derrota militar de EE.UU.",
    year: 1975,
    lat: 10.78,
    lng: 106.7,
    region: "Asia",
    importance: 1
  },

  // ── NEW EVENTS: MAO'S REVOLUTION ──────────────────────────────────────────
  {
    id: "fall-qing-dynasty",
    title: "Caída de la Dinastía Qing — República de China",
    description: "La Revolución de Xinhai derroca a la última dinastía imperial china tras 2.000 años de gobierno monárquico, proclamando la República de China bajo Sun Yat-sen.",
    year: 1912,
    lat: 32.06,
    lng: 118.8,
    region: "Asia",
    importance: 1
  },
  {
    id: "chinese-civil-war",
    title: "Inicio de la Guerra Civil China",
    description: "El Partido Comunista de China y el Kuomintang de Chiang Kai-shek inician una guerra civil que durará intermitentemente más de veinte años y transformará el destino de Asia.",
    year: 1927,
    lat: 32.06,
    lng: 118.8,
    region: "Asia",
    importance: 2
  },
  {
    id: "long-march",
    title: "La Larga Marcha de Mao Zedong",
    description: "El Ejército Rojo de Mao recorre 9.000 km a pie durante un año para escapar del cerco nacionalista. Solo 8.000 de los 80.000 soldados sobreviven, pero el evento forja la leyenda fundacional de la China comunista.",
    year: 1934,
    lat: 28.23,
    lng: 104.77,
    region: "Asia",
    importance: 2
  },
  {
    id: "japan-invades-china",
    title: "Invasión Japonesa de China",
    description: "Japón lanza una invasión a gran escala de China que incluirá la Masacre de Nankín. El conflicto causa millones de muertes y obliga a comunistas y nacionalistas a cooperar temporalmente.",
    year: 1937,
    lat: 32.06,
    lng: 118.8,
    region: "Asia",
    importance: 1
  },
  {
    id: "peoples-republic-china",
    title: "Fundación de la República Popular China",
    description: "Mao Zedong proclama la República Popular China desde la Puerta de Tiananmén en Pekín, completando la revolución comunista y transformando al país más poblado del mundo.",
    year: 1949,
    lat: 39.91,
    lng: 116.39,
    region: "Asia",
    importance: 1
  },
  {
    id: "great-leap-forward",
    title: "El Gran Salto Adelante",
    description: "Mao lanza una campaña de industrialización y colectivización forzada que provoca la peor hambruna de la historia, causando entre 15 y 55 millones de muertes en tres años.",
    year: 1958,
    lat: 39.91,
    lng: 116.39,
    region: "Asia",
    importance: 1
  },
  {
    id: "cultural-revolution",
    title: "La Revolución Cultural",
    description: "Mao lanza la Revolución Cultural para purgar a sus rivales políticos, movilizando a los Guardias Rojos en una ola de fanatismo ideológico que destruye patrimonio cultural y causa millones de persecuciones.",
    year: 1966,
    lat: 39.91,
    lng: 116.39,
    region: "Asia",
    importance: 1
  },
  {
    id: "nixon-china",
    title: "Nixon visita China — Apertura Diplomática",
    description: "El presidente Richard Nixon visita la República Popular China por primera vez, normalizando relaciones entre las dos superpotencias y reconfigurando la geopolítica de la Guerra Fría.",
    year: 1972,
    lat: 39.91,
    lng: 116.39,
    region: "Asia",
    importance: 1
  },

  // ── NEW EVENTS: INDUSTRIAL REVOLUTION ─────────────────────────────────────
  {
    id: "steam-engine",
    title: "Máquina de Vapor de James Watt",
    description: "James Watt patenta mejoras cruciales a la máquina de vapor, multiplicando su eficiencia y transformándola en el motor de la Revolución Industrial que cambiará el mundo para siempre.",
    year: 1769,
    lat: 55.86,
    lng: -4.25,
    region: "Europa",
    importance: 1
  },
  {
    id: "spinning-jenny",
    title: "La Spinning Jenny y la Mecanización Textil",
    description: "La invención de la Spinning Jenny por James Hargreaves multiplica la capacidad de hilado, iniciando la mecanización de la industria textil británica y desplazando a millones de artesanos.",
    year: 1770,
    lat: 53.75,
    lng: -2.49,
    region: "Europa",
    importance: 2
  },
  {
    id: "first-railroad",
    title: "Primer Ferrocarril Público — Stockton a Darlington",
    description: "George Stephenson inaugura el primer ferrocarril público de pasajeros y mercancías, revolucionando el transporte terrestre y acelerando exponencialmente la industrialización global.",
    year: 1825,
    lat: 54.52,
    lng: -1.55,
    region: "Europa",
    importance: 1
  },
  {
    id: "telephone-invention",
    title: "Invención del Teléfono",
    description: "Alexander Graham Bell patenta el teléfono, inaugurando la era de las telecomunicaciones instantáneas que transformará para siempre cómo la humanidad se comunica a distancia.",
    year: 1876,
    lat: 42.36,
    lng: -71.06,
    region: "América",
    importance: 1
  },
  {
    id: "electricity-age",
    title: "Edison Enciende Nueva York — Era de la Electricidad",
    description: "Thomas Edison inaugura la primera central eléctrica comercial en Pearl Street, Manhattan, iluminando 85 edificios y abriendo las puertas a la electrificación que transformaría la vida moderna.",
    year: 1882,
    lat: 40.71,
    lng: -74.01,
    region: "América",
    importance: 1
  },

  // ── NEW EVENTS: AGE OF DISCOVERY ──────────────────────────────────────────
  {
    id: "spanish-conquest-inca",
    title: "Conquista Española del Imperio Inca",
    description: "Francisco Pizarro captura al emperador inca Atahualpa en Cajamarca con apenas 168 hombres, derrumbando el mayor imperio de América del Sur y iniciando el dominio colonial español en los Andes.",
    year: 1533,
    lat: -7.16,
    lng: -78.51,
    region: "América",
    importance: 1
  },
  {
    id: "dutch-east-india",
    title: "Fundación de la Compañía Holandesa de las Indias Orientales",
    description: "Los Países Bajos crean la VOC, la primera corporación multinacional y la primera en emitir acciones, inaugurando el capitalismo moderno y dominando el comercio de especias durante dos siglos.",
    year: 1602,
    lat: 52.37,
    lng: 4.9,
    region: "Europa",
    importance: 1
  },

  // ── NEW EVENTS: FRENCH REVOLUTION & NAPOLEON ──────────────────────────────
  {
    id: "enlightenment",
    title: "La Enciclopedia — Cumbre de la Ilustración",
    description: "Diderot y d'Alembert publican los primeros volúmenes de la Enciclopedia, compilando todo el saber humano y difundiendo las ideas racionalistas que desafiarán al absolutismo y a la Iglesia.",
    year: 1751,
    lat: 48.85,
    lng: 2.35,
    region: "Europa",
    importance: 1
  },
  {
    id: "reign-of-terror",
    title: "El Terror — Robespierre y la Guillotina",
    description: "Maximilien Robespierre instaura un régimen de terror en Francia: decenas de miles son ejecutados en la guillotina, incluyendo al propio rey Luis XVI, en nombre de la 'virtud republicana'.",
    year: 1793,
    lat: 48.85,
    lng: 2.35,
    region: "Europa",
    importance: 2
  },
  {
    id: "battle-trafalgar",
    title: "Batalla de Trafalgar",
    description: "La Royal Navy del almirante Nelson destruye la flota franco-española frente al cabo Trafalgar, asegurando la supremacía naval británica por un siglo pero costándole la vida a Nelson.",
    year: 1805,
    lat: 36.18,
    lng: -6.03,
    region: "Europa",
    importance: 2
  },
  {
    id: "invasion-russia",
    title: "Invasión Napoleónica de Rusia",
    description: "Napoleón invade Rusia con la Grande Armée de 600.000 hombres. La toma de Moscú resulta inútil cuando los rusos incendian la ciudad, y el invierno letal destruye al 95% del ejército francés.",
    year: 1812,
    lat: 55.75,
    lng: 37.62,
    region: "Europa",
    importance: 1
  },
  {
    id: "battle-waterloo",
    title: "Batalla de Waterloo — Caída de Napoleón",
    description: "El ejército de Napoleón es derrotado definitivamente por las fuerzas británicas y prusianas en Waterloo, poniendo fin a las guerras napoleónicas y al sueño de una Europa unificada bajo Francia.",
    year: 1815,
    lat: 50.71,
    lng: 4.41,
    region: "Europa",
    importance: 1
  },
  // ── NEW REGIONAL & CONTINENTAL EVENTS ────────────────────────────────────
  {
    id: "buenos-aires-foundation",
    title: "Primera Fundación de Buenos Aires",
    description: "Pedro de Mendoza funda la ciudad de Santa María del Buen Ayre, aunque sería abandonada años después por conflictos con los querandíes.",
    year: 1536,
    lat: -34.60,
    lng: -58.38,
    region: "América",
    importance: 3
  },
  {
    id: "cordoba-foundation",
    title: "Fundación de Córdoba (Argentina)",
    description: "Jerónimo Luis de Cabrera funda la ciudad de Córdoba de la Nueva Andalucía, importante centro cultural y religioso del cono sur.",
    year: 1573,
    lat: -31.41,
    lng: -64.18,
    region: "América",
    importance: 3
  },
  {
    id: "may-revolution",
    title: "Revolución de Mayo",
    description: "Semana de acontecimientos en Buenos Aires que concluyó con la destitución del virrey Cisneros y la asunción de la Primera Junta.",
    year: 1810,
    lat: -34.608,
    lng: -58.37,
    region: "América",
    importance: 2
  },
  {
    id: "crossing-andes",
    title: "Cruce de los Andes",
    description: "El general José de San Martín cruza la cordillera de los Andes con el Ejército de los Andes para liberar Chile y luego Perú.",
    year: 1817,
    lat: -32.65,
    lng: -70.08,
    region: "América",
    importance: 2
  },
  {
    id: "machu-picchu-discovery",
    title: "Descubrimiento científico de Machu Picchu",
    description: "Hiram Bingham llega a las ruinas de Machu Picchu en Perú, dándolas a conocer al mundo occidental.",
    year: 1911,
    lat: -13.16,
    lng: -72.54,
    region: "América",
    importance: 2
  },
  {
    id: "cuzco-foundation",
    title: "Fundación del Cusco",
    description: "Manco Cápac funda el Cusco, que se convertiría en la capital del Imperio Inca (Tawantinsuyu).",
    year: 1200,
    lat: -13.53,
    lng: -71.96,
    region: "América",
    importance: 2
  },
  {
    id: "teotihuacan-peak",
    title: "Apogeo de Teotihuacán",
    description: "Teotihuacán se convierte en la ciudad más grande de Mesoamérica, con la construcción de las Pirámides del Sol y la Luna.",
    year: 400,
    lat: 19.69,
    lng: -98.84,
    region: "América",
    importance: 2
  },
  {
    id: "chichen-itza",
    title: "Esplendor de Chichén Itzá",
    description: "La ciudad maya de Chichén Itzá se consolida como el principal centro de poder en la península de Yucatán.",
    year: 900,
    lat: 20.68,
    lng: -88.56,
    region: "América",
    importance: 2
  },
  {
    id: "battle-maipu",
    title: "Batalla de Maipú",
    description: "Victoria decisiva de las tropas patriotas lideradas por San Martín que asegura la independencia de Chile.",
    year: 1818,
    lat: -33.51,
    lng: -70.76,
    region: "América",
    importance: 3
  },
  {
    id: "la-paz-foundation",
    title: "Fundación de La Paz",
    description: "El capitán español Alonso de Mendoza funda la ciudad de Nuestra Señora de La Paz en Bolivia.",
    year: 1548,
    lat: -16.50,
    lng: -68.11,
    region: "América",
    importance: 3
  },
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
];

export const safaris: Safari[] = [
  {
    id: "christianity-safari",
    name: "El Auge del Cristianismo",
    description: "De secta perseguida a religión que redefinió Occidente.",
    overview: "Este safari recorre los momentos clave en los que una pequeña secta perseguida se transformó en la fuerza cultural y espiritual más poderosa de Occidente. Desde la crucifixión de Jesús hasta la Reforma de Lutero, analizaremos cómo eventos teológicos se tradujeron en giros geopolíticos masivos.",
    eventIds: ["birth-christianity", "paul-conversion", "council-nicaea", "edict-milan", "christianity-official-religion", "fall-western-rome", "charlemagne", "reformation-luther"],
    color: "#EAB308",
    thumbnail: "https://www.biblword.net/wp-content/uploads/sites/45/2026/01/what-is-christianity-about-picture.jpg"
  },
  {
    id: "ww1-safari",
    name: "La Gran Guerra",
    description: "El conflicto que destruyó imperios y redibujó el mapa de Europa.",
    overview: "La Primera Guerra Mundial fue el primer conflicto verdaderamente industrial de la historia. Un asesinato en Sarajevo desencadenó una reacción en cadena de alianzas que arrastró a millones a las trincheras. Este safari recorre los momentos decisivos que destruyeron cuatro imperios y sembraron las semillas de un conflicto aún mayor.",
    eventIds: ["assassination-archduke", "ww1", "battle-verdun", "us-enters-ww1", "russian-revolution", "treaty-versailles", "spanish-flu", "league-of-nations"],
    color: "#78716C"
  },
  {
    id: "ww2-safari",
    name: "La Segunda Guerra Mundial",
    description: "El conflicto más devastador de la historia humana.",
    overview: "Un viaje a través de la guerra que definió al siglo XX. Desde el ascenso del nazismo hasta la era atómica, exploraremos cómo la ambición totalitaria llevó al mundo al borde de la destrucción y cómo las cenizas del conflicto forjaron un nuevo orden mundial.",
    eventIds: ["rise-of-hitler", "ww2-start", "fall-of-france", "pearl-harbor", "battle-stalingrad", "d-day", "hiroshima", "un-founded"],
    color: "#EF4444"
  },
  {
    id: "cold-war-safari",
    name: "La Guerra Fría",
    description: "El mundo al borde del abismo nuclear durante cuatro décadas.",
    overview: "Tras la Segunda Guerra Mundial, EE.UU. y la URSS dividieron el planeta en dos bloques ideológicos rivales. Este safari recorre las crisis, guerras proxy y la carrera espacial que mantuvieron a la humanidad al borde de la aniquilación nuclear, hasta la caída del muro que simbolizó el fin de una era.",
    eventIds: ["berlin-blockade", "korean-war", "sputnik", "berlin-wall-built", "cuban-missile-crisis", "moon-landing", "vietnam-war-end", "fall-berlin-wall", "ussr-dissolution"],
    color: "#3B82F6"
  },
  {
    id: "mao-safari",
    name: "La Revolución de Mao",
    description: "La transformación radical de la nación más poblada del planeta.",
    overview: "Este safari narra la épica y trágica historia de cómo Mao Zedong transformó China de un imperio en ruinas en una potencia comunista. Desde la caída de la última dinastía hasta la apertura diplomática con Nixon, cada evento redefinió el destino de más de mil millones de personas.",
    eventIds: ["fall-qing-dynasty", "chinese-civil-war", "long-march", "japan-invades-china", "peoples-republic-china", "great-leap-forward", "cultural-revolution", "nixon-china"],
    color: "#DC2626"
  },
  {
    id: "industrial-revolution-safari",
    name: "La Revolución Industrial",
    description: "La transformación que creó el mundo moderno tal y como lo conocemos.",
    overview: "En apenas un siglo, la humanidad pasó del caballo y la vela a la máquina de vapor y la electricidad. Este safari recorre los inventos, descubrimientos e infraestructuras que transformaron una sociedad agraria en la civilización industrial que heredamos hoy.",
    eventIds: ["steam-engine", "spinning-jenny", "industrial-revolution", "first-railroad", "darwin-origin", "suez-canal", "telephone-invention", "electricity-age"],
    color: "#F97316"
  },
  {
    id: "discovery-safari",
    name: "La Era de los Descubrimientos",
    description: "Cuando Europa se lanzó a explorar y conquistar el mundo.",
    overview: "La caída de Constantinopla cerró las rutas terrestres a Asia y empujó a las potencias europeas al océano. Este safari recorre la épica era de exploración que conectó continentes, destruyó imperios ancestrales y estableció las bases del mundo globalizado que habitamos hoy.",
    eventIds: ["fall-constantinople", "columbus", "vasco-da-gama", "spanish-conquest-aztec", "magellan-circumnavigation", "spanish-conquest-inca", "dutch-east-india", "mayflower"],
    color: "#14B8A6"
  },
  {
    id: "french-revolution-safari",
    name: "Revolución Francesa y Napoleón",
    description: "La caída del Antiguo Régimen y el nacimiento del mundo moderno.",
    overview: "Las ideas de la Ilustración prendieron la mecha de una revolución que decapitó a un rey y redefinió los derechos del ciudadano. Este safari recorre desde la Enciclopedia de Diderot hasta la derrota de Napoleón en Waterloo, un arco que transformó para siempre la política, la sociedad y las fronteras de Europa.",
    eventIds: ["enlightenment", "american-independence", "french-revolution", "reign-of-terror", "napoleon-empire", "battle-trafalgar", "invasion-russia", "battle-waterloo"],
    color: "#8B5CF6"
  }
];

export function formatYear(year: number): string {
  if (year < 0) {
    return `${Math.abs(year).toLocaleString()} a.C.`;
  }
  return `${year} d.C.`;
}

export function getEventsInRange(year: number, windowSize = 300, sourceEvents: HistoricalEvent[] = historicalEvents): HistoricalEvent[] {
  return sourceEvents.filter(
    (e) => e.year >= year - windowSize && e.year <= year + windowSize
  );
}
