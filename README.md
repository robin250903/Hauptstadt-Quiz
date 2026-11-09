# Hauptstadt-Quiz 🌍

Eine Web-App zum Lernen der Hauptstädte aller Länder und Gebiete der Welt – optimiert fürs Handy
und als App installierbar (funktioniert danach auch offline).

## So funktioniert's

- **Kategorien:** Europa, Asien, Afrika, Nordamerika, Südamerika, Ozeanien – jeweils „Nur Staaten“
  oder „Mit Gebieten“. Dazu drei weltweite Modi:
  - **Die ganze Welt** – alle 254 Länder und Gebiete
  - **Souveräne Staaten** – 197 Staaten (193 UN-Mitglieder + Vatikanstadt, Palästina, Kosovo, Taiwan)
  - **Besondere Gebiete** – 57 Überseegebiete, abhängige und umstrittene Gebiete (z. B. Grönland,
    Färöer, Réunion, Westsahara, Transnistrien)
- **Jede Frage** zeigt einen Kartenausschnitt mit dem markierten Land, einem Pin an der Hauptstadt,
  einem kleinen Globus zur Orientierung und der Flagge. Die Karte lässt sich verschieben und zoomen.
- **Tippfehler zählen:** Ist die Hauptstadt erkennbar, aber falsch geschrieben, gilt die Antwort als
  richtig. Die Eingabe wird unterstrichen, die falschen Buchstaben markiert und die richtige
  Schreibweise angezeigt. Akzente, Groß-/Kleinschreibung, Bindestriche und ä/ae sind egal.
  Auch englische und landessprachliche Namen werden akzeptiert (z. B. „Vienna“, „Beijing“).
- **Anzeige:** Fortschritt (z. B. 27/41), Anzahl richtig, Quote in % und Zeit.
- **Bestenliste:** Die fünf besten Versuche je Kategorie werden gespeichert (beste Quote, bei
  Gleichstand schnellste Zeit).
- **Pausieren:** Ein angefangenes Quiz wird automatisch gespeichert und kann später fortgesetzt werden.
- **Fehler üben:** Nach einer Runde können die falsch beantworteten Fragen gezielt wiederholt werden.

## Entwicklung

```bash
npm install
npm run dev        # Entwicklungsserver
npm test           # Tests der Antwortprüfung und der Daten
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
- Flaggen: [flag-icons](https://github.com/lipis/flag-icons) (MIT-Lizenz); Flaggen von Somaliland,
  Transnistrien, Abchasien, Südossetien, Nordzypern, Saba und Sint Eustatius vereinfacht selbst gezeichnet
