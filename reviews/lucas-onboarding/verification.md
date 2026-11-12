# Prüfung · Designvergleich · 12. November 2026

## Quell- und Patchprüfung

- `design-review.patch` mit `git apply --check` gegen LucasKi9000/PULS b9537cc0d7adb739c289b8f0a80c3433324fb37a geprüft: erfolgreich. Patch nicht im Quellrepository angewendet.
- Geänderte feature-ui.js, Vergleichsskript und Generator mit `node --check` geprüft.
- Vorgeschlagene Datenansicht ausgeführt: leere Asset-Liste blendet den Summary-Container beim Onboarding aus; gefüllte Liste zeigt Asset und Entfernen-Aktion weiterhin. Verhalten außerhalb des Onboardings bleibt erhalten. Bank-, CSV- und manuelle Eingabeansicht bleiben renderbar.

## Browserprüfung

- Alle fünf Desktop-Ansichten visuell verglichen und unter `screenshots/` gesichert.
- Beide Frames erhalten feste, gleiche Viewports; ihre Skalierung passt sich gemeinsam an die verfügbare Spaltenbreite an. Desktop-Body mit 900 px Breite und scrollWidth 900 px geprüft.
- Datenquellen und Lebenspläne auch bei Mobilbreite verglichen: Body 390 px und scrollWidth 390 px, kein horizontaler Überlauf. Screenshots liegen bei.
- Ganze Karte „Move home“ rechts angeklickt: Auswahl erscheint auch links. Bereits gewählte Karte bleibt aktiv (Mehrfachauswahl).
- Zeitpunkt rechts per Leertaste ausgewählt: Original links übernimmt denselben Radiowert; eine ausgewählte Antwort.
- Zweite Priorität rechts gewählt: zwei ausgewählte Antworten auch im Original links.
- Ausgewählte Karten rechts dunkelblau, weiße Beschriftung, keine sichtbaren Checkboxen/Radiokreise. Native Inputs bleiben im Accessibility-Baum.
- Datenquellen rechts: drei große Verbindungsmöglichkeiten, keine leere Asset-Karte, zentraler Score-Button und erhaltener Datenhinweis.

## Grenzen

Bedienbarer Designprototyp, keine vollständige App-Kopie. Keine echte Bankverbindung, kein Upload und keine Score-Berechnung ausgeführt. Der Serverstand unter 130.83.85.181 wurde nicht verändert oder auf Pixelgleichheit geprüft. Das Original wird aus dem angegebenen Repository-Stand erzeugt; dieser hat inzwischen vier Fortschrittsschritte und elf Lebenspläne.
