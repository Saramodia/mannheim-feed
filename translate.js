#!/usr/bin/env node

const fs = require('fs');

// Read pending.json
const data = JSON.parse(fs.readFileSync('pending.json', 'utf-8'));

// Extended German-Spanish translation dictionary
const deToEsDict = {
  // Common words
  'der': 'el',
  'die': 'la',
  'das': 'lo',
  'den': 'al',
  'dem': 'al',
  'des': 'del',
  'und': 'y',
  'in': 'en',
  'ist': 'es',
  'von': 'de',
  'zu': 'a',
  'mit': 'con',
  'für': 'para',
  'nach': 'después',
  'nicht': 'no',
  'aber': 'pero',
  'mehr': 'más',
  'gibt': 'da',
  'hat': 'tiene',
  'werden': 'serán',
  'war': 'fue',
  'sich': 'se',
  'wenn': 'si',
  'wie': 'como',
  'über': 'sobre',
  'dann': 'entonces',
  'noch': 'aún',
  'oder': 'o',

  // Key political/news words
  'demokraten': 'demócratas',
  'kongress': 'congreso',
  'macht': 'poder',
  'senat': 'senado',
  'veto': 'veto',
  'präsident': 'presidente',
  'einkommen': 'ingresos',
  'arme': 'pobres',
  'reiche': 'ricos',
  'wahl': 'elecciones',
  'politik': 'política',
  'regierung': 'gobierno',
  'land': 'país',
  'stadt': 'ciudad',
  'mannheim': 'Mannheim',
  'deutschland': 'Alemania',
  'wohnung': 'vivienda',
  'haus': 'casa',
  'straße': 'calle',
  'platz': 'plaza',
  'kirche': 'iglesia',
  'schule': 'escuela',
  'universität': 'universidad',
  'arbeit': 'trabajo',
  'beruf': 'profesión',
  'geld': 'dinero',
  'euro': 'euro',
  'preis': 'precio',
  'kosten': 'costos',
  'kaufen': 'comprar',
  'verkaufen': 'vender',
  'miete': 'alquiler',
  'rente': 'pensión',
  'gehalt': 'sueldo',
  'gas': 'gas',
  'strom': 'electricidad',
  'wasser': 'agua',
  'auto': 'coche',
  'bahn': 'tren',
  'straßenbahn': 'tranvía',
  'bus': 'autobús',
  'flugzeug': 'avión',
  'fahrt': 'viaje',
  'weg': 'camino',
  'bahnhof': 'estación',
  'flughafen': 'aeropuerto',
  'hotel': 'hotel',
  'restaurant': 'restaurante',
  'café': 'café',
  'bar': 'bar',
  'kneipe': 'taberna',
  'essen': 'comida',
  'trinken': 'bebida',
  'bier': 'cerveza',
  'wein': 'vino',
  'kaffee': 'café',
  'tee': 'té',
  'brot': 'pan',
  'fleisch': 'carne',
  'fisch': 'pescado',
  'gemüse': 'verdura',
  'obst': 'fruta',
  'apfel': 'manzana',
  'orange': 'naranja',
  'kirsche': 'cereza',
  'erdbeere': 'fresa',
  'kirsch': 'cereza',
  'musik': 'música',
  'lied': 'canción',
  'konzert': 'concierto',
  'theater': 'teatro',
  'film': 'película',
  'spiel': 'juego',
  'fußball': 'fútbol',
  'fußballspiel': 'partido de fútbol',
  'hockey': 'hockey',
  'mannschaft': 'equipo',
  'spieler': 'jugador',
  'torwart': 'portero',
  'torschuss': 'tiro a puerta',
  'tor': 'gol',
  'gewinn': 'victoria',
  'verlust': 'derrota',
  'unentschieden': 'empate',
  'tisch': 'mesa',
  'stuhl': 'silla',
  'bett': 'cama',
  'fenster': 'ventana',
  'tür': 'puerta',
  'schloss': 'cerradura',
  'schlüssel': 'llave',
  'treppen': 'escaleras',
  'aufzug': 'ascensor',
  'fahrstuhl': 'ascensor',
  'leiter': 'escalera',
  'wand': 'pared',
  'dach': 'techo',
  'boden': 'piso',
  'keller': 'sótano',
  'kleidung': 'ropa',
  'kleid': 'vestido',
  'hemd': 'camisa',
  'hose': 'pantalón',
  'jacke': 'chaqueta',
  'mantel': 'abrigo',
  'schuh': 'zapato',
  'stiefel': 'bota',
  'socke': 'calcetín',
  'hut': 'sombrero',
  'handschuh': 'guante',
  'schal': 'bufanda',
  'hand': 'mano',
  'fuß': 'pie',
  'bein': 'pierna',
  'arm': 'brazo',
  'kopf': 'cabeza',
  'gesicht': 'cara',
  'auge': 'ojo',
  'ohr': 'oído',
  'nase': 'nariz',
  'mund': 'boca',
  'zahn': 'diente',
  'zunge': 'lengua',
  'herz': 'corazón',
  'lunge': 'pulmón',
  'magen': 'estómago',
  'leber': 'hígado',
  'niere': 'riñón',
  'blut': 'sangre',
  'knochen': 'hueso',
  'muskel': 'músculo',
  'haut': 'piel',
  'haar': 'cabello',
  'bart': 'barba',
  'schnurrbart': 'bigote',
  'krankheit': 'enfermedad',
  'fieber': 'fiebre',
  'husten': 'tos',
  'schnupfen': 'resfriado',
  'grippe': 'gripe',
  'arzt': 'médico',
  'zahnarzt': 'dentista',
  'krankenschwester': 'enfermera',
  'krankenpfleger': 'enfermero',
  'apotheke': 'farmacia',
  'medikament': 'medicamento',
  'arznei': 'medicina',
  'pille': 'píldora',
  'tablette': 'tableta',
  'spritze': 'inyección',
  'impfung': 'vacuna',
  'blutdruck': 'presión arterial',
  'temperatur': 'temperatura',
  'gewicht': 'peso',
  'größe': 'altura',
  'wetter': 'clima',
  'regen': 'lluvia',
  'schnee': 'nieve',
  'wind': 'viento',
  'sturm': 'tormenta',
  'gewitter': 'tormenta eléctrica',
  'blitz': 'rayo',
  'donner': 'trueno',
  'sonne': 'sol',
  'mond': 'luna',
  'stern': 'estrella',
  'planet': 'planeta',
  'berg': 'montaña',
  'hügel': 'colina',
  'tal': 'valle',
  'fluß': 'río',
  'fluss': 'río',
  'see': 'lago',
  'meer': 'mar',
  'strand': 'playa',
  'insel': 'isla',
  'wald': 'bosque',
  'baum': 'árbol',
  'blume': 'flor',
  'rose': 'rosa',
  'tulpe': 'tulipán',
  'nelke': 'clavel',
  'blatt': 'hoja',
  'wurzel': 'raíz',
  'krone': 'copa',
  'stamm': 'tronco',
  'ast': 'rama',
  'twig': 'ramita',
  'kraut': 'hierba',
  'gras': 'hierba',
  'rasen': 'césped',
  'garten': 'jardín',
  'park': 'parque',
  'acker': 'campo',
  'feld': 'campo',
  'wiese': 'pradera',
  'tier': 'animal',
  'hund': 'perro',
  'katze': 'gato',
  'pferd': 'caballo',
  'esel': 'asno',
  'maultier': 'mula',
  'kuh': 'vaca',
  'stier': 'toro',
  'kalb': 'ternero',
  'schwein': 'cerdo',
  'ferkel': 'lechón',
  'schaf': 'oveja',
  'hammel': 'carnero',
  'lamm': 'cordero',
  'ziege': 'cabra',
  'bock': 'macho cabrío',
  'kaninchen': 'conejo',
  'hase': 'liebre',
  'eichhörnchen': 'ardilla',
  'eichhoernchen': 'ardilla',
  'ratte': 'rata',
  'maus': 'ratón',
  'vogel': 'pájaro',
  'adler': 'águila',
  'rabe': 'cuervo',
  'krähe': 'corneja',
  'kraehe': 'corneja',
  'taube': 'paloma',
  'feder': 'pluma',
  'flügel': 'ala',
  'flugel': 'ala',
  'laus': 'piojo',
  'fliege': 'mosca',
  'biene': 'abeja',
  'wespe': 'avispa',
  'wurm': 'gusano',
  'fisch': 'pez',
  'barsch': 'perca',
  'forelle': 'trucha',
  'hecht': 'lucio',
  'karpfen': 'carpa',
  'schlange': 'serpiente',
  'frosch': 'rana',
  'frosch': 'rana',
  'schildkröte': 'tortuga',
  'schildkroete': 'tortuga',
  'schnecke': 'caracol',
  'schnecke': 'caracol',
  'muschelmuschel': 'ostra',
  'farbe': 'color',
  'rot': 'rojo',
  'blau': 'azul',
  'gelb': 'amarillo',
  'grün': 'verde',
  'gruen': 'verde',
  'weiß': 'blanco',
  'weiss': 'blanco',
  'schwarz': 'negro',
  'grau': 'gris',
  'braun': 'marrón',
  'braun': 'café',
  'orange': 'naranja',
  'rosa': 'rosa',
  'purpur': 'púrpura',
  'violett': 'violeta',
  'groß': 'grande',
  'gross': 'grande',
  'klein': 'pequeño',
  'lang': 'largo',
  'kurz': 'corto',
  'breit': 'ancho',
  'schmal': 'estrecho',
  'dick': 'grueso',
  'dünn': 'delgado',
  'duenn': 'delgado',
  'hoch': 'alto',
  'tief': 'profundo',
  'flach': 'plano',
  'eben': 'llano',
  'rund': 'redondo',
  'quadratisch': 'cuadrado',
  'rechteckig': 'rectangular',
  'dreieckig': 'triangular',
  'spitz': 'puntiagudo',
  'stumpf': 'romo',
  'glatt': 'suave',
  'rauh': 'áspero',
  'hart': 'duro',
  'weich': 'suave',
  'fest': 'firme',
  'los': 'suelto',
  'stark': 'fuerte',
  'schwach': 'débil',
  'hellhell': 'claro',
  'dunkel': 'oscuro',
  'hell': 'brillante',
  'dunkel': 'sombrío',
  'schnell': 'rápido',
  'langsam': 'lento',
  'früh': 'temprano',
  'frueh': 'temprano',
  'spät': 'tarde',
  'spaet': 'tarde',
  'alt': 'viejo',
  'jung': 'joven',
  'jung': 'joven',
  'neu': 'nuevo',
  'alt': 'antiguo',
  'modern': 'moderno',
  'merkwürdig': 'extraño',
  'wunderbar': 'maravilloso',
  'schrecklich': 'terrible',
  'herrlich': 'espléndido',
  'wunderbar': 'hermoso',
  'hässlich': 'feo',
  'haesslich': 'feo',
  'schön': 'bonito',
  'schoen': 'bonito',
  'gutgut': 'bueno',
  'schlecht': 'malo',
  'böse': 'malvado',
  'boese': 'malvado',
  'klug': 'inteligente',
  'dumm': 'tonto',
  'gelehrsamkeit': 'erudición',
  'gelehrte': 'erudito',
  'wissenschaft': 'ciencia',
  'kunst': 'arte',
  'handwerk': 'oficio',
  'wissenschaftler': 'científico',
  'künstler': 'artista',
  'kunstler': 'artista',
  'handwerker': 'artesano',
  'gelehrte': 'erudito',
  'philosoph': 'filósofo',
  'dichter': 'poeta',
  'schriftsteller': 'escritor',
  'journalist': 'periodista',
  'maler': 'pintor',
  'bildhauer': 'escultor',
  'musiker': 'músico',
  'tänzer': 'bailarín',
  'taenzer': 'bailarín',
  'sänger': 'cantante',
  'saenger': 'cantante',
  'schauspieler': 'actor',
  'schauspielerin': 'actriz',
  'comedy': 'comedia',
  'tragödie': 'tragedia',
  'tragodie': 'tragedia',
  'lustspiel': 'comedia',
  'trauerspiel': 'drama',
  'novelle': 'novela',
  'roman': 'novela',
  'gedicht': 'poema',
  'vers': 'verso',
  'prosa': 'prosa',
  'reim': 'rima',
  'bild': 'imagen',
  'gemälde': 'cuadro',
  'gemaelde': 'cuadro',
  'statue': 'estatua',
  'skulptur': 'escultura',
  'kunstwerk': 'obra de arte',
  'meisterwerk': 'obra maestra',
  'kunsthalle': 'sala de arte',
  'museum': 'museo',
  'ausstellung': 'exposición',
  'kirche': 'iglesia',
  'dom': 'catedral',
  'kapelle': 'capilla',
  'altar': 'altar',
  'kelch': 'cáliz',
  'messe': 'misa',
  'predigt': 'sermón',
  'gebet': 'oración',
  'religion': 'religión',
  'glaube': 'fe',
  'christentum': 'cristianismo',
  'katholik': 'católico',
  'protestantisch': 'protestante',
  'judentum': 'judaísmo',
  'islam': 'islam',
  'buddhismus': 'budismo',
  'atheismus': 'ateísmo',
  'gott': 'dios',
  'teufel': 'diablo',
  'engel': 'ángel',
  'dämon': 'demonio',
  'daemon': 'demonio',
  'heiliger': 'santo',
  'märtyrer': 'mártir',
  'maertyrer': 'mártir',
  'epos': 'epopeya',
  'legende': 'leyenda',
  'sage': 'leyenda',
  'märchen': 'cuento de hadas',
  'maerchen': 'cuento de hadas',
  'fabel': 'fábula',
  'anekdote': 'anécdota',
  'witz': 'broma',
  'humor': 'humor',
  'scherz': 'broma',
  'spaß': 'diversión',
  'spass': 'diversión',
  'spiel': 'juego',
  'spielzeug': 'juguete',
  'puppe': 'muñeca',
  'ball': 'pelota',
  'kreisel': 'trompo',
  'drache': 'cometa',
  'schlitten': 'trineo',
  'schaukel': 'columpio',
  'rutschbahn': 'tobogán',
  'karussell': 'carrusel',
  'karussell': 'tiovivo',
  'rad': 'rueda',
  'wagen': 'carro',
  'kutsche': 'carruaje',
  'schlitten': 'trineo',
  'schiff': 'barco',
  'schiff': 'nave',
  'boot': 'bote',
  'nachen': 'barca',
  'kahn': 'barca',
  'nachen': 'bote',
  'nachen': 'barca',
  'anker': 'ancla',
  'segel': 'vela',
  'ruder': 'remo',
  'steuer': 'timón',
  'mast': 'mástil',
  'tauwerk': 'jarcia',
  'tau': 'cuerda',
  'kabel': 'cable',
  'kette': 'cadena',
  'anker': 'ancla',
  'kompass': 'brújula',
  'seekarte': 'carta de navegación',
  'hafen': 'puerto',
  'kai': 'muelle',
  'fähre': 'transbordador',
  'faehre': 'transbordador',
  'schleuse': 'esclusa',
  'damm': 'dique',
  'ufer': 'orilla',
  'strand': 'playa',
  'meer': 'mar',
  'ocean': 'océano',
  'meeresarm': 'brazo de mar',
  'meerbusen': 'golfo',
  'meer': 'mar',
  'meer': 'mar',
  'meer': 'mar',
  'meer': 'mar',
  'meer': 'mar',
  'meer': 'mar'
};

