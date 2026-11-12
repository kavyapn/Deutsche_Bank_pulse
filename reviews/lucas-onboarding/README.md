# PULS · Echter Strukturvergleich

Links läuft die **vollständige, unveränderte Frontend-Anwendung** aus [LucasKi9000/PULS, b9537cc](https://github.com/LucasKi9000/PULS/tree/b9537cc0d7adb739c289b8f0a80c3433324fb37a). Rechts läuft dieselbe Anwendung mit `design-review.patch`. Keine nachgebauten Frage-Templates und keine ersetzten Bildschirmstrukturen. Die früheren statischen Nachbauten wurden entfernt.

Der Quellstand wurde am 12. November 2026 gegen GitHub HEAD geprüft. Alle 39 Dateien in `dist/` werden aus einem Git-Archiv erzeugt und anhand ihrer Git-Blob-Hashes byteweise verifiziert. Rechts dürfen ausschließlich `dist/branch.js`, `dist/branch.css` und `dist/feature-ui.js` abweichen. Nachweis: [full-app-verification.json](full-app-verification.json).

## Starten

```sh
node build-full-apps.mjs /pfad/zu/Lucas-PULS
python3 -m http.server 8012 --bind 127.0.0.1
```

Aus diesem Review-Ordner ausführen. Dann http://localhost:8012/preview.html öffnen. Der Generator schreibt nur in den ignorierten Ordner `.runtime/`; das Quellrepository bleibt unverändert. Die vollständigen App-Dateien werden nicht als zweiter Quellbestand committed.

Beide Anwendungen sind vollständig vorhanden. Die Vergleichsoberfläche spiegelt Klicks, Formulareingaben, Auswahlen und Navigation in beide Richtungen, ohne die Originaldateien zu verändern. Bediene eine Seite; die andere folgt. Die Spiegelung verwendet stabile Aktionskennungen und Formularfelder; unterschiedliche Beschriftungen der Einführungsbuttons funktionieren ebenfalls. Desktop: jeweils 900 × 900 px. Mobil: jeweils 390 × 1200 px. Bei weniger Platz werden beide gleichmäßig verkleinert. Die Links „groß öffnen“ zeigen die vollständigen Apps ohne Vergleichsrahmen. Es gibt keine Vorschau-Navigation mehr, die erfundene Bildschirmzustände erzeugt. „Beide neu starten“ setzt die Ansichten bei Bedarf wieder auf denselben Anfang.

Die Demo-Bankdaten werden unverändert aus den mitgelieferten JSON-Dateien geladen. Es läuft nur ein statischer Server, kein KI-Backend. Die Anwendungen liegen auf demselben lokalen Ursprung: Bei Tests der Mobile-Banking-Speicherung teilen sie sich den ursprünglichen Local-Storage-Schlüssel. Der hier geprüfte Filialablauf hält seinen Zustand je Anwendung getrennt im Speicher. Kein produktiver Dienst wurde verändert.

## Änderungen mit Kommentar

| ID | Dein Vorschlag | Grund |
| --- | --- | --- |
| REVIEW-01 | `Start with your plans` statt `Get to know PULS`. | Die Überschrift benennt den nächsten Schritt. |
| REVIEW-02 | Ein konkreter Satz statt Definition und zwei Erklärungskästen. | Weniger allgemeine Aussagen, klarer Ablauf. |
| REVIEW-03 | `Choose your plans` als Buttontext. | Greift die Überschrift auf. |
| REVIEW-04 | Ganze Auswahlkarten, dunkelblauer ausgewählter Zustand, weiße Schrift, keine sichtbaren Checkboxen oder Radiokreise. | Auswahl durch die gesamte Fläche erkennbar. Native Inputs bleiben für Tastatur, Screenreader und Formularlogik vorhanden. Einzelauswahl und Mehrfachauswahl behalten ihre Regeln. |
| REVIEW-05 | Große Verbindungsmöglichkeiten, leerer Asset-Container entfällt beim Onboarding, Score-Button außerhalb und mittig. | Verbindungen und nächste Aktion stehen im Fokus. Bereits hinzugefügte Assets bleiben im tatsächlichen Patch sichtbar. Datenbasis und Speicherhinweis bleiben erhalten. |
| REVIEW-06 | Bedienung im Vergleich beidseitig spiegeln. | Die andere Version folgt demselben Ablauf. Die Event-Weiterleitung liegt nur in der Vergleichsoberfläche, nicht in der Anwendung. |
| REVIEW-07 | Einführung und Erklärung mittig; größerer, zentrierter „Choose your plans“-Button. | Der Inhaltsblock liegt ungefähr auf Höhe des Zwischenraums der beiden Originalkästen. Desktop gemessen: Original-Zwischenraum bei y=381 px, Blockmitte bei y=385 px. |
| REVIEW-08 | „Connect a bank“ als dunkelblaue Hauptaktion mit linksbündigem Text und Pfeil rechts; CSV und manuelle Eingabe als kompakte Textbuttons darunter. | Die Bankverbindung steht visuell im Fokus. |

## Selbst übernehmen

Der Gesamtpatch betrifft drei Dateien und enthält die Einführung bereits. Nicht zusätzlich `onboarding.patch` anwenden.

```sh
git apply --check /pfad/zu/design-review.patch
git apply /pfad/zu/design-review.patch
git diff -- dist/branch.js dist/branch.css dist/feature-ui.js
```

Die laufende Website und Lucas’ Repository bleiben unverändert. Dieser Review liegt ausschließlich im Branch `codex/puls-onboarding-review` von `kavyapn/Deutsche_Bank_pulse`.

Prüfungen: [verification.md](verification.md). Die Dateien in `screenshots/` zeigen die tatsächlich laufenden vollständigen Anwendungen.

## Einzelne HTML-Datei

[PULS_Deine_Aenderungen.html](PULS_Deine_Aenderungen.html) enthält die vollständige geänderte Frontend-Version als eine Datei: JavaScript, Styles, Logo, Maskottchen und Demo-Bankdaten sind eingebettet. Direkt im Browser öffnen. Inter wird wie im Original über Google Fonts geladen; ohne Internet greift die ursprüngliche Systemschrift als Ersatz. Kein KI-Backend enthalten, der vorhandene Demo-Coach bleibt nutzbar.

Neu erzeugen: `node export-html.mjs`, nachdem `build-full-apps.mjs` gelaufen ist. Der Export verwendet esbuild 0.25.12 und verändert die UI-Quellkopie nicht.
