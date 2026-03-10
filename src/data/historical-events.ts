export interface HistoricalEvent {
  id: string;
  title: string;
  description: string;
  year: number; // negative = BC
  lat: number;
  lng: number;
  region: string;
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
    region: "África"
  },
  {
    id: "sumerian-writing",
    title: "Invención de la escritura cuneiforme",
    description: "Los sumerios de Mesopotamia desarrollan el primer sistema de escritura conocido, usando tablillas de arcilla con marcas en forma de cuña.",
    year: -3000,
    lat: 31.99,
    lng: 45.85,
    region: "Asia"
  },
  {
    id: "stonehenge",
    title: "Construcción de Stonehenge",
    description: "Las poblaciones neolíticas de la isla de Gran Bretaña erigen Stonehenge, un monumento megalítico cuyo propósito astronómico aún se debate.",
    year: -2800,
    lat: 51.18,
    lng: -1.83,
    region: "Europa"
  },
  {
    id: "pyramids-giza",
    title: "Construcción de las Pirámides de Giza",
    description: "El faraón Keops ordena la construcción de la Gran Pirámide de Giza, la más grande de las tres y la única de las Siete Maravillas del Mundo Antiguo que aún existe.",
    year: -2560,
    lat: 29.98,
    lng: 31.13,
    region: "África"
  },
  {
    id: "indus-valley",
    title: "Apogeo de la Civilización del Indo",
    description: "Las ciudades de Mohenjo-Daro y Harappa alcanzan su máximo esplendor, con sistemas de alcantarillado, urbanismo planificado y comercio a larga distancia.",
    year: -2500,
    lat: 27.33,
    lng: 68.14,
    region: "Asia"
  },
  {
    id: "akkadian-empire",
    title: "Imperio Acadio de Sargón",
    description: "Sargón de Acad funda el primer imperio multiétnico de la historia, unificando Mesopotamia bajo un solo gobierno centralizado.",
    year: -2334,
    lat: 33.35,
    lng: 44.41,
    region: "Asia"
  },
  {
    id: "hammurabi-code",
    title: "Código de Hammurabi",
    description: "El rey babilonio Hammurabi promulga uno de los conjuntos de leyes escritas más antiguos del mundo, tallado en una estela de basalto negro.",
    year: -1754,
    lat: 32.54,
    lng: 44.42,
    region: "Asia"
  },
  {
    id: "shang-dynasty",
    title: "Dinastía Shang en China",
    description: "La dinastía Shang consolida su poder en el valle del río Amarillo, desarrollando la escritura china primitiva y la fundición avanzada del bronce.",
    year: -1600,
    lat: 34.75,
    lng: 113.65,
    region: "Asia"
  },
  {
    id: "battle-kadesh",
    title: "Batalla de Qadesh",
    description: "Ramsés II de Egipto y el rey hitita Muwatalli II se enfrentan en la mayor batalla de carros de la Antigüedad, concluida con el primer tratado de paz documentado.",
    year: -1274,
    lat: 34.57,
    lng: 36.52,
    region: "Asia"
  },
  {
    id: "trojan-war",
    title: "Guerra de Troya",
    description: "Según la tradición griega, una coalición de reinos micénicos sitia Troya durante diez años, conflicto inmortalizado en la Ilíada de Homero.",
    year: -1200,
    lat: 39.96,
    lng: 26.24,
    region: "Europa"
  },
  {
    id: "phoenician-alphabet",
    title: "Invención del Alfabeto Fenicio",
    description: "Los fenicios de la costa del Levante desarrollan el primer alfabeto consonántico, antecesor directo de los alfabetos griego, latino y árabe.",
    year: -1050,
    lat: 33.89,
    lng: 35.5,
    region: "Asia"
  },
  {
    id: "founding-rome",
    title: "Fundación Tradicional de Roma",
    description: "Según la leyenda, Rómulo funda la ciudad de Roma en las siete colinas junto al Tíber, iniciando una historia que dominaría el mundo occidental por siglos.",
    year: -753,
    lat: 41.89,
    lng: 12.5,
    region: "Europa"
  },
  {
    id: "assyrian-empire",
    title: "Apogeo del Imperio Asirio",
    description: "Asiria bajo Sargón II y sus sucesores conquista desde Egipto hasta Persia, creando el mayor imperio del mundo hasta entonces con una formidable maquinaria militar.",
    year: -720,
    lat: 36.36,
    lng: 43.15,
    region: "Asia"
  },
  {
    id: "cyrus-persia",
    title: "Fundación del Imperio Aqueménida",
    description: "Ciro el Grande conquista Babilonia y funda el Imperio Persa Aqueménida, el mayor estado del mundo antiguo, proclamando el primer decreto de derechos humanos conocido.",
    year: -550,
    lat: 30.19,
    lng: 53.08,
    region: "Asia"
  },
  {
    id: "athenian-democracy",
    title: "Democracia en Atenas",
    description: "Clístenes establece la democracia directa en Atenas, dando a los ciudadanos el poder de gobernar directamente, un experimento político que inspiraría al mundo moderno.",
    year: -508,
    lat: 37.97,
    lng: 23.73,
    region: "Europa"
  },

  // ── CLASSICAL PERIOD (500 BC – 500 AD) ───────────────────────────────────
  {
    id: "marathon",
    title: "Batalla de Maratón",
    description: "Diez mil soldados atenienses derrotan al ejército persa de Darío I, salvando a Atenas de la conquista y consolidando la democracia griega.",
    year: -490,
    lat: 38.15,
    lng: 24.02,
    region: "Europa"
  },
  {
    id: "confucius-analects",
    title: "Enseñanzas de Confucio",
    description: "El filósofo chino Confucio elabora su sistema ético basado en la virtud, la piedad filial y el orden social, que moldearía la cultura del este asiático por milenios.",
    year: -479,
    lat: 35.6,
    lng: 117.0,
    region: "Asia"
  },
  {
    id: "alexander-conquests",
    title: "Conquistas de Alejandro Magno",
    description: "Alejandro III de Macedonia conquista un vasto territorio desde Grecia hasta la India en solo trece años, difundiendo la cultura helenística por tres continentes.",
    year: -334,
    lat: 37.96,
    lng: 58.3,
    region: "Asia"
  },
  {
    id: "qin-unification",
    title: "Unificación de China por Qin Shi Huang",
    description: "El rey de Qin derrota a los reinos rivales y se convierte en el primer Emperador de China, iniciando la era imperial y comenzando la Gran Muralla.",
    year: -221,
    lat: 34.38,
    lng: 108.93,
    region: "Asia"
  },
  {
    id: "punic-wars",
    title: "Guerras Púnicas — Batalla de Zama",
    description: "Escipión el Africano derrota a Aníbal Barca en Zama, poniendo fin a la Segunda Guerra Púnica y estableciendo a Roma como la potencia dominante del Mediterráneo.",
    year: -202,
    lat: 36.26,
    lng: 9.4,
    region: "África"
  },
  {
    id: "silk-road",
    title: "Apertura de la Ruta de la Seda",
    description: "El emisario chino Zhang Qian establece las primeras rutas comerciales formales hacia Asia Central, conectando China con Persia, Roma y la India.",
    year: -130,
    lat: 39.9,
    lng: 75.0,
    region: "Asia"
  },
  {
    id: "julius-caesar",
    title: "Asesinato de Julio César",
    description: "Julio César es asesinado en el Senado romano por una conspiración de senadores, desencadenando una serie de guerras civiles que transformarían la República en Imperio.",
    year: -44,
    lat: 41.9,
    lng: 12.47,
    region: "Europa"
  },
  {
    id: "birth-christianity",
    title: "Crucifixión de Jesús de Nazaret",
    description: "La crucifixión de Jesús en Jerusalén marca el inicio del movimiento cristiano, que se extendería por el Imperio Romano y eventualmente por el mundo entero.",
    year: 33,
    lat: 31.78,
    lng: 35.21,
    region: "Asia"
  },
  {
    id: "vesuvius",
    title: "Erupción del Vesubio y destrucción de Pompeya",
    description: "La erupción catastrófica del Monte Vesubio entierra bajo cenizas las ciudades romanas de Pompeya y Herculano, preservando instantáneamente la vida cotidiana del siglo I.",
    year: 79,
    lat: 40.82,
    lng: 14.43,
    region: "Europa"
  },
  {
    id: "rome-divided",
    title: "División del Imperio Romano",
    description: "El emperador Teodosio I divide permanentemente el Imperio Romano en dos mitades: el Imperio Romano de Occidente y el Imperio Romano de Oriente (Bizancio).",
    year: 395,
    lat: 41.01,
    lng: 28.97,
    region: "Europa"
  },
  {
    id: "fall-western-rome",
    title: "Caída del Imperio Romano de Occidente",
    description: "El jefe bárbaro Odoacro depone al último emperador romano occidental Rómulo Augústulo, marcando el fin del Imperio Romano y el inicio de la Edad Media en Europa.",
    year: 476,
    lat: 45.45,
    lng: 12.33,
    region: "Europa"
  },

  // ── MIDDLE AGES (500 – 1400) ──────────────────────────────────────────────
  {
    id: "muhammad-hijra",
    title: "La Hégira — Inicio del Islam",
    description: "El profeta Mahoma emigra de La Meca a Medina, evento que marca el inicio del calendario islámico y el comienzo de la expansión rápida de la religión islámica.",
    year: 622,
    lat: 24.47,
    lng: 39.61,
    region: "Asia"
  },
  {
    id: "battle-tours",
    title: "Batalla de Tours / Poitiers",
    description: "Carlos Martel detiene el avance de los ejércitos islámicos hacia el norte de Europa, preservando la cultura cristiana carolingia en Occidente.",
    year: 732,
    lat: 46.71,
    lng: 0.34,
    region: "Europa"
  },
  {
    id: "charlemagne",
    title: "Coronación de Carlomagno",
    description: "El papa León III corona a Carlomagno como Emperador Romano en Navidad, reunificando gran parte de Europa occidental y sentando las bases de las naciones europeas modernas.",
    year: 800,
    lat: 41.9,
    lng: 12.47,
    region: "Europa"
  },
  {
    id: "viking-discovery",
    title: "Los Vikingos llegan a América del Norte",
    description: "Leif Erikson y sus nórdicos establecen el asentamiento de Vinland en Terranova, convirtiéndose en los primeros europeos en pisar el continente americano.",
    year: 1000,
    lat: 51.6,
    lng: -55.6,
    region: "América"
  },
  {
    id: "battle-hastings",
    title: "Batalla de Hastings",
    description: "Guillermo el Conquistador derrota al rey sajón Haroldo II, conquistando Inglaterra y transformando radicalmente la lengua, cultura y arquitectura inglesas.",
    year: 1066,
    lat: 50.91,
    lng: 0.49,
    region: "Europa"
  },
  {
    id: "magna-carta",
    title: "Firma de la Magna Carta",
    description: "El rey Juan Sin Tierra de Inglaterra firma la Carta Magna, el primer documento que limita el poder del monarca y garantiza ciertos derechos a los nobles, antecedente del constitucionalismo.",
    year: 1215,
    lat: 51.44,
    lng: -0.56,
    region: "Europa"
  },
  {
    id: "genghis-khan",
    title: "Imperio Mongol de Gengis Kan",
    description: "Gengis Kan unifica las tribus mongolas y lanza una expansión militar sin precedentes, creando el mayor imperio contiguo de la historia humana.",
    year: 1206,
    lat: 47.9,
    lng: 106.9,
    region: "Asia"
  },
  {
    id: "black-death",
    title: "La Peste Negra en Europa",
    description: "La pandemia de peste bubónica mata entre un tercio y la mitad de la población europea, transformando radicalmente la sociedad, la economía y la mentalidad medieval.",
    year: 1347,
    lat: 43.3,
    lng: 5.37,
    region: "Europa"
  },
  {
    id: "aztec-tenochtitlan",
    title: "Fundación de Tenochtitlán",
    description: "Los mexicas fundan Tenochtitlán en una isla del lago Texcoco, ciudad que crecería hasta ser una de las más grandes del mundo y capital del poderoso Imperio Azteca.",
    year: 1325,
    lat: 19.43,
    lng: -99.13,
    region: "América"
  },
  {
    id: "hundred-years-war",
    title: "Juana de Arco en la Guerra de los Cien Años",
    description: "La joven campesina Juana de Arco lidera al ejército francés al levantamiento del sitio de Orleans, cambiando el curso de la guerra y convirtiéndose en símbolo nacional.",
    year: 1429,
    lat: 47.9,
    lng: 1.9,
    region: "Europa"
  },
  {
    id: "gutenberg-press",
    title: "Imprenta de Gutenberg",
    description: "Johannes Gutenberg inventa la imprenta de tipos móviles en Maguncia, revolucionando la difusión del conocimiento y haciendo posible la Reforma Protestante y el Renacimiento.",
    year: 1450,
    lat: 49.99,
    lng: 8.27,
    region: "Europa"
  },

  // ── EARLY MODERN (1400 – 1700) ────────────────────────────────────────────
  {
    id: "fall-constantinople",
    title: "Caída de Constantinopla",
    description: "El sultán otomano Mehmed II conquista Constantinopla poniendo fin al Imperio Bizantino de mil años, abriendo el camino otomano hacia Europa y cerrando las rutas comerciales terrestres con Asia.",
    year: 1453,
    lat: 41.01,
    lng: 28.97,
    region: "Europa"
  },
  {
    id: "columbus",
    title: "Colón llega a América",
    description: "Cristóbal Colón, financiado por la Corona española, llega a las islas del Caribe el 12 de octubre, iniciando el contacto permanente entre Europa y el continente americano.",
    year: 1492,
    lat: 23.7,
    lng: -75.4,
    region: "América"
  },
  {
    id: "vasco-da-gama",
    title: "Vasco da Gama llega a la India",
    description: "El navegante portugués Vasco da Gama completa la primera ruta marítima directa de Europa a la India rodeando el Cabo de Buena Esperanza, transformando el comercio mundial.",
    year: 1498,
    lat: 11.26,
    lng: 75.78,
    region: "Asia"
  },
  {
    id: "reformation-luther",
    title: "Reforma Protestante de Lutero",
    description: "Martín Lutero publica sus 95 Tesis en Wittenberg, cuestionando las prácticas de la Iglesia Católica y desencadenando la Reforma Protestante que dividiría al cristianismo occidental.",
    year: 1517,
    lat: 51.86,
    lng: 12.64,
    region: "Europa"
  },
  {
    id: "magellan-circumnavigation",
    title: "Primera Circunnavegación del Globo",
    description: "La expedición de Fernando de Magallanes y Juan Sebastián Elcano completa la primera vuelta al mundo, demostrando definitivamente que la Tierra es redonda.",
    year: 1522,
    lat: -10.0,
    lng: -80.0,
    region: "América"
  },
  {
    id: "spanish-conquest-aztec",
    title: "Conquista Española del Imperio Azteca",
    description: "Hernán Cortés y sus aliados tlaxcaltecas conquistan Tenochtitlán, poniendo fin al Imperio Azteca e iniciando el dominio colonial español en Mesoamérica.",
    year: 1521,
    lat: 19.43,
    lng: -99.13,
    region: "América"
  },
  {
    id: "copernicus",
    title: "Revolución Copernicana",
    description: "Nicolás Copérnico publica 'De revolutionibus', proponiendo que la Tierra y los planetas giran alrededor del Sol, iniciando la revolución científica que transformaría la visión del cosmos.",
    year: 1543,
    lat: 53.77,
    lng: 20.48,
    region: "Europa"
  },
  {
    id: "ottoman-suleiman",
    title: "Apogeo del Imperio Otomano bajo Solimán",
    description: "Solimán el Magnífico lleva al Imperio Otomano a su máximo esplendor, controlando territorios desde Hungría hasta Persia y desde el Cáucaso hasta el norte de África.",
    year: 1550,
    lat: 41.01,
    lng: 28.97,
    region: "Europa"
  },
  {
    id: "armada-invencible",
    title: "Derrota de la Armada Invencible",
    description: "La flota española de Felipe II es derrotada por los ingleses y destruida por tormentas, marcando el inicio del declive del Imperio Español y el ascenso del poder naval inglés.",
    year: 1588,
    lat: 54.0,
    lng: -5.0,
    region: "Europa"
  },
  {
    id: "galileo",
    title: "Galileo y el Telescopio Astronómico",
    description: "Galileo Galilei mejora el telescopio y lo apunta al cielo, descubriendo los satélites de Júpiter y confirmando el heliocentrismo copernicano, entrando en conflicto con la Inquisición.",
    year: 1610,
    lat: 45.41,
    lng: 11.88,
    region: "Europa"
  },
  {
    id: "mayflower",
    title: "Llegada del Mayflower a América del Norte",
    description: "Los 'Padres Peregrinos' a bordo del Mayflower establecen la colonia de Plymouth en Massachusetts, iniciando la colonización puritana inglesa de Nueva Inglaterra.",
    year: 1620,
    lat: 41.96,
    lng: -70.67,
    region: "América"
  },

  // ── MODERN ERA (1700 – 1900) ───────────────────────────────────────────────
  {
    id: "newton-principia",
    title: "Principia Mathematica de Newton",
    description: "Isaac Newton publica su obra maestra en la que formula las leyes del movimiento y la gravitación universal, consolidando la física clásica y la revolución científica.",
    year: 1687,
    lat: 52.2,
    lng: 0.12,
    region: "Europa"
  },
  {
    id: "american-independence",
    title: "Declaración de Independencia de EE.UU.",
    description: "Las trece colonias norteamericanas declaran su independencia del Imperio Británico, creando los Estados Unidos de América y difundiendo los ideales ilustrados de libertad e igualdad.",
    year: 1776,
    lat: 39.95,
    lng: -75.17,
    region: "América"
  },
  {
    id: "french-revolution",
    title: "Revolución Francesa",
    description: "La Toma de la Bastilla desencadena la Revolución Francesa, que abolirá la monarquía absolutista, decapitará al rey y difundirá los ideales de libertad, igualdad y fraternidad por Europa.",
    year: 1789,
    lat: 48.85,
    lng: 2.37,
    region: "Europa"
  },
  {
    id: "haitian-revolution",
    title: "Revolución Haitiana",
    description: "Los esclavos de Saint-Domingue se rebelan liderados por Toussaint Louverture, fundando Haití como la primera república negra libre del mundo en 1804.",
    year: 1791,
    lat: 19.43,
    lng: -72.33,
    region: "América"
  },
  {
    id: "napoleon-empire",
    title: "Napoleon Bonaparte — Emperador de los Franceses",
    description: "Napoleón se corona Emperador en Notre Dame, iniciando el período napoleónico que redibujará el mapa de Europa y difundirá el Código Civil por el mundo.",
    year: 1804,
    lat: 48.85,
    lng: 2.35,
    region: "Europa"
  },
  {
    id: "latin-american-independence",
    title: "Independencias de América Latina",
    description: "Las guerras de independencia lideradas por Simón Bolívar, San Martín y otros libertadores transforman las colonias españolas en repúblicas independientes a lo largo de Sudamérica.",
    year: 1819,
    lat: 4.71,
    lng: -74.07,
    region: "América"
  },
  {
    id: "industrial-revolution",
    title: "Revolución Industrial en Gran Bretaña",
    description: "La mecanización de la producción con la máquina de vapor transforma radicalmente la economía, la sociedad y el medio ambiente, iniciando la era industrial moderna.",
    year: 1830,
    lat: 52.48,
    lng: -1.9,
    region: "Europa"
  },
  {
    id: "darwin-origin",
    title: "El Origen de las Especies de Darwin",
    description: "Charles Darwin publica su teoría de la evolución por selección natural, revolucionando la biología y la comprensión humana de la vida en la Tierra.",
    year: 1859,
    lat: 51.5,
    lng: -0.12,
    region: "Europa"
  },
  {
    id: "us-civil-war",
    title: "Guerra Civil Estadounidense y Abolición de la Esclavitud",
    description: "La Unión derrota a los Estados Confederados, Lincoln promulga la Proclama de Emancipación y la esclavitud es abolida en los Estados Unidos.",
    year: 1865,
    lat: 38.9,
    lng: -77.04,
    region: "América"
  },
  {
    id: "meiji-restoration",
    title: "Restauración Meiji en Japón",
    description: "El joven emperador Meiji inicia la modernización acelerada de Japón, adoptando tecnología y estructuras occidentales para transformar al país en una potencia mundial en pocas décadas.",
    year: 1868,
    lat: 35.69,
    lng: 139.69,
    region: "Asia"
  },
  {
    id: "suez-canal",
    title: "Inauguración del Canal de Suez",
    description: "El Canal de Suez conecta el Mar Mediterráneo con el Mar Rojo, reduciendo drásticamente las rutas marítimas entre Europa y Asia y transformando el comercio global.",
    year: 1869,
    lat: 30.7,
    lng: 32.34,
    region: "África"
  },
  {
    id: "scramble-africa",
    title: "Conferencia de Berlín — Reparto de África",
    description: "Las potencias europeas se reúnen para repartirse formalmente el continente africano, estableciendo las fronteras coloniales que en su mayoría persisten hoy.",
    year: 1884,
    lat: 52.52,
    lng: 13.4,
    region: "Europa"
  },

  // ── 20TH CENTURY ──────────────────────────────────────────────────────────
  {
    id: "wright-brothers",
    title: "Primer Vuelo de los Hermanos Wright",
    description: "Orville Wright realiza el primer vuelo motorizado controlado de la historia en Kitty Hawk, Carolina del Norte, cubriendo 36 metros en 12 segundos y abriendo la era de la aviación.",
    year: 1903,
    lat: 36.02,
    lng: -75.67,
    region: "América"
  },
  {
    id: "ww1",
    title: "Inicio de la Primera Guerra Mundial",
    description: "El asesinato del Archiduque Francisco Fernando en Sarajevo desencadena la Gran Guerra, el primer conflicto de escala industrial que causó 20 millones de muertes.",
    year: 1914,
    lat: 43.85,
    lng: 18.42,
    region: "Europa"
  },
  {
    id: "russian-revolution",
    title: "Revolución Rusa de Octubre",
    description: "Los bolcheviques liderados por Lenin toman el poder en Petrogrado, derrocando al gobierno provisional e iniciando el primer estado comunista del mundo.",
    year: 1917,
    lat: 59.94,
    lng: 30.32,
    region: "Europa"
  },
  {
    id: "spanish-flu",
    title: "Pandemia de Gripe Española",
    description: "La pandemia de influenza H1N1 infecta a un tercio de la población mundial y mata entre 50 y 100 millones de personas, siendo la pandemia más mortífera de la era moderna.",
    year: 1918,
    lat: 48.85,
    lng: 2.35,
    region: "Europa"
  },
  {
    id: "ww2-start",
    title: "Inicio de la Segunda Guerra Mundial",
    description: "La Alemania Nazi invade Polonia, desencadenando el conflicto más destructivo de la historia humana con más de 70 millones de muertos y el Holocausto.",
    year: 1939,
    lat: 52.23,
    lng: 21.01,
    region: "Europa"
  },
  {
    id: "hiroshima",
    title: "Bombardeo Atómico de Hiroshima",
    description: "EE.UU. lanza la primera bomba atómica usada en guerra sobre Hiroshima, matando a 80.000 personas al instante y acelerando la rendición japonesa y el fin de la Segunda Guerra Mundial.",
    year: 1945,
    lat: 34.39,
    lng: 132.45,
    region: "Asia"
  },
  {
    id: "un-founded",
    title: "Fundación de las Naciones Unidas",
    description: "Cincuenta y un naciones firman la Carta de las Naciones Unidas en San Francisco, creando el organismo internacional destinado a mantener la paz y seguridad mundiales.",
    year: 1945,
    lat: 37.79,
    lng: -122.41,
    region: "América"
  },
  {
    id: "india-independence",
    title: "Independencia de la India",
    description: "Tras la lucha no violenta de Mahatma Gandhi, la India obtiene su independencia del Imperio Británico, aunque la partición con Pakistán causa millones de desplazados.",
    year: 1947,
    lat: 28.61,
    lng: 77.21,
    region: "Asia"
  },
  {
    id: "israel-founded",
    title: "Fundación del Estado de Israel",
    description: "David Ben-Gurión proclama el Estado de Israel en Tierra Santa, dando fin al mandato británico de Palestina e iniciando el conflicto árabe-israelí que persiste hasta hoy.",
    year: 1948,
    lat: 32.08,
    lng: 34.78,
    region: "Asia"
  },
  {
    id: "dna-discovery",
    title: "Descubrimiento de la Estructura del ADN",
    description: "Watson, Crick, Franklin y Wilkins revelan la estructura de doble hélice del ADN, inaugurando la era de la biología molecular y la medicina genómica.",
    year: 1953,
    lat: 52.2,
    lng: 0.12,
    region: "Europa"
  },
  {
    id: "sputnik",
    title: "Lanzamiento del Sputnik — Era Espacial",
    description: "La URSS lanza el Sputnik 1, el primer satélite artificial de la historia, inaugurando la era espacial y desencadenando la carrera espacial entre EE.UU. y la URSS.",
    year: 1957,
    lat: 45.92,
    lng: 63.34,
    region: "Asia"
  },
  {
    id: "cuban-missile-crisis",
    title: "Crisis de los Misiles de Cuba",
    description: "El descubrimiento de misiles soviéticos en Cuba lleva a EE.UU. y la URSS al borde de una guerra nuclear, el momento más peligroso de la Guerra Fría.",
    year: 1962,
    lat: 22.5,
    lng: -79.5,
    region: "América"
  },
  {
    id: "moon-landing",
    title: "Llegada del Hombre a la Luna",
    description: "Neil Armstrong y Buzz Aldrin se convierten en los primeros seres humanos en pisar la Luna durante la misión Apolo 11, en uno de los mayores logros tecnológicos de la humanidad.",
    year: 1969,
    lat: 0.68,
    lng: 23.47,
    region: "Espacio"
  },
  {
    id: "internet-arpanet",
    title: "Primera Conexión ARPANET — Inicio de Internet",
    description: "Se transmite el primer mensaje entre computadoras de UCLA y Stanford a través de ARPANET, la red precursora de Internet que transformaría para siempre la comunicación humana.",
    year: 1969,
    lat: 34.07,
    lng: -118.44,
    region: "América"
  },
  {
    id: "fall-berlin-wall",
    title: "Caída del Muro de Berlín",
    description: "Los alemanes del Este cruzan el Muro de Berlín libremente por primera vez en 28 años, iniciando la reunificación alemana y marcando el fin simbólico de la Guerra Fría.",
    year: 1989,
    lat: 52.51,
    lng: 13.38,
    region: "Europa"
  },
  {
    id: "ussr-dissolution",
    title: "Disolución de la Unión Soviética",
    description: "Mijail Gorbachov dimite como presidente de la URSS, declarando oficialmente la disolución del estado soviético y el fin de la Guerra Fría, liberando a 15 nuevas naciones.",
    year: 1991,
    lat: 55.75,
    lng: 37.62,
    region: "Europa"
  },
  {
    id: "south-africa-apartheid",
    title: "Fin del Apartheid — Mandela Presidente",
    description: "Nelson Mandela gana las primeras elecciones democráticas en Sudáfrica tras 27 años en prisión, poniendo fin al apartheid y comenzando la reconciliación nacional.",
    year: 1994,
    lat: -25.74,
    lng: 28.19,
    region: "África"
  },
  {
    id: "www-invented",
    title: "Nacimiento de la World Wide Web",
    description: "Tim Berners-Lee lanza la primera página web del mundo en el CERN, haciendo pública la World Wide Web y transformando radicalmente la comunicación, el comercio y la cultura global.",
    year: 1991,
    lat: 46.23,
    lng: 6.05,
    region: "Europa"
  },
  {
    id: "9-11",
    title: "Ataques del 11 de Septiembre",
    description: "Los ataques terroristas de Al-Qaeda contra las Torres Gemelas de Nueva York y el Pentágono causan casi 3.000 muertes y desencadenan la 'Guerra contra el Terror' que redefine la geopolítica global.",
    year: 2001,
    lat: 40.71,
    lng: -74.01,
    region: "América"
  },
  {
    id: "iphone-launch",
    title: "Steve Jobs presenta el iPhone",
    description: "Apple presenta el primer iPhone en San Francisco, inaugurando la era del smartphone y transformando radicalmente la forma en que 3.000 millones de personas interactúan con el mundo digital.",
    year: 2007,
    lat: 37.78,
    lng: -122.4,
    region: "América"
  },
  {
    id: "global-financial-crisis",
    title: "Crisis Financiera Global",
    description: "El colapso del banco Lehman Brothers desencadena la mayor crisis financiera desde 1929, causando una recesión global que afecta a millones de personas en todo el mundo.",
    year: 2008,
    lat: 40.71,
    lng: -74.01,
    region: "América"
  },
  {
    id: "arab-spring",
    title: "Primavera Árabe",
    description: "Una ola de revoluciones populares recorre el mundo árabe comenzando en Túnez, derrocando dictaduras en Egipto, Libia y Yemen, e iniciando una guerra civil en Siria.",
    year: 2011,
    lat: 33.88,
    lng: 9.54,
    region: "África"
  },
  {
    id: "paris-agreement",
    title: "Acuerdo de París sobre Cambio Climático",
    description: "196 naciones firman el Acuerdo de París comprometiéndose a limitar el calentamiento global a 1.5°C, el mayor esfuerzo diplomático coordinado frente a la crisis climática.",
    year: 2015,
    lat: 48.85,
    lng: 2.35,
    region: "Europa"
  },
  {
    id: "covid-pandemic",
    title: "Pandemia de COVID-19",
    description: "La OMS declara pandemia mundial por el coronavirus SARS-CoV-2, que causará más de 7 millones de muertes confirmadas, paralizará la economía global y acelerará la transformación digital.",
    year: 2020,
    lat: 30.59,
    lng: 114.3,
    region: "Asia"
  },
  {
    id: "ukraine-war",
    title: "Invasión Rusa de Ucrania",
    description: "Rusia invade a gran escala Ucrania, desencadenando la mayor guerra en Europa desde 1945, causando millones de desplazados y reordenando las alianzas geopolíticas globales.",
    year: 2022,
    lat: 50.45,
    lng: 30.52,
    region: "Europa"
  },
  {
    id: "chatgpt-launch",
    title: "Lanzamiento de ChatGPT — Era de la IA Generativa",
    description: "OpenAI lanza ChatGPT al público general, alcanzando 100 millones de usuarios en dos meses y desencadenando la carrera global por la inteligencia artificial generativa.",
    year: 2022,
    lat: 37.79,
    lng: -122.39,
    region: "América"
  },
  {
    id: "ai-era-2024",
    title: "Explosión de la Inteligencia Artificial",
    description: "Los modelos de IA superan a los humanos en múltiples tareas cognitivas, transformando industrias enteras desde la medicina hasta el arte, mientras el mundo debate su regulación ética.",
    year: 2024,
    lat: 37.79,
    lng: -122.39,
    region: "América"
  }
];

export function formatYear(year: number): string {
  if (year < 0) {
    return `${Math.abs(year).toLocaleString()} a.C.`;
  }
  return `${year} d.C.`;
}

export function getEventsInRange(year: number, windowSize = 300): HistoricalEvent[] {
  return historicalEvents.filter(
    (e) => e.year >= year - windowSize && e.year <= year + windowSize
  );
}