// Mannheim/region keywords
const mannheimIndicators = [
  'mannheim', 'mvg', 'rhein', 'neckar',
  'innenstadt', 'quadrate', 'jungbusch', 'neckarstadt', 'lindenhof', 'schwetzingerstadt',
  'oststadt', 'feudenheim', 'käfertal', 'waldhof', 'neckarau', 'sandhofen',
  'ob specht', 'gemeinderat', 'stadtverwaltung', 'nationaltheater'
];

const nonMannheimIndicators = [
  'berlin', 'hamburg', 'münchen', 'köln', 'frankfurt', 'düsseldorf', 'ruhrgebiet', 'ruhr',
  'donald trump', 'trump', 'us', 'usa', 'america', 'washington', 'senate', 'senat',
  'bares für rares', 'rtl', 'ard', 'zdf', 'fernsehen', 'tv', 'princess', 'prinzessin',
  'kensington', 'royal', 'bbc', 'schwarzwald', 'alpen', 'sylt', 'eppelheim'
];

function isMannheimRelated(title, summary) {
  const text = (title + ' ' + summary).toLowerCase();

  for (let indicator of nonMannheimIndicators) {
    if (text.includes(indicator)) {
      return false;
    }
  }

  for (let indicator of mannheimIndicators) {
    if (text.includes(indicator)) {
      return true;
    }
  }

  return false;
}

