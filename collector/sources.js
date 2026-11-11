// Lista de fuentes de noticias.
// Cada fuente es un "RSS": una lista automática de noticias que publica la web.
// Para añadir una fuente nueva, basta con copiar una línea y cambiar los datos.
//
// regional: true  -> la fuente cubre también otras ciudades (Heidelberg, Ludwigshafen...),
//                    así que marcamos cada noticia según si habla de Mannheim o no.

export const SOURCES = [
  { id: 'mm', label: 'Mannheimer Morgen', url: 'https://www.mannheimer-morgen.de/feed/117-rss-mannheim.xml' },
  { id: 'mm-top', label: 'Mannheimer Morgen', url: 'https://www.mannheimer-morgen.de/feed/146-rss-das-wichtigste.xml', regional: true },
  { id: 'mm-adler', label: 'Mannheimer Morgen', url: 'https://www.mannheimer-morgen.de/feed/51-rss-adler-mannheim.xml', topics: ['sport'] },
  { id: 'mm-waldhof', label: 'Mannheimer Morgen', url: 'https://www.mannheimer-morgen.de/feed/53-rss-sv-waldhof.xml', topics: ['sport'] },
  { id: 'stadt-news', label: 'Stadt Mannheim', url: 'https://www.mannheim.de/rss/nachrichten' },
  { id: 'stadt-presse', label: 'Stadt Mannheim', url: 'https://www.mannheim.de/rss/pressemeldungen' },
  { id: 'stadt-events', label: 'Stadt Mannheim · Eventos', url: 'https://www.mannheim.de/rss/veranstaltungen', topics: ['freizeit'] },
  { id: 'polizei', label: 'Polizei Mannheim', url: 'https://www.presseportal.de/rss/dienststelle_14915.rss2', regional: true, topics: ['sicherheit'] },
  // SWR bloquea a los lectores automáticos; sus noticias llegan igualmente vía Google News.
  { id: 'mannheim24', label: 'Mannheim24', url: 'https://www.mannheim24.de/rssfeed.rdf', regional: true },
  { id: 'gnews', label: 'Google News', url: 'https://news.google.com/rss/search?q=Mannheim&hl=de&gl=DE&ceid=DE:de', regional: true }
];
