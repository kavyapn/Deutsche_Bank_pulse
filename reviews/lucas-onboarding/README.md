# PULS · Sein Design / Dein Design

Designvergleich für Tobias. Quelle: [LucasKi9000/PULS, b9537cc](https://github.com/LucasKi9000/PULS/tree/b9537cc0d7adb739c289b8f0a80c3433324fb37a). Die Vorschläge liegen getrennt im Branch `codex/puls-onboarding-review` von `kavyapn/Deutsche_Bank_pulse`. Lucas’ Repository und seine laufende Website wurden nicht verändert.

## Direkt vergleichen

`preview.html` über einen lokalen HTTP-Server öffnen, zum Beispiel aus diesem Ordner:

```sh
python3 -m http.server 8012
```

Dann http://localhost:8012/preview.html öffnen. Das Menü bietet fünf Ansichten: Einführung, Lebenspläne, Zeitpunkt, Mehrfachantworten und Datenquellen. Links Original, rechts Vorschlag. Beide Ansichten haben immer dieselben Viewportmaße: Desktop 900 × 900 px oder Mobil 390 × 1200 px. Die Ansichten werden proportional verkleinert, wenn der Platz für beide nebeneinander nicht reicht. Auswahlaktionen werden in beide Richtungen synchronisiert. So sieht man dieselben Antworten in beiden Designs. Quellen kopiert aus dem genannten Commit, kein Abgleich mit der Serverversion. Diese hat im Screenshot drei statt vier Fortschrittsschritte und weniger Lebenspläne.

Der Vergleich ist ein bedienbarer Designprototyp. Weiterleitung, Bankverbindung, CSV-Import und Score-Aktion führen keine App-Funktionen aus. Formulare werden nicht abgeschickt. Der Patch behält dagegen die Original-Aktionskennungen und die echte Formularsemantik bei.

## Änderungen mit Kommentar

| ID | Dein Vorschlag | Grund |
| --- | --- | --- |
| REVIEW-01 | `Start with your plans` statt `Get to know PULS`. | Die Überschrift benennt den nächsten Schritt. |
| REVIEW-02 | Ein konkreter Satz statt Definition und zwei Erklärungskästen. | Weniger allgemeine Aussagen, klarer Ablauf. |
| REVIEW-03 | `Choose your plans` als Buttontext. | Greift die Überschrift auf. |
| REVIEW-04 | Ganze Auswahlkarten, dunkelblauer ausgewählter Zustand, weiße Schrift, keine sichtbaren Checkboxen oder Radiokreise. | Auswahl durch die gesamte Fläche erkennbar. Native Inputs bleiben für Tastatur, Screenreader und Formularlogik vorhanden. Einzelauswahl und Mehrfachauswahl behalten ihre Regeln. |
| REVIEW-05 | Große Verbindungsmöglichkeiten, leerer Asset-Container entfällt beim Onboarding, Score-Button außerhalb und mittig. | Verbindungen und nächste Aktion stehen im Fokus. Bereits hinzugefügte Assets bleiben im tatsächlichen Patch sichtbar. Datenbasis und Speicherhinweis bleiben erhalten. |
| REVIEW-06 | Synchronisierte Auswahl in der Gegenüberstellung. | Vergleichbare Zustände. Nur Vorschau-Code, kein Bestandteil des Anwendungspatches. |

## Selbst übernehmen

`design-review.patch` enthält alle vorgeschlagenen Änderungen für `dist/branch.js`, `dist/branch.css` und `dist/feature-ui.js`. Er verändert die ursprüngliche Anwendung in diesem Review-Repository nicht. Im lokalen Lucas-Checkout prüfen und anschließend übernehmen:

```sh
git apply --check /pfad/zu/design-review.patch
git apply /pfad/zu/design-review.patch
git diff -- dist/branch.js dist/branch.css dist/feature-ui.js
```

`onboarding.patch` ist weiterhin der frühere, ausschließlich auf die Einführung begrenzte Patch. **Nur einen der beiden Patches anwenden**, da der Gesamtpatch die Einführung bereits enthält. `data-view.proposed.js` zeigt die kommentierte Ersatzfunktion einzeln. Die CSS-Vorschläge stehen in `proposal.css` und werden vom Gesamtpatch in `dist/branch.css` ergänzt.

## Herkunft und Prüfung

Die Vorschau verwendet die unveränderten Quell-CSS-Regeln und das Original-Logo. Original-Einführung, Lebenspläne und Datenansicht werden aus den Quellfunktionen erzeugt; die beiden Fragen sind auf Grundlage der dortigen Vorlage und Auswahltexte aufgebaut. Nur die rechte Seite erhält die vorgeschlagenen Texte, Styles und das neue Datenquellen-Layout. Google Fonts wird wie im Original verwendet, offline greift die vorhandene Ersatzschrift.

`node build-comparison.mjs /pfad/zu/Lucas-PULS` erzeugt Ansichts-Daten, Frame-Dateien und Vorschlags-CSS neu. Die Vergleichsoberfläche selbst wird in `preview.html`, `comparison.css` und `comparison.js` gepflegt. Das Skript schreibt ausschließlich in diesen Review-Ordner.

Browserprüfungen, Grenzen und Vergleichsbilder stehen in [verification.md](verification.md) und [screenshots](screenshots/).