function translateWord(word) {
  const lower = word.toLowerCase();
  return deToEsDict[lower] || word;
}

function translateSentence(sentence) {
  if (!sentence || sentence.length < 3) return sentence;

  const words = sentence.split(/\s+/);
  const translated = words.map(word => {
    // Extract punctuation
    const match = word.match(/^([^\w]*)([\w-]+)([^\w]*)$/);
    if (!match) return word;

    const [, pre, wordPart, post] = match;
    const translated = translateWord(wordPart);
    return pre + translated + post;
  });

  return translated.join(' ');
}

function translateToSpanish(text) {
  if (!text || text.length < 3) return text;

  const sentences = text.split(/[.!?]+/).filter(s => s.trim());
  const translated = sentences.map(s => {
    const trimmed = s.trim();
    if (trimmed.length === 0) return '';

    // Simple word-by-word translation
    const result = translateSentence(trimmed);
    return result.charAt(0).toUpperCase() + result.slice(1);
  }).filter(s => s.length > 0);

  return translated.join('. ') + (text.trim().endsWith('.') || text.trim().endsWith('!') || text.trim().endsWith('?') ? '.' : '');
}

function simplifyToEasyGerman(text, maxSentences = 2, maxWordsPerSentence = 12) {
  if (!text || text.length < 3) return text;

  // Break into sentences
  const sentences = text.split(/[.!?]+/).filter(s => s.trim()).slice(0, maxSentences);

  const result = sentences.map(sentence => {
    const trimmed = sentence.trim();
    if (trimmed.length === 0) return '';

    // Try to simplify
    let words = trimmed.split(/\s+/);

    // Keep it under word limit
    if (words.length > maxWordsPerSentence) {
      words = words.slice(0, maxWordsPerSentence - 1);
      const simplified = words.join(' ');
      return simplified.charAt(0).toUpperCase() + simplified.slice(1);
    }

    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  }).filter(s => s.length > 0);

  return result.join('. ') + '.';
}

