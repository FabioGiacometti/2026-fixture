const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/data/historical-events.ts');
let content = fs.readFileSync(filePath, 'utf8');

if (!content.includes('importance: number;')) {
  content = content.replace(
    'region: string;',
    'region: string;\n  importance: number; // 1: Global/Major, 2: Continental, 3: Regional/Local'
  );
}

content = content.replace(/(region:\s*".*?")(?=\s*\})/g, (match, p1) => {
  return `${p1},\n    importance: 1`;
});

const newEvents = `
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
  }
];
`;

content = content.replace(/\s*\];\s*$/, ',\n' + newEvents.trim());
fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated historical-events.ts');
