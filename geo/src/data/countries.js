// Länder mit Street-View-Abdeckung, die im Geo-Trainer vorkommen.
//
// Felder:
//   id     ISO-Code (gleich wie im Hauptstadt-Quiz → Name, Flagge, Kartenform)
//   drive  'L' = Linksverkehr, 'R' = Rechtsverkehr
//   tld    Länder-Domain
//   tel    internationale Vorwahl
//   lang   Sprache(n) auf Schildern
//   script Schrift
//   hemi   'N' / 'S' / 'NS' (liegt auf beiden Halbkugeln)
//   tips   die wichtigsten Erkennungsmerkmale (Steckbrief)

const L = 'L';
const R = 'R';

export const COUNTRIES = [
  // ───────────── Europa ─────────────
  { id: 'al', drive: R, tld: '.al', tel: '+355', lang: 'Albanisch', script: 'Lateinisch', tips: ['Albanisch erkennt man am häufigen „ë“ und „ç“ (z. B. „Rruga“ = Straße, „Shkodër“)', 'Auffallend viele (oft ältere) Mercedes-Benz', 'Unfertige Häuser mit herausragenden Bewehrungsstäben, kleine Betonbunker'] },
  { id: 'ad', drive: R, tld: '.ad', tel: '+376', lang: 'Katalanisch', script: 'Lateinisch', tips: ['Nur Hochgebirge: enge Pyrenäentäler mit Steinhäusern', 'Katalanisch auf Schildern („carrer“, „avinguda“)', 'Viele Tankstellen, Einkaufszentren und Skigebiete'] },
  { id: 'at', drive: R, tld: '.at', tel: '+43', lang: 'Deutsch', script: 'Lateinisch', tips: ['Kennzeichen mit rot-weiß-rotem Streifen oben und unten', 'Leitpfosten weiß mit schwarzem Kopf', 'Alpenlandschaft, Holzbalkone mit Blumen, Kirchtürme mit Zwiebelhauben'] },
  { id: 'be', drive: R, tld: '.be', tel: '+32', lang: 'Niederländisch, Französisch', script: 'Lateinisch', tips: ['Kennzeichen weiß mit ROTER Schrift – einzigartig', 'Norden (Flandern) Niederländisch, Süden (Wallonien) Französisch', 'Viele Betonstraßen mit Querfugen, Backsteinhäuser'] },
  { id: 'bg', drive: R, tld: '.bg', tel: '+359', lang: 'Bulgarisch', script: 'Kyrillisch', tips: ['Kyrillisch mit sehr häufigem „ъ“ – aber ohne „ы“ und „э“', 'Kennzeichen mit EU-Band und Kürzel der Provinz (z. B. CA = Sofia)', 'Hügelig, viele Plattenbauten und alte Ladas'] },
  { id: 'hr', drive: R, tld: '.hr', tel: '+385', lang: 'Kroatisch', script: 'Lateinisch', tips: ['Kennzeichen mit rot-weiß kariertem Wappen in der Mitte', 'Buchstaben č, ć, đ, š, ž', 'Küste mit hellem Karst, im Inland (Slawonien) flach'] },
  { id: 'cz', drive: R, tld: '.cz', tel: '+420', lang: 'Tschechisch', script: 'Lateinisch', tips: ['Buchstaben ř und ů gibt es nur im Tschechischen', 'Poller mit zwei orangen Reflektoren übereinander', 'Hügelig, Felder und Wälder, Dörfer mit Kapellen'] },
  { id: 'dk', drive: R, tld: '.dk', tel: '+45', lang: 'Dänisch', script: 'Lateinisch', tips: ['Randlinien oft aus kleinen weißen Quadraten, doppelte Mittellinien', 'Buchstaben æ, ø, å', 'Sehr flach, Felder, rote Backsteinhäuser'] },
  { id: 'ee', drive: R, tld: '.ee', tel: '+372', lang: 'Estnisch', script: 'Lateinisch', tips: ['Buchstabe „õ“ (sonst nur im Portugiesischen)', 'Viele Doppelvokale (aa, ää, uu) – ähnlich wie Finnisch', 'Flach, Wälder, Holzhäuser'] },
  { id: 'fi', drive: R, tld: '.fi', tel: '+358', lang: 'Finnisch, Schwedisch', script: 'Lateinisch', tips: ['Sehr viele Doppelvokale und -konsonanten („katu“, „Kauppa“, „Jyväskylä“)', 'Warnschilder mit gelbem Grund, Chevrons gelb auf schwarz', 'Endlose Wälder und Seen, rote oder gelbe Holzhäuser'] },
  { id: 'fr', drive: R, tld: '.fr', tel: '+33', lang: 'Französisch', script: 'Lateinisch', tips: ['Kennzeichen mit blauem Band links UND rechts (rechts: Regionslogo + Département-Nummer)', 'Runde weiße Poller mit umlaufendem grauem oder rotem Band', 'Ortsschilder weiß mit rotem Rand'] },
  { id: 'de', drive: R, tld: '.de', tel: '+49', lang: 'Deutsch', script: 'Lateinisch', tips: ['Gelbe Ortsschilder', 'Leitpfosten weiß mit schwarzem, schräg abgeschnittenem Kopf', 'Kennzeichen: Buchstaben vorne verraten den Kreis (M = München, HH = Hamburg)'] },
  { id: 'gr', drive: R, tld: '.gr', tel: '+30', lang: 'Griechisch', script: 'Griechisch', tips: ['Griechisches Alphabet, meist mit lateinischer Umschrift darunter', 'Warnschilder mit gelbem Grund', 'Trockene, felsige Landschaft mit Olivenbäumen', 'Kleine Gedenk-Kapellen (Kandylakia) am Straßenrand'] },
  { id: 'hu', drive: R, tld: '.hu', tel: '+36', lang: 'Ungarisch', script: 'Lateinisch', tips: ['Buchstaben ő und ű – nur im Ungarischen', 'Betonmasten mit Löchern über die ganze Länge', 'Sehr flach im Osten (Puszta), Sonnenblumen und Mais'] },
  { id: 'is', drive: R, tld: '.is', tel: '+354', lang: 'Isländisch', script: 'Lateinisch', tips: ['Buchstaben ð und þ', 'Kaum Bäume, Lava- und Moosfelder, Gletscher', 'Gelbe Poller'] },
  { id: 'ie', drive: L, tld: '.ie', tel: '+353', lang: 'Englisch, Irisch', script: 'Lateinisch', tips: ['Gelbe Randlinien und gelbe, rautenförmige Warnschilder', 'Zweisprachige Schilder (Irisch oben/kursiv, Englisch)', 'Kennzeichen: Jahr – Grafschaft – Nummer, z. B. „191-D-1234“'] },
  { id: 'it', drive: R, tld: '.it', tel: '+39', lang: 'Italienisch', script: 'Lateinisch', tips: ['Kennzeichen mit blauem Band links UND rechts', 'Autobahnschilder grün, andere Wegweiser blau', 'Poller weiß mit schwarzem Kopf und rotem Reflektor'] },
  { id: 'lv', drive: R, tld: '.lv', tel: '+371', lang: 'Lettisch', script: 'Lateinisch', tips: ['Viele Längenstriche: ā, ē, ī, ū – dazu ķ, ļ, ņ, ģ', 'Dünne, leicht gebogene Poller mit schrägem schwarzem Feld', 'Flach mit Wäldern, Feldern und Holzhäusern'] },
  { id: 'lt', drive: R, tld: '.lt', tel: '+370', lang: 'Litauisch', script: 'Lateinisch', tips: ['Buchstaben ė, ų, į – Wörter enden oft auf -as, -is, -us', 'Keilförmige Poller mit orangem Reflektor'] },
  { id: 'lu', drive: R, tld: '.lu', tel: '+352', lang: 'Französisch, Luxemburgisch, Deutsch', script: 'Lateinisch', tips: ['Gelbe Kennzeichen wie in den Niederlanden – aber hügelig und bewaldet', 'Französische Straßenschilder, Ortsnamen oft auch auf Luxemburgisch'] },
  { id: 'mt', drive: L, tld: '.mt', tel: '+356', lang: 'Maltesisch, Englisch', script: 'Lateinisch', tips: ['Linksverkehr', 'Maltesisch mit ħ, ġ, ż (z. B. „Triq“ = Straße)', 'Helle Kalksteinhäuser, sehr trocken und dicht bebaut'] },
  { id: 'me', drive: R, tld: '.me', tel: '+382', lang: 'Montenegrinisch', script: 'Lateinisch + Kyrillisch', tips: ['Lateinisch und kyrillisch gemischt', 'Sehr gebirgig, Adriaküste mit der Bucht von Kotor'] },
  { id: 'nl', drive: R, tld: '.nl', tel: '+31', lang: 'Niederländisch', script: 'Lateinisch', tips: ['Gelbe Kennzeichen vorne und hinten', 'Rote Radwege, kaum Strommasten (Leitungen unter der Erde)', 'Extrem flach, Kanäle, „ij“ in vielen Wörtern'] },
  { id: 'mk', drive: R, tld: '.mk', tel: '+389', lang: 'Mazedonisch', script: 'Kyrillisch', tips: ['Kyrillisch mit Sonderbuchstaben ѓ, ќ, ѕ', 'Warnschilder mit gelbem Grund', 'Gebirgig und trocken'] },
  { id: 'no', drive: R, tld: '.no', tel: '+47', lang: 'Norwegisch', script: 'Lateinisch', tips: ['Gelbe Mittellinien (sonst in Europa fast überall weiß)', 'Buchstaben æ, ø, å', 'Fjorde, Berge, rote und weiße Holzhäuser'] },
  { id: 'pl', drive: R, tld: '.pl', tel: '+48', lang: 'Polnisch', script: 'Lateinisch', tips: ['Warnschilder mit gelbem Grund, Fußgängerschild mit nur einer Linie', 'Buchstabe ł sowie ą, ę, ś, ź, ż', 'Betonmasten mit Löchern nur im mittleren Bereich'] },
  { id: 'pt', drive: R, tld: '.pt', tel: '+351', lang: 'Portugiesisch', script: 'Lateinisch', tips: ['Kennzeichen mit gelbem Band rechts (bis 2020)', 'ã, õ, ç – Wörter auf „-ção“', 'Weiße Häuser mit Ziegeldächern, viel Eukalyptus'] },
  { id: 'ro', drive: R, tld: '.ro', tel: '+40', lang: 'Rumänisch', script: 'Lateinisch', tips: ['Buchstaben ș, ț, ă, â, î', 'Kennzeichen beginnen mit dem Kreis-Kürzel (B = Bukarest, CJ = Cluj)', 'Pferdekutschen auf dem Land, Karpaten im Zentrum'] },
  { id: 'ru', drive: R, tld: '.ru', tel: '+7', lang: 'Russisch', script: 'Kyrillisch', tips: ['Kyrillisch mit „ы“ und „э“', 'Kennzeichen mit Regionsnummer und Flagge rechts', 'Riesige Birkenwälder, Plattenbauten, Betonmasten mit Schrägstütze'] },
  { id: 'rs', drive: R, tld: '.rs', tel: '+381', lang: 'Serbisch', script: 'Kyrillisch + Lateinisch', tips: ['Kyrillisch und lateinisch, Sonderbuchstaben ђ, ћ, џ, љ, њ', 'Hügelig im Süden, flach im Norden (Vojvodina)'] },
  { id: 'sk', drive: R, tld: '.sk', tel: '+421', lang: 'Slowakisch', script: 'Lateinisch', tips: ['ľ, ĺ, ŕ, ô, ä – aber kein tschechisches ř oder ů', 'Poller wie in Tschechien (zwei orange Reflektoren)'] },
  { id: 'si', drive: R, tld: '.si', tel: '+386', lang: 'Slowenisch', script: 'Lateinisch', tips: ['Nur č, š, ž – kein ć oder đ wie in Kroatien', 'Alpine Landschaft, Heuharfen (Kozolec) auf den Wiesen'] },
  { id: 'es', drive: R, tld: '.es', tel: '+34', lang: 'Spanisch (+ Katalanisch, Galicisch, Baskisch)', script: 'Lateinisch', tips: ['Buchstabe ñ, in manchen Regionen zweisprachige Schilder', 'Kennzeichen ohne Regionskürzel: 4 Ziffern + 3 Buchstaben', 'Fußgängerschild mit 8 Streifen, Chevrons weiß auf blau', 'Im Inland und Süden trocken, im Norden grün'] },
  { id: 'se', drive: R, tld: '.se', tel: '+46', lang: 'Schwedisch', script: 'Lateinisch', tips: ['Buchstaben å, ä, ö', 'Warnschilder mit gelbem Grund', 'Chevrons: gelbe Pfeile auf blauem Grund', 'Falunrote Holzhäuser, Nadelwälder'] },
  { id: 'ch', drive: R, tld: '.ch', tel: '+41', lang: 'Deutsch, Französisch, Italienisch', script: 'Lateinisch', tips: ['Kein „ß“ – in der Schweiz schreibt man immer „ss“', 'Kennzeichen mit Kantonswappen, ohne EU-Band', 'Hohe Fußgängerschilder mit 7 Streifen, gelbe Zebrastreifen'] },
  { id: 'tr', drive: R, tld: '.tr', tel: '+90', lang: 'Türkisch', script: 'Lateinisch', tips: ['ı (i ohne Punkt), ş, ğ, ç', 'Kennzeichen mit blauem TR-Band; die Zahl vorne ist die Provinz (34 = Istanbul, 06 = Ankara)', 'Moscheen mit schlanken Minaretten'] },
  { id: 'ua', drive: R, tld: '.ua', tel: '+380', lang: 'Ukrainisch', script: 'Kyrillisch', tips: ['Kyrillisch mit і, ї, є, ґ (Russisch hat stattdessen ы, э)', 'Kennzeichen mit Flagge und „UA“ links', 'Flaches Ackerland mit dunkler Schwarzerde'] },
  { id: 'gb', drive: L, tld: '.uk', tel: '+44', lang: 'Englisch (+ Walisisch, Gälisch)', script: 'Lateinisch', tips: ['Kennzeichen vorne weiß, hinten gelb', 'Doppelte gelbe Linien am Straßenrand (Parkverbot)', 'In Wales zweisprachig mit „ll“, „dd“, „ff“'] },
  { id: 'fo', drive: R, tld: '.fo', tel: '+298', lang: 'Färöisch', script: 'Lateinisch', tips: ['Buchstaben ð und ø', 'Steile, baumlose Inseln, Häuser mit Grasdächern'] },

  // ───────────── Asien ─────────────
  { id: 'bd', drive: L, tld: '.bd', tel: '+880', lang: 'Bengalisch', script: 'Bengalisch', tips: ['Bengalische Schrift (mit durchgehender Oberlinie)', 'Extrem dicht, viele Fahrradrikschas, flach und sehr grün', 'Linksverkehr'] },
  { id: 'bt', drive: L, tld: '.bt', tel: '+975', lang: 'Dzongkha', script: 'Tibetisch', tips: ['Tibetische Schrift', 'Hochgebirge, Gebetsfahnen, Häuser mit bemalten Holzfenstern', 'Linksverkehr'] },
  { id: 'kh', drive: R, tld: '.kh', tel: '+855', lang: 'Khmer', script: 'Khmer', tips: ['Khmer-Schrift (sehr verschnörkelt, mit vielen „Häkchen“ unten)', 'Rechtsverkehr – anders als in Thailand', 'Flach, Reisfelder, Zuckerpalmen, rote Erde'] },
  { id: 'hk', drive: L, tld: '.hk', tel: '+852', lang: 'Chinesisch, Englisch', script: 'Chinesisch (traditionell)', tips: ['Traditionelle chinesische Zeichen + Englisch', 'Kennzeichen vorne weiß, hinten gelb', 'Gelbe Randlinien, Hochhäuser und steile grüne Hügel'] },
  { id: 'in', drive: L, tld: '.in', tel: '+91', lang: 'Hindi, Englisch + Regionalsprachen', script: 'Devanagari u. v. m.', tips: ['Linksverkehr; die Schrift wechselt je nach Bundesstaat', 'Kennzeichen: weiß (privat) oder gelb (gewerblich), vorne das Staatskürzel (MH, DL, KA …)', 'Sehr dichter Verkehr, Autorikschas'] },
  { id: 'id', drive: L, tld: '.id', tel: '+62', lang: 'Indonesisch', script: 'Lateinisch', hemi: 'NS', tips: ['Linksverkehr', 'Kennzeichen schwarz mit weißer Schrift (verschwommen: drei weiße Abschnitte)', 'Indonesisch: „Jalan“ (Jl.), „Desa“, viele Motorroller'] },
  { id: 'il', drive: R, tld: '.il', tel: '+972', lang: 'Hebräisch, Arabisch, Englisch', script: 'Hebräisch', tips: ['Hebräische Schrift, Schilder oft dreisprachig', 'Gelbe Kennzeichen', 'Trockene Landschaft, helle Steinhäuser'] },
  { id: 'jp', drive: L, tld: '.jp', tel: '+81', lang: 'Japanisch', script: 'Japanisch', tips: ['Linksverkehr; Kennzeichen klein, weiß oder gelb (Kei-Cars)', 'Betonmasten mit unzähligen Kabeln, Spiegel an Kurven', 'Schrift aus Kanji + runden Hiragana / eckigen Katakana'] },
  { id: 'jo', drive: R, tld: '.jo', tel: '+962', lang: 'Arabisch', script: 'Arabisch', tips: ['Arabische Schrift, oft mit Englisch', 'Wüste und helle, kastenförmige Steinhäuser'] },
  { id: 'kz', drive: R, tld: '.kz', tel: '+7', lang: 'Kasachisch, Russisch', script: 'Kyrillisch', tips: ['Kasachische Sonderbuchstaben ә, ғ, қ, ң, ө, ұ, ү, і', 'Endlose, flache Steppe', 'Kennzeichen mit Flagge und „KZ“ links'] },
  { id: 'kg', drive: R, tld: '.kg', tel: '+996', lang: 'Kirgisisch, Russisch', script: 'Kyrillisch', tips: ['Kyrillisch mit ң, ө, ү (aber ohne die kasachischen ә, ғ, қ)', 'Hochgebirge (Tian Shan), Jurten, Pferde'] },
  { id: 'la', drive: R, tld: '.la', tel: '+856', lang: 'Laotisch', script: 'Laotisch', tips: ['Laotische Schrift (runder und schlichter als Thai)', 'Rechtsverkehr – anders als in Thailand', 'Gebirgig, Dschungel, wenig Verkehr'] },
  { id: 'lb', drive: R, tld: '.lb', tel: '+961', lang: 'Arabisch, Französisch', script: 'Arabisch', tips: ['Arabisch und Französisch', 'Gebirgig, dicht bebaut entlang der Mittelmeerküste'] },
  { id: 'my', drive: L, tld: '.my', tel: '+60', lang: 'Malaiisch', script: 'Lateinisch', tips: ['Schwarze Kennzeichen mit weißer Schrift', 'Linksverkehr, Malaiisch („Jalan“, „Kampung“)', 'Doppelte weiße Mittellinien, Ölpalmen-Plantagen'] },
  { id: 'mn', drive: R, tld: '.mn', tel: '+976', lang: 'Mongolisch', script: 'Kyrillisch', tips: ['Kyrillisch mit ө und ү, viele Doppelvokale („Улаанбаатар“)', 'Weite, baumlose Steppe, Jurten (Ger)', 'Google-Auto: großer Pick-up, oft mit Zelt, Schnorchel und Dachträger'] },
  { id: 'np', drive: L, tld: '.np', tel: '+977', lang: 'Nepali', script: 'Devanagari', tips: ['Devanagari-Schrift', 'Linksverkehr, Himalaya, Terrassenfelder'] },
  { id: 'ph', drive: R, tld: '.ph', tel: '+63', lang: 'Filipino, Englisch', script: 'Lateinisch', tips: ['Jeepneys und Tricycles (Motorräder mit Beiwagen)', 'Viel Englisch auf Schildern, Filipino („Barangay“)', 'Rechtsverkehr, tropisch'] },
  { id: 'qa', drive: R, tld: '.qa', tel: '+974', lang: 'Arabisch, Englisch', script: 'Arabisch', tips: ['Arabisch und Englisch', 'Flache Wüste, sehr moderne Straßen'] },
  { id: 'sg', drive: L, tld: '.sg', tel: '+65', lang: 'Englisch (+ Chinesisch, Malaiisch, Tamil)', script: 'Lateinisch', tips: ['Linksverkehr, Englisch', 'Sehr sauber, Hochhaussiedlungen, tropisch'] },
  { id: 'kr', drive: R, tld: '.kr', tel: '+82', lang: 'Koreanisch', script: 'Hangul', tips: ['Hangul-Schrift (Kreise und Striche in Silbenblöcken)', 'Gelb-schwarze Streifen unten an den Strommasten, gelbe Mittellinien', 'Viele gleichförmige Hochhaussiedlungen, gebirgig'] },
  { id: 'lk', drive: L, tld: '.lk', tel: '+94', lang: 'Singhalesisch, Tamil', script: 'Singhalesisch', tips: ['Singhalesisch (sehr runde Schrift) und Tamil', 'Linksverkehr, Tuk-Tuks', 'Tropisch, Palmen'] },
  { id: 'tw', drive: R, tld: '.tw', tel: '+886', lang: 'Chinesisch', script: 'Chinesisch (traditionell)', tips: ['Traditionelle chinesische Zeichen', 'Rechtsverkehr, unzählige Motorroller, rote Randlinien (Halteverbot)', 'Im Osten gebirgig, im Westen dicht besiedelt'] },
  { id: 'th', drive: L, tld: '.th', tel: '+66', lang: 'Thai', script: 'Thai', tips: ['Thai-Schrift', 'Linksverkehr, gelbe Mittellinien', 'Viele Kabel, Tempel mit geschwungenen Dächern'] },
  { id: 'ae', drive: R, tld: '.ae', tel: '+971', lang: 'Arabisch, Englisch', script: 'Arabisch', tips: ['Arabisch und Englisch', 'Wüste, breite moderne Autobahnen'] },
  { id: 'vn', drive: R, tld: '.vn', tel: '+84', lang: 'Vietnamesisch', script: 'Lateinisch', tips: ['Lateinische Schrift mit sehr vielen Akzenten (ư, ơ, đ)', 'Rechtsverkehr, extrem viele Mopeds', 'Schmale, hohe „Röhrenhäuser“'] },
  { id: 'mo', drive: L, tld: '.mo', tel: '+853', lang: 'Chinesisch, Portugiesisch', script: 'Chinesisch (traditionell)', tips: ['Chinesisch und Portugiesisch auf Schildern', 'Linksverkehr, sehr dicht bebaut, Casinos'] },

  // ───────────── Afrika ─────────────
  { id: 'bw', drive: L, tld: '.bw', tel: '+267', lang: 'Englisch, Setswana', script: 'Lateinisch', tips: ['Linksverkehr, gelbe Randlinien', 'Sehr flach und trocken (Kalahari)'] },
  { id: 'sz', drive: L, tld: '.sz', tel: '+268', lang: 'Englisch, Siswati', script: 'Lateinisch', tips: ['Linksverkehr, gelbe Randlinien wie in Südafrika', 'Hügelig und grün'] },
  { id: 'gh', drive: R, tld: '.gh', tel: '+233', lang: 'Englisch', script: 'Lateinisch', tips: ['Rechtsverkehr – anders als Kenia, Uganda oder Südafrika', 'Rote Erde, tropisch', 'Google-Auto (Gen 3) mit Dachträger und schwarzem Klebeband vorne'] },
  { id: 'ke', drive: L, tld: '.ke', tel: '+254', lang: 'Englisch, Swahili', script: 'Lateinisch', hemi: 'NS', tips: ['Google-Auto oft mit Schnorchel', 'Linksverkehr; Kennzeichen vorne weiß, hinten gelb', 'Rote Erde, Matatus (bunte Minibusse)'] },
  { id: 'ls', drive: L, tld: '.ls', tel: '+266', lang: 'Englisch, Sesotho', script: 'Lateinisch', tips: ['Linksverkehr', 'Sehr gebirgig und baumlos, Rundhütten'] },
  { id: 'mg', drive: R, tld: '.mg', tel: '+261', lang: 'Malagasy, Französisch', script: 'Lateinisch', tips: ['Rechtsverkehr', 'Rote Erde, Reisfelder, Französisch und Malagasy'] },
  { id: 'ng', drive: R, tld: '.ng', tel: '+234', lang: 'Englisch', script: 'Lateinisch', tips: ['Rechtsverkehr', 'Okadas (Motorradtaxis); das Google-Auto ist meist ein sichtbarer Pick-up'] },
  { id: 'rw', drive: R, tld: '.rw', tel: '+250', lang: 'Kinyarwanda, Englisch, Französisch', script: 'Lateinisch', tips: ['Rechtsverkehr', 'Extrem hügelig und grün – „Land der tausend Hügel“'] },
  { id: 'sn', drive: R, tld: '.sn', tel: '+221', lang: 'Französisch', script: 'Lateinisch', tips: ['Rechtsverkehr, Französisch', 'Flach und trocken mit Baobabs', 'Französische Infrastruktur: Poller, Schilder und Linien wie in Frankreich'] },
  { id: 'za', drive: L, tld: '.za', tel: '+27', lang: 'Englisch, Afrikaans u. a.', script: 'Lateinisch', tips: ['Linksverkehr, gelbe Randlinien', 'Englisch und Afrikaans („straat“, „weg“)', 'Kennzeichen je Provinz unterschiedlich'] },
  { id: 'tn', drive: R, tld: '.tn', tel: '+216', lang: 'Arabisch, Französisch', script: 'Arabisch', tips: ['Arabisch und Französisch', 'Olivenhaine, weiß-blaue Häuser'] },
  { id: 'ug', drive: L, tld: '.ug', tel: '+256', lang: 'Englisch', script: 'Lateinisch', hemi: 'NS', tips: ['Linksverkehr', 'Rote Erde, sehr grün, Bananenstauden', 'In Kampala: weißes, kastenförmiges Google-Auto'] },
  { id: 're', drive: R, tld: '.re', tel: '+262', lang: 'Französisch', script: 'Lateinisch', tips: ['Französische Kennzeichen und Schilder – aber tropisch', 'Vulkanisch, steile Küsten'] },

  // ───────────── Nordamerika ─────────────
  { id: 'us', drive: R, tld: '.us', tel: '+1', lang: 'Englisch', script: 'Lateinisch', tips: ['Gelbe Mittellinie, weiße Randlinien', 'Viele Bundesstaaten ohne vorderes Kennzeichen', 'Holzmasten mit zylindrischen Transformatoren'] },
  { id: 'ca', drive: R, tld: '.ca', tel: '+1', lang: 'Englisch, Französisch', script: 'Lateinisch', tips: ['Wie USA, aber Geschwindigkeiten in km/h', 'Québec: Französisch, Stoppschild „ARRÊT“', 'Zweisprachige Schilder in New Brunswick'] },
  { id: 'mx', drive: R, tld: '.mx', tel: '+52', lang: 'Spanisch', script: 'Lateinisch', tips: ['Stoppschild „ALTO“', 'Betonmasten', 'Topes (Bremsschwellen), bunte Häuser, Oxxo-Läden'] },
  { id: 'gt', drive: R, tld: '.gt', tel: '+502', lang: 'Spanisch', script: 'Lateinisch', tips: ['Stoppschild „ALTO“', 'Vulkane, sehr grün, bunte „Chicken Buses“'] },
  { id: 'cr', drive: R, tld: '.cr', tel: '+506', lang: 'Spanisch', script: 'Lateinisch', tips: ['Stoppschild „ALTO“', 'Tropisch und grün, Häuser mit Gittern'] },
  { id: 'pa', drive: R, tld: '.pa', tel: '+507', lang: 'Spanisch', script: 'Lateinisch', tips: ['Stoppschild „ALTO“', 'Tropisch, flach bis hügelig'] },
  { id: 'do', drive: R, tld: '.do', tel: '+1', lang: 'Spanisch', script: 'Lateinisch', tips: ['Stoppschild „PARE“', 'Karibik, Motorradtaxis (Motoconchos)'] },
  { id: 'pr', drive: R, tld: '.pr', tel: '+1', lang: 'Spanisch, Englisch', script: 'Lateinisch', tips: ['US-Schilder, aber auf Spanisch („PARE“)', 'Tempo in Meilen, Entfernungen in Kilometern'] },
  { id: 'gl', drive: R, tld: '.gl', tel: '+299', lang: 'Grönländisch, Dänisch', script: 'Lateinisch', tips: ['Bunte Holzhäuser auf Felsen, keine Bäume', 'Grönländisch mit sehr langen Wörtern'] },
  { id: 'vi', drive: L, tld: '.vi', tel: '+1', lang: 'Englisch', script: 'Lateinisch', tips: ['Linksverkehr – aber mit amerikanischen Linkslenker-Autos', 'Tropische Inseln mit US-Schildern'] },
  { id: 'bm', drive: L, tld: '.bm', tel: '+1', lang: 'Englisch', script: 'Lateinisch', tips: ['Linksverkehr, sehr schmale Straßen', 'Pastellfarbene Häuser mit weißen, gestuften Dächern'] },

  // ───────────── Südamerika ─────────────
  { id: 'ar', drive: R, tld: '.ar', tel: '+54', lang: 'Spanisch', script: 'Lateinisch', tips: ['Stoppschild „PARE“', 'Mercosur-Kennzeichen (weiß mit blauem Band oben)', 'Rot-weiße Chevrons (einzigartig in Amerika)', 'Weite Pampa, im Süden Patagonien'] },
  { id: 'bo', drive: R, tld: '.bo', tel: '+591', lang: 'Spanisch', script: 'Lateinisch', tips: ['Stoppschild „PARE“', 'Hochebene (Altiplano), sehr trocken, Lehmziegelhäuser'] },
  { id: 'br', drive: R, tld: '.br', tel: '+55', lang: 'Portugiesisch', script: 'Lateinisch', tips: ['Portugiesisch (ã, ç, „-ção“) – sonst spricht man in Südamerika Spanisch', 'Mercosur-Kennzeichen', 'Chevrons: gelbe Pfeile auf schwarzem Grund'] },
  { id: 'cl', drive: R, tld: '.cl', tel: '+56', lang: 'Spanisch', script: 'Lateinisch', tips: ['Weiße Mittellinien (sonst in Südamerika meist gelb)', 'Stoppschild „PARE“', 'Lang und schmal: Wüste im Norden, Fjorde im Süden'] },
  { id: 'co', drive: R, tld: '.co', tel: '+57', lang: 'Spanisch', script: 'Lateinisch', hemi: 'NS', tips: ['Gelbe Kennzeichen', 'Stoppschild „PARE“', 'Sehr gebirgig (Anden), grün'] },
  { id: 'ec', drive: R, tld: '.ec', tel: '+593', lang: 'Spanisch', script: 'Lateinisch', hemi: 'NS', tips: ['Stoppschild „PARE“', 'Anden, Küstenebene und Regenwald auf engem Raum'] },
  { id: 'pe', drive: R, tld: '.pe', tel: '+51', lang: 'Spanisch', script: 'Lateinisch', tips: ['Stoppschild „PARE“', 'Küstenwüste, Anden, Mototaxis', 'Auf Bergstraßen oft nur weiße Randlinien ohne Mittellinie'] },
  { id: 'uy', drive: R, tld: '.uy', tel: '+598', lang: 'Spanisch', script: 'Lateinisch', tips: ['Dreifache Mittellinie: zwei gelbe Linien mit weißen Strichen dazwischen', 'Stoppschild „PARE“', 'Flach bis leicht hügelig, Weideland, schlichte weiße Kennzeichen'] },

  // ───────────── Ozeanien ─────────────
  { id: 'au', drive: L, tld: '.au', tel: '+61', lang: 'Englisch', script: 'Lateinisch', tips: ['Linksverkehr, weiße Linien', 'Rote Erde, Eukalyptus', 'Weiße Leitpfosten mit rotem Reflektor'] },
  { id: 'nz', drive: L, tld: '.nz', tel: '+64', lang: 'Englisch, Māori', script: 'Lateinisch', tips: ['Linksverkehr', 'Sehr grün und hügelig, Schafweiden, Farne', 'Leitpfosten mit rotem Band'] },
];

export const COUNTRY_BY_ID = Object.fromEntries(COUNTRIES.map((c) => [c.id, c]));