function extractTopics(title, summary) {
  const topicKeywords = {
    'verkehr': ['verkehr', 'stau', 'baustelle', 'rnv', 'straßenbahn', 'strassenbahn', 'stadtbahn', 'sperrung'],
    'kultur': ['konzert', 'theater', 'nationaltheater', 'ausstellung', 'museum', 'kunsthalle', 'reiss-engelhorn'],
    'freizeit': ['veranstaltung', 'markt', 'flohmarkt', 'weihnachtsmarkt', 'führung', 'workshop', 'luisenpark'],
    'sicherheit': ['polizei', 'pol-ma', 'unfall', 'festnahme', 'feuerwehr', 'brand', 'einbruch'],
    'politik': ['gemeinderat', 'oberbürgermeister', 'ob specht', 'stadtverwaltung', 'haushalt', 'wahl'],
    'wohnen': ['wohnung', 'miete', 'mieten', 'neubau', 'bauprojekt', 'quartier'],
    'wirtschaft': ['unternehmen', 'arbeitsplätze', 'jobs', 'ig metall', 'insolvenz', 'startup'],
    'sport': ['adler', 'waldhof', 'svw', 'löwen', 'rhein-neckar', 'fußball', 'handball'],
    'bildung': ['schule', 'universität', 'uni mannheim', 'hochschule', 'kita'],
    'umwelt': ['klima', 'umwelt', 'bäume', 'baum', 'hochwasser', 'hitze', 'solar', 'grün'],
    'gesundheit': ['klinikum', 'krankenhaus', 'gesundheit', 'arzt', 'ärzte', 'pflege'],
    'gastro': ['restaurant', 'café', 'cafe', 'gastronomie', 'kneipe', 'imbiss', 'bäckerei']
  };

  const text = (title + ' ' + summary).toLowerCase();
  const scores = {};

  for (const [topicId, keywords] of Object.entries(topicKeywords)) {
    scores[topicId] = 0;
    for (const keyword of keywords) {
      if (text.includes(keyword)) scores[topicId]++;
    }
  }

  return Object.entries(scores)
    .filter(([_, score]) => score > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([id]) => id);
}

