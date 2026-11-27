// Regionen innerhalb eines Landes: So grenzt man die Lage weiter ein.
//
// REGIONS[id] = { intro, view?, regions: [{ n: Name, ll: [Breite, Länge], t: [Hinweise] }] }
// Die Hinweise sind so formuliert, dass sie den Namen der Region nicht verraten –
// sie werden im Regionen-Quiz als Frage benutzt.

export const REGIONS = {
  us: {
    intro: 'Die USA sind riesig – aber Landschaft, Vegetation und Bodenfarbe ändern sich deutlich: grüner, feuchter Osten, flache Mitte, gebirgiger und trockener Westen.',
    view: [-125, 24.5, -66.9, 49.4],
    regions: [
      { n: 'Pazifischer Nordwesten', ll: [46.5, -121.5], t: ['Sehr grün und regnerisch, riesige Nadelbäume (Douglasien)', 'Vulkankegel mit Schnee am Horizont, Moos an den Bäumen'] },
      { n: 'Kalifornien', ll: [36.8, -119.8], t: ['Goldbraune, trockene Grashügel mit vereinzelten Eichen', 'Palmen und Wüste im Süden, dichter Verkehr auf breiten Freeways'] },
      { n: 'Südwesten (Wüste)', ll: [34.3, -111.5], t: ['Wüste mit Säulenkakteen, rote Felsen und Tafelberge', 'Flache Lehmhäuser im Adobe-Stil'] },
      { n: 'Rocky Mountains', ll: [40.5, -106.5], t: ['Hochgebirge mit Nadelwald und Espen', 'Trockene Hochebenen mit Beifuß-Sträuchern zwischen den Bergketten'] },
      { n: 'Great Plains', ll: [41, -99], t: ['Topfeben bis zum Horizont, Weizen- und Maisfelder', 'Getreidesilos, schnurgerade Schotterstraßen im Quadratraster'] },
      { n: 'Mittlerer Westen', ll: [41.8, -88.5], t: ['Flach bis leicht wellig, Mais und Soja, rote Scheunen', 'Laubwälder zwischen den Feldern, Farmhäuser aus Holz'] },
      { n: 'Texas', ll: [31, -99], t: ['Flach und trocken, Ölpumpen und Rinderweiden', 'Straßenschilder „Farm to Market Road“ (FM)'] },
      { n: 'Südosten', ll: [33, -85], t: ['Rote Erde und dichte Kiefernwälder', 'Kudzu-Ranken überwuchern Bäume, feucht und warm'] },
      { n: 'Neuengland', ll: [43.8, -71.8], t: ['Hügel mit dichtem Laubwald, weiße Holzkirchen', 'Alte Steinmauern im Wald, Holzhäuser mit Schindeln'] },
      { n: 'Florida', ll: [28, -81.7], t: ['Völlig flach, Palmen, Sümpfe mit Spanischem Moos', 'Flache Häuser aus hellem Putz, sehr hellgrünes Gras'] },
    ],
  },
  ca: {
    intro: 'Kanada sieht oft aus wie die USA. Innerhalb Kanadas helfen Sprache (Französisch in Québec), Landschaft und die Highway-Schilder der Provinzen.',
    view: [-140, 41.5, -52, 62],
    regions: [
      { n: 'British Columbia', ll: [51.5, -122], t: ['Hohe Berge, dichte Nadelwälder, Pazifikküste', 'Sehr grün und regenreich an der Küste, trockene Täler im Inland'] },
      { n: 'Prärieprovinzen', ll: [51.5, -106.5], t: ['Topfeben, endlose Weizen- und Rapsfelder', 'Getreidesilos und Schotterstraßen im Raster'] },
      { n: 'Ontario', ll: [45.5, -79.5], t: ['Laubwald, Seen und glatt geschliffene Felsen', 'Highway-Schild mit einer Krone („King’s Highway“)'] },
      { n: 'Québec', ll: [47, -72], t: ['Schilder auf Französisch, Stoppschild „ARRÊT“', 'Häuser mit glänzenden Blechdächern'] },
      { n: 'Atlantikprovinzen', ll: [46, -64], t: ['Fischerdörfer, bunte Holzhäuser an felsigen Küsten', 'Teils zweisprachige Schilder (Englisch/Französisch)'] },
      { n: 'Hoher Norden', ll: [62.5, -122], t: ['Tundra und dünner Nadelwald, lange Schotterstraßen', 'Kaum Siedlungen, sehr kurze Bäume'] },
    ],
  },
  mx: {
    intro: 'Mexiko reicht von Wüste über Hochland bis Dschungel. Je weiter südlich, desto grüner und indigener.',
    regions: [
      { n: 'Baja California', ll: [28.5, -113.5], t: ['Trockene Halbinsel mit riesigen Kakteen, Meer auf beiden Seiten'] },
      { n: 'Norden', ll: [28.5, -105.5], t: ['Trockene Wüstensteppe, weite Ranches, Gestrüpp'] },
      { n: 'Zentrales Hochland', ll: [20.5, -101], t: ['Hochebene mit Vulkanen, Agavenfelder', 'Koloniale Städte mit bunten Fassaden'] },
      { n: 'Süden', ll: [16.9, -95], t: ['Gebirgig und grün, indigene Dörfer', 'Kaffee- und Maisfelder an steilen Hängen'] },
      { n: 'Yucatán', ll: [20.5, -89], t: ['Völlig flach, dichter niedriger Buschwald', 'Heller Kalkboden, sehr gerade Straßen'] },
    ],
  },
  br: {
    intro: 'Brasilien ist fast so groß wie Europa. Der Süden wirkt europäisch und kühl, der Nordosten trocken oder tropisch, die Mitte ist rote Savanne.',
    regions: [
      { n: 'Süden', ll: [-27.5, -51], t: ['Grüne Hügel, Araukarien (Schirm-Nadelbäume)', 'Europäisch wirkende Häuser von deutschen und italienischen Einwanderern'] },
      { n: 'Südosten', ll: [-21, -45], t: ['Dicht besiedelt, hügelig mit roter Erde', 'Kaffee- und Zuckerrohrfelder, große Städte'] },
      { n: 'Zentral-West (Cerrado)', ll: [-15.5, -52], t: ['Flache Savanne mit knorrigen Bäumen, rote Erde', 'Riesige Sojafelder bis zum Horizont'] },
      { n: 'Nordostküste', ll: [-8, -35.5], t: ['Kokospalmen, Zuckerrohr, Strände', 'Bunte, einfache Häuser'] },
      { n: 'Sertão', ll: [-8, -40], t: ['Sehr trocken, graue Dornbuschsavanne (Caatinga)', 'Kakteen und karge, steinige Böden'] },
      { n: 'Amazonien', ll: [-3.5, -60], t: ['Dichter Regenwald, breite braune Flüsse', 'Holzhäuser auf Stelzen'] },
    ],
  },
  ar: {
    intro: 'Argentinien reicht von den Subtropen bis fast in die Antarktis. Die Pampa ist flach und grün, der Westen trocken und gebirgig, Patagonien leer und windig.',
    regions: [
      { n: 'Pampa / Buenos Aires', ll: [-35, -61], t: ['Topfeben, Weideland und Felder', 'Reihen von Eukalyptusbäumen als Windschutz'] },
      { n: 'Nordwesten', ll: [-24.5, -65.5], t: ['Trockene Hochtäler, bunte Berge, Kakteen', 'Lehmhäuser, indigener Einfluss'] },
      { n: 'Nordosten', ll: [-27.5, -56], t: ['Rote Erde und subtropischer, grüner Wald'] },
      { n: 'Cuyo', ll: [-33, -68.5], t: ['Weinberge, trocken, schneebedeckte Anden im Westen'] },
      { n: 'Patagonien', ll: [-45.5, -69], t: ['Windige, baumlose Steppe mit gelbem Gras', 'Sehr dünn besiedelt, endlose gerade Straßen'] },
    ],
  },
  cl: {
    intro: 'Chile ist über 4000 km lang: Von Nord nach Süd geht es von der trockensten Wüste der Welt bis zu Gletschern.',
    regions: [
      { n: 'Großer Norden', ll: [-23.5, -69.5], t: ['Extrem trockene Wüste ganz ohne Pflanzen', 'Minen und Salzseen'] },
      { n: 'Zentralchile', ll: [-34, -71], t: ['Mediterran: Weinberge, trockene Hügel', 'Hohe Anden im Hintergrund, dicht besiedelt'] },
      { n: 'Seengebiet', ll: [-40.5, -72.7], t: ['Sehr grün und regnerisch, Vulkane und Seen', 'Holzhäuser mit Schindeln (deutscher Einfluss)'] },
      { n: 'Patagonien', ll: [-49.5, -72.5], t: ['Fjorde, Gletscher, windige Steppe', 'Kaum Menschen, Schotterstraßen'] },
    ],
  },
  pe: {
    intro: 'Peru teilt sich in drei Streifen: Küstenwüste, Anden und Amazonas.',
    regions: [
      { n: 'Küste', ll: [-11, -77.3], t: ['Graue oder gelbe Wüste direkt am Meer', 'Unverputzte Ziegelhäuser, kaum Pflanzen außer in Flusstälern'] },
      { n: 'Anden', ll: [-13.5, -72], t: ['Hochgebirge, Terrassenfelder, Lehmhäuser', 'Menschen in traditioneller Kleidung, Lamas'] },
      { n: 'Amazonas', ll: [-6, -76.5], t: ['Tropischer Regenwald, rote Erde', 'Mototaxis, Holzhäuser'] },
    ],
  },
  ru: {
    intro: 'Russland ist das größte Land der Welt. Wichtige Hinweise sind Landschaft, Zusatzsprachen in den Republiken und im Fernen Osten die vielen japanischen Rechtslenker-Autos.',
    view: [27, 41, 145, 68],
    regions: [
      { n: 'Westrussland', ll: [56, 38], t: ['Flach, Birken- und Mischwald, Holzdatschen', 'Plattenbauten in den Städten, sehr viele Ladas'] },
      { n: 'Südrussland', ll: [45.5, 40.5], t: ['Flache Schwarzerde-Felder, Sonnenblumen', 'Warm, Pappelreihen entlang der Straßen'] },
      { n: 'Nordkaukasus', ll: [43, 45], t: ['Hochgebirge, Moscheen statt Kirchen'] },
      { n: 'Wolga & Ural', ll: [55.5, 52], t: ['Hügelig, zweisprachige Schilder (z. B. Tatarisch mit ә, ө, ү)'] },
      { n: 'Sibirien', ll: [55, 83], t: ['Endlose Taiga, Holzhäuser mit bunten Fensterrahmen'] },
      { n: 'Ferner Osten', ll: [48.5, 135], t: ['Sehr viele japanische Autos mit dem Lenkrad rechts', 'Laubwälder, Hügel, Nähe zu China'] },
    ],
  },
  au: {
    intro: 'In Australien helfen Bodenfarbe, Vegetation und die Masten. Außerdem hat jeder Bundesstaat eigene Kennzeichen.',
    regions: [
      { n: 'Queensland', ll: [-22, 145], t: ['Tropisch im Norden, Zuckerrohrfelder', 'Holzhäuser auf Stelzen mit Veranda'] },
      { n: 'New South Wales', ll: [-32.5, 148], t: ['Eukalyptuswälder und grüne Hügel an der Küste', 'Im Inland trocken und flach'] },
      { n: 'Victoria', ll: [-37, 144.5], t: ['Grüner und kühler als der Rest, viel Weideland'] },
      { n: 'South Australia', ll: [-33.5, 138], t: ['Stobie-Masten aus Stahl und Beton', 'Trocken, Weizenfelder und Weinbau'] },
      { n: 'Western Australia', ll: [-31, 117.5], t: ['Weizengürtel mit roter Erde', 'Riesige Distanzen, sandiger Boden an der Küste'] },
      { n: 'Northern Territory / Outback', ll: [-20, 133.5], t: ['Knallrote Erde, Spinifex-Gras, Termitenhügel', 'Endlose leere Straßen'] },
      { n: 'Tasmanien', ll: [-42, 146.5], t: ['Grün, gebirgig und kühl, Schafweiden'] },
    ],
  },
  nz: {
    intro: 'Neuseeland besteht aus zwei großen Inseln mit unterschiedlicher Landschaft.',
    regions: [
      { n: 'Nordinsel', ll: [-38.5, 176], t: ['Vulkane und Thermalgebiete, sanfte grüne Hügel', 'Viele Māori-Ortsnamen (Whaka-, Rangi-, -nui)'] },
      { n: 'Südinsel', ll: [-44, 170.5], t: ['Hohe, schneebedeckte Alpen und Gletscherseen', 'Flache Canterbury-Ebene mit Windschutzhecken'] },
    ],
  },
  in: {
    intro: 'In Indien verrät die Schrift fast immer den Bundesstaat – jede große Sprache hat ihr eigenes Alphabet. Dazu helfen die Staatskürzel auf den Kennzeichen (MH, KA, TN …).',
    regions: [
      { n: 'Nordindien (Hindi-Gürtel)', ll: [26.5, 80.5], t: ['Devanagari-Schrift (Hindi), flache Gangesebene', 'Kennzeichen mit UP, BR, DL'] },
      { n: 'Punjab', ll: [30.8, 75.5], t: ['Gurmukhi-Schrift, Sikh-Tempel mit weißen Kuppeln', 'Sehr flach, Weizenfelder'] },
      { n: 'Rajasthan', ll: [26.8, 73.5], t: ['Wüste, Kamele, Festungen', 'Kennzeichen RJ'] },
      { n: 'Gujarat', ll: [22.5, 71.5], t: ['Schrift wie Devanagari, aber ohne die durchgehende Oberlinie', 'Kennzeichen GJ'] },
      { n: 'Maharashtra', ll: [19.5, 75.5], t: ['Marathi in Devanagari, Dekkan-Plateau', 'Kennzeichen MH'] },
      { n: 'Westbengalen', ll: [23, 88], t: ['Bengalische Schrift, flach, Reisfelder'] },
      { n: 'Karnataka', ll: [14.5, 76], t: ['Kannada-Schrift (runde Buchstaben mit Häkchen oben)', 'Kennzeichen KA'] },
      { n: 'Tamil Nadu', ll: [11, 78.5], t: ['Tamil-Schrift, Tempel mit hohen, bunten Tortürmen', 'Kennzeichen TN'] },
      { n: 'Kerala', ll: [10, 76.4], t: ['Malayalam-Schrift (sehr rund und geschwungen)', 'Kokospalmen, Kirchen, extrem grün'] },
    ],
  },
  jp: {
    intro: 'Japan erstreckt sich über mehr als 2000 km von Nord nach Süd. Schnee-Hinweise im Norden, Subtropen im Süden.',
    regions: [
      { n: 'Hokkaidō', ll: [43.3, 142.5], t: ['Breite, gerade Straßen und Weideland – untypisch weit für Japan', 'Rot-weiße Pfeile über dem Fahrbahnrand (Orientierung bei Schnee)'] },
      { n: 'Tōhoku', ll: [39.5, 140.7], t: ['Ländlich, Reisfelder zwischen bewaldeten Bergen', 'Sehr schneereich, steile Dächer'] },
      { n: 'Kantō', ll: [36, 139.7], t: ['Riesige Ebene, extrem dicht bebaut'] },
      { n: 'Kansai', ll: [34.8, 135.6], t: ['Dichte Städte, alte Tempel, Berge rundherum'] },
      { n: 'Kyūshū', ll: [32.5, 131], t: ['Aktive Vulkane, subtropisch mit Palmen im Süden'] },
      { n: 'Okinawa', ll: [26.4, 127.8], t: ['Tropische Inseln, Betonhäuser mit Flachdach', 'Löwenhund-Figuren (Shisa) auf den Dächern'] },
    ],
  },
  id: {
    intro: 'Indonesien besteht aus tausenden Inseln mit unterschiedlicher Kultur und Architektur.',
    regions: [
      { n: 'Java', ll: [-7.3, 110], t: ['Extrem dicht besiedelt, Reisterrassen', 'Vulkane im Hintergrund, viele Moscheen'] },
      { n: 'Bali', ll: [-8.4, 115.2], t: ['Hindu-Tempel, verzierte, gespaltene Steintore', 'Kleine Opfergaben vor den Häusern'] },
      { n: 'Sumatra', ll: [0, 101.5], t: ['Ölpalmen-Plantagen', 'Häuser mit geschwungenen „Büffelhorn“-Dächern'] },
      { n: 'Kalimantan (Borneo)', ll: [-1, 114], t: ['Flach, Regenwald und Plantagen, breite Flüsse', 'Holzhäuser auf Stelzen'] },
      { n: 'Sulawesi', ll: [-2.5, 120.5], t: ['Bergig, Häuser mit schiffsförmigen Dächern (Toraja)'] },
      { n: 'Kleine Sundainseln', ll: [-8.7, 121.5], t: ['Trocken, savannenartig, braunes Gras'] },
    ],
  },
  th: {
    intro: 'Thailand: gebirgiger Norden, trockener Nordosten, flaches Zentrum und tropischer Süden.',
    regions: [
      { n: 'Norden', ll: [18.8, 99.2], t: ['Bewaldete Berge, kühler, Bergvölker'] },
      { n: 'Isan (Nordosten)', ll: [16, 103], t: ['Flache Hochebene, Reisfelder, eher trocken'] },
      { n: 'Zentralthailand', ll: [14.5, 100.4], t: ['Völlig flach, Reisfelder, Kanäle, Großraum Bangkok'] },
      { n: 'Süden', ll: [8, 99.5], t: ['Kautschuk- und Palmenplantagen, Kalksteinfelsen', 'Moscheen nahe der Grenze zu Malaysia'] },
    ],
  },
  es: {
    intro: 'In Spanien verraten die Regionalsprachen viel – und der Norden ist grün, der Süden trocken.',
    regions: [
      { n: 'Galicien', ll: [42.8, -8], t: ['Grün und regnerisch, Eukalyptus', 'Galicisch („rúa“, „Concello“), Steinspeicher auf Stelzen (Hórreos)'] },
      { n: 'Baskenland', ll: [43.1, -2.5], t: ['Grüne Hügel, Baskisch mit vielen „k“, „tx“, „z“ („Kalea“)'] },
      { n: 'Katalonien', ll: [41.8, 1.5], t: ['Katalanisch („carrer“, „Ajuntament“), Mittelmeer'] },
      { n: 'Kastilien (Meseta)', ll: [41, -4], t: ['Weite, trockene Hochebene, Getreidefelder', 'Kleine Dörfer aus braunem Stein'] },
      { n: 'Andalusien', ll: [37.4, -5], t: ['Olivenhaine bis zum Horizont, weiße Dörfer', 'Heiß und trocken'] },
      { n: 'Kanaren', ll: [28.3, -16], t: ['Vulkanisch und karg, Palmen und Kakteen, Atlantik'] },
    ],
  },
  fr: {
    intro: 'Frankreich ist vielseitig: Bauweise und Landschaft unterscheiden sich stark zwischen den Regionen.',
    regions: [
      { n: 'Bretagne', ll: [48.2, -3], t: ['Granithäuser mit Schieferdach', 'Zweisprachige Ortsschilder (Bretonisch)'] },
      { n: 'Norden & Normandie', ll: [49.7, 1], t: ['Grün, Fachwerk und Backstein, Kühe'] },
      { n: 'Elsass', ll: [48.3, 7.4], t: ['Bunte Fachwerkhäuser, Weinberge', 'Deutsch klingende Ortsnamen („-heim“, „-willer“)'] },
      { n: 'Provence', ll: [43.7, 5.6], t: ['Trocken, Pinien und Zypressen, Lavendelfelder', 'Ziegeldächer im Mittelmeerstil'] },
      { n: 'Alpen', ll: [45.5, 6.4], t: ['Hochgebirge, Holzchalets, Skiorte'] },
      { n: 'Südwesten', ll: [44.2, -0.5], t: ['Riesige Kiefernwälder auf flachem Sand', 'Weinbau rund um Bordeaux'] },
    ],
  },
  de: {
    intro: 'In Deutschland helfen Kennzeichen (Kreis-Kürzel), Bauweise und Landschaft: flacher Backstein-Norden, Mittelgebirge, alpiner Süden.',
    regions: [
      { n: 'Norddeutschland', ll: [53.4, 9.5], t: ['Flach, Backsteinhäuser, Reetdächer, Windräder', 'Kennzeichen z. B. HH, HB, KI'] },
      { n: 'Nordrhein-Westfalen', ll: [51.4, 7.3], t: ['Sehr dicht besiedelt, Industrie', 'Kennzeichen z. B. K, D, E, DO'] },
      { n: 'Ostdeutschland', ll: [52, 13], t: ['Alleen, Kopfsteinpflaster, Plattenbauten', 'Kennzeichen z. B. B, L, DD'] },
      { n: 'Mitte (Hessen, Thüringen)', ll: [50.7, 10], t: ['Bewaldete Mittelgebirge, Fachwerkdörfer'] },
      { n: 'Baden-Württemberg', ll: [48.4, 9], t: ['Schwarzwald, Weinberge an Hängen', 'Kennzeichen z. B. S, KA, FR'] },
      { n: 'Bayern', ll: [48.6, 11.7], t: ['Kirchtürme mit Zwiebelhauben, Alpen im Süden', 'Kennzeichen z. B. M, N, A'] },
    ],
  },
  it: {
    intro: 'Italien wird von Nord nach Süd trockener und ärmer, die Berge rücken näher an die Küste.',
    regions: [
      { n: 'Alpen & Südtirol', ll: [46.5, 11.3], t: ['Hochgebirge, zweisprachige Schilder (Deutsch/Italienisch)'] },
      { n: 'Poebene', ll: [45.1, 10], t: ['Völlig flach, Reisfelder und Pappelreihen'] },
      { n: 'Toskana & Mittelitalien', ll: [43.3, 11.3], t: ['Sanfte Hügel, Zypressenalleen, Weinberge'] },
      { n: 'Süditalien', ll: [40.6, 16.5], t: ['Trocken, Olivenbäume, Rundhäuser mit Kegeldach (Trulli)'] },
      { n: 'Sizilien', ll: [37.5, 14], t: ['Trockene Hügel, Feigenkakteen, ein großer Vulkan'] },
      { n: 'Sardinien', ll: [40, 9], t: ['Karge Macchia, Granitfelsen, dünn besiedelt'] },
    ],
  },
  gb: {
    intro: 'Im Vereinigten Königreich helfen Sprache (Walisisch, Gälisch), Landschaft und in Nordirland die Kennzeichen.',
    regions: [
      { n: 'Schottland', ll: [56.9, -4.5], t: ['Kahle Hochlandhügel mit Heide', 'Einspurige Straßen mit „Passing Place“-Schildern'] },
      { n: 'Wales', ll: [52.3, -3.7], t: ['Zweisprachige Schilder („Araf“ = langsam)', 'Grüne Hügel voller Schafe'] },
      { n: 'Nordengland', ll: [54.3, -2.2], t: ['Trockenmauern, Hochmoore, Steinhäuser'] },
      { n: 'Südengland', ll: [51.2, -1], t: ['Schmale Straßen zwischen hohen Hecken, Backsteinhäuser', 'Sanfte, grüne Hügel'] },
      { n: 'Nordirland', ll: [54.6, -6.7], t: ['Kennzeichen ohne Jahresangabe, z. B. „ABZ 1234“', 'Irische Landschaft, aber britische Schilder und Meilen'] },
    ],
  },
  no: {
    intro: 'Norwegen: im Süden mehr Felder und Städte, im Westen Fjorde, im Norden Tundra.',
    regions: [
      { n: 'Ostnorwegen', ll: [60, 10.5], t: ['Wälder, Felder und Seen, eher sanfte Landschaft'] },
      { n: 'Westnorwegen', ll: [61.3, 6.5], t: ['Tiefe Fjorde, steile Berge, Wasserfälle'] },
      { n: 'Trøndelag', ll: [63.5, 11], t: ['Breite Täler mit Höfen, rote Scheunen'] },
      { n: 'Nordnorwegen', ll: [69, 19], t: ['Karge Berge, Tundra, Rentiere', 'Schilder teils auf Samisch'] },
    ],
  },
  se: {
    intro: 'Schweden wird nach Norden immer leerer und bewaldeter.',
    regions: [
      { n: 'Skåne (Süden)', ll: [55.8, 13.5], t: ['Flach, offene Felder, Fachwerk – fast wie Dänemark'] },
      { n: 'Mittelschweden', ll: [59.5, 15.5], t: ['Wälder, Seen und rote Holzhäuser'] },
      { n: 'Norrland', ll: [65.5, 18.5], t: ['Endlose Nadelwälder, Rentiere, Samisch auf Schildern'] },
    ],
  },
  tr: {
    intro: 'Die Türkei reicht vom grünen Schwarzmeer bis zur trockenen Hochebene. Die Zahl vorne auf dem Kennzeichen verrät die Provinz.',
    regions: [
      { n: 'Marmara / Istanbul', ll: [41, 28.9], t: ['Dicht besiedelt, Kennzeichen beginnen mit 34'] },
      { n: 'Ägäis', ll: [38.4, 27.6], t: ['Olivenbäume, Mittelmeerklima, Kennzeichen 35 (Izmir)'] },
      { n: 'Schwarzmeerküste', ll: [41, 38.5], t: ['Sehr grün und regnerisch, Teeplantagen an steilen Hängen'] },
      { n: 'Zentralanatolien', ll: [39.2, 33], t: ['Weite, trockene Hochebene, Getreide', 'Kennzeichen 06 (Ankara)'] },
      { n: 'Südosten', ll: [37.5, 40], t: ['Heiß und trocken, Häuser aus dunklem Basalt'] },
    ],
  },
  za: {
    intro: 'Südafrika: vom Mittelmeerklima am Kap bis zur Savanne im Nordosten.',
    regions: [
      { n: 'Westkap', ll: [-33.6, 19.5], t: ['Weinberge vor schroffen Bergen, Fynbos-Sträucher', 'Weiße Häuser im kapholländischen Stil'] },
      { n: 'Ostkap', ll: [-32, 27.5], t: ['Grüne Hügel mit bunten Rundhütten (Rondavels)'] },
      { n: 'KwaZulu-Natal', ll: [-29, 30.6], t: ['Subtropisch und grün, Zuckerrohr'] },
      { n: 'Gauteng', ll: [-26, 28.1], t: ['Flaches Grasland (Highveld), Großstädte, Minenhalden'] },
      { n: 'Karoo / Nordkap', ll: [-30.5, 22], t: ['Halbwüste, flach, Windpumpen auf Farmen'] },
      { n: 'Limpopo', ll: [-23.5, 29.5], t: ['Savanne mit Dornbüschen und Baobabs'] },
    ],
  },
  ro: {
    intro: 'Rumänien: Karpatenbogen in der Mitte, flache Walachei im Süden.',
    regions: [
      { n: 'Siebenbürgen', ll: [46.5, 24.6], t: ['Hügelig, Kirchenburgen, deutsche und ungarische Ortsnamen', 'Teilweise ungarische Schilder (Szeklerland)'] },
      { n: 'Walachei', ll: [44.4, 25.5], t: ['Flache Ebene, Felder, Pappeln'] },
      { n: 'Moldau-Region', ll: [47.2, 26.8], t: ['Hügel, Klöster mit bemalten Außenwänden'] },
      { n: 'Dobrudscha', ll: [44.4, 28.4], t: ['Trockene Steppe am Schwarzen Meer, Windräder'] },
    ],
  },
};
