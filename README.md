# Hauptstadt-Quiz 🌍

Eine Web-App zum Lernen der Hauptstädte aller Länder und Gebiete der Welt – optimiert fürs Handy
und als App installierbar (funktioniert danach auch offline).

## So funktioniert's

- **Kategorien:** Europa, Asien, Afrika, Nordamerika, Südamerika, Ozeanien – jeweils „Nur Staaten“
  oder „Mit Gebieten“. Dazu drei weltweite Modi:
  - **Die ganze Welt** – alle 279 Länder und Gebiete
  - **Souveräne Staaten** – 197 Staaten (193 UN-Mitglieder + Vatikanstadt, Palästina, Kosovo, Taiwan)
  - **Besondere Gebiete** – 82 Landesteile, Überseegebiete, autonome und umstrittene Gebiete
    (z. B. England, Grönland, Färöer, Réunion, Kanarische Inseln, Sansibar, Irakisch-Kurdistan,
    Westsahara, Transnistrien, Krim)

  Nicht enthalten sind Gebiete ohne Hauptstadt oder Verwaltungssitz (z. B. Antarktis, Bouvetinsel,
  Clipperton, Heard und McDonaldinseln, die unbewohnten US-Außeninseln) sowie gewöhnliche
  Bundesländer, Provinzen und Teilrepubliken (z. B. Bayern, Texas, Tatarstan, Tibet).
- **Jede Frage** zeigt einen Kartenausschnitt mit dem markierten Land, einem Pin an der Hauptstadt,
  einem kleinen Globus zur Orientierung und der Flagge. Die Karte lässt sich verschieben und zoomen.
- **Tippfehler zählen:** Ist die Hauptstadt erkennbar, aber falsch geschrieben, gilt die Antwort als
  richtig. Die Eingabe wird unterstrichen, die falschen Buchstaben markiert und die richtige
  Schreibweise angezeigt. Akzente, Groß-/Kleinschreibung, Bindestriche und ä/ae sind egal.
  Auch englische und landessprachliche Namen werden akzeptiert (z. B. „Vienna“, „Beijing“).
- **Anzeige:** Fortschritt (z. B. 27/41), Anzahl richtig, Quote in % und Zeit.
- **Weiter per Knopfdruck:** Nach jeder Antwort bleibt die Auflösung stehen, bis man auf „Weiter“ tippt.
  In dieser Zeit ist die Uhr angehalten – gemessen wird nur die Zeit zum Antworten.
- **Bestenliste:** Die fünf besten Versuche je Kategorie werden gespeichert (beste Quote, bei
  Gleichstand schnellste Zeit).
- **Pausieren:** Ein angefangenes Quiz wird automatisch gespeichert und kann später fortgesetzt werden.
- **Fehler üben:** Nach einer Runde können die falsch beantworteten Fragen gezielt wiederholt werden.

## Geo-Trainer für GeoGuessr 🧭

Unter `geo/` liegt eine zweite App: der **Geo-Trainer**. Sie hilft, Länder in GeoGuessr an typischen
Merkmalen zu erkennen. Nach dem Veröffentlichen ist sie unter `…/geo/` erreichbar und vom
Hauptstadt-Quiz aus verlinkt.

- **Grundlagen:** Vorgehen, Sonnenstand, Fahrseite, Vegetation und Boden, Kamera und Google-Auto, Bauweise, Schilder.
- **10 Kategorien** mit Lernseite (Erklärung, „Darauf achten“, Lernkarten mit Zeichnung) und Quiz:
  Fahrseite, Straßenlinien, Poller, Strommasten und Mastspitzen, Kennzeichen, Verkehrsschilder (inkl.
  Schriftarten), Sprache und Buchstaben, Schriften (Alphabete), Domains, Vorwahlen.
- **Länder und Regionen:** 99 Länder mit Steckbrief (Fahrseite, Domain, Vorwahl, Sprache, Schrift, wichtigste
  Merkmale). Für 24 Länder gibt es zusätzlich eine Karte mit Regionen und Hinweisen, wie man die Region
  erkennt (z. B. USA: gebirgiger Westen, flache Great Plains, rote Erde im Südosten). Dazu je ein Regionen-Quiz.
- **Quiz:** Multiple Choice mit Zeichnung und Erklärung nach jeder Antwort, Mix-Quiz über alle Kategorien,
  Bestenliste (Top 5), Pausieren und Fortsetzen, Fehler üben und Lernfortschritt pro Kategorie.
- **Echte Fotos** von [Wikimedia Commons](https://commons.wikimedia.org/) (freie Lizenzen, Urheber und Lizenz
  stehen unter jedem Bild und auf der Seite „Bildnachweise“). Die Bilder liegen in `public/geo/img/`, die
  Angaben dazu in `geo/src/data/photos.js`. Wo es kein passendes freies Foto gibt, zeigt die App eine
  vereinfachte Zeichnung aus `geo/src/visuals.js`.

- **Street View:** 67 Lernkarten verlinken auf einen echten Street-View-Ort, an dem das Merkmal zu sehen ist
  (Orte aus den Länder-Guides von Plonk It, gespeichert in `geo/src/data/streetview.js`). Mit einem
  Schlüssel für die Google **Maps Embed API** in `geo/src/config.js` wird Street View direkt in der App
  angezeigt – den Schlüssel in der Google Cloud Console auf die eigene Website und die Maps Embed API
  beschränken. Ohne Schlüssel öffnet der Knopf Google Maps.

Die Lerninhalte sind mit den Guides von [Plonk It](https://www.plonkit.net/) (CC BY-NC-SA 4.0) und
[GeoHints](https://geohints.com/) abgeglichen; die Texte sind eigene Zusammenfassungen.
Die Lerninhalte stehen in `geo/src/data/` (`countries.js`, `categories.js`, `regions.js`, `basics.js`).
GeoGuessr-Merkmale ändern sich gelegentlich (neue Kamerafahrten, neue Poller), deshalb sind die Inhalte
bewusst einfach anpassbar gehalten.

## Entwicklung

```bash
npm install
npm run dev        # Entwicklungsserver (Geo-Trainer unter /geo/)
npm test           # Tests der Antwortprüfung, der Daten und der Geo-Trainer-Fragen
npm run build      # fertige App nach dist/
```

Länder, Hauptstädte und erlaubte Schreibweisen stehen in `src/data/entries.js`.
Nach Änderungen an den Daten `npm run prepare-data` ausführen – das prüft, ob es für jeden Eintrag
eine Kartenform und eine Flagge gibt, und erzeugt die Dateien in `public/data` und `public/flags`.

## Veröffentlichen

Bei jedem Push auf `main` baut GitHub Actions die App und veröffentlicht sie über GitHub Pages.
Einmalig nötig: im Repository unter **Settings → Pages → Build and deployment → Source**
„GitHub Actions“ auswählen.

## Quellen

- Kartendaten: [Natural Earth](https://www.naturalearthdata.com/) (gemeinfrei),
  über [world-atlas](https://github.com/topojson/world-atlas)
- Flaggen: [flag-icons](https://github.com/lipis/flag-icons) (MIT-Lizenz); Ceuta und Melilla aus
  [region-flags](https://github.com/fonttools/region-flags) (gemeinfrei); die übrigen Gebietsflaggen in
  `scripts/flags` sind vereinfacht selbst gezeichnet
- Zusätzliche Gebietsformen (Landesteile, autonome Regionen) stammen ebenfalls aus Natural Earth und
  wurden mit `scripts/extract-extra.mjs` nach `scripts/source/extra.geojson` übernommen