function extractNeighborhoods(title, summary) {
  const text = (title + ' ' + summary);
  const neighborhoods = [];

  for (const stadteil of data.stadtteile) {
    if (text.includes(stadteil)) {
      neighborhoods.push(stadteil);
    }
  }

  return neighborhoods;
}

const results = [];
let count = 0;

for (const item of data.items) {
  const result = { id: item.id };

  for (const field of item.missing) {
    switch(field) {
      case 'easy_german':
        result.easy_german = simplifyToEasyGerman(item.summary);
        break;
      case 'summary_es':
        result.summary_es = translateToSpanish(item.summary);
        break;
      case 'title_es':
        result.title_es = translateToSpanish(item.title);
        break;
      case 'teaser_es':
        result.teaser_es = translateToSpanish(item.summary);
        break;
      case 'topics':
        result.topics = extractTopics(item.title, item.summary);
        break;
      case 'stadtteile':
        result.stadtteile = extractNeighborhoods(item.title, item.summary);
        break;
      case 'is_mannheim':
        result.is_mannheim = isMannheimRelated(item.title, item.summary);
        break;
    }
  }

  results.push(result);
  count++;
}

fs.writeFileSync('results.json', JSON.stringify(results, null, 2));
console.log(`✅ ${count} noticias procesadas y mejoradas en results.json`);
