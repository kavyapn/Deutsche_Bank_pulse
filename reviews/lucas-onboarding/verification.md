# Prüfung · Vollständige Anwendungen · 12. November 2026

- `git ls-remote origin HEAD` liefert b9537cc0d7adb739c289b8f0a80c3433324fb37a: entspricht dem verwendeten Checkout.
- Original aus `git archive HEAD dist` erzeugt. Alle 39 Dateien anhand ihrer Git-Blob-Hashes byteweise verifiziert. Bericht: `full-app-verification.json`.
- Vorschlag durch Kopieren des Originals und Anwenden von `design-review.patch` erzeugt. Exakt drei veränderte Dateien: branch.js, branch.css, feature-ui.js. Alle anderen Dateien identisch.
- Keine eigenen Renderer, rekonstruierten Fragen oder gefälschten Bildschirmzustände mehr in der Vergleichsoberfläche. Frühere statische Nachbauten entfernt.
- Vollständiger Filialablauf in beiden echten Anwendungen durchlaufen: Startseite → Karte einlegen → Alex → simulierte PIN → Einführung → Lebenspläne → drei Fragen → Prioritäten → Datenquellen.
- Original und Vorschlag laden die lokalen Demo-Bankdaten und erreichen die echte Datenquellen-Ansicht.
- Datenquellen nebeneinander am Seitenanfang visuell geprüft: Originalkarte links, umgestaltete Auswahlmöglichkeiten und mittiger Score-Button rechts. Screenshot: `screenshots/sources.jpg`.
- Generator und Vergleichsskript syntaktisch geprüft. Patch wurde nur auf die generierte Vorschlagskopie angewendet. Lucas’ Quellcheckout blieb unverändert.

## Grenzen

Frontendvergleich mit statischem lokalem Server. Kein KI-Backend gestartet. Keine produktive Bankverbindung und kein produktiver Dienst verändert. Gleicher lokaler Ursprung bedeutet gemeinsamen Local Storage für das ursprüngliche Mobile-Banking-Persistenzverhalten; der geprüfte Filialablauf verwaltet seinen Zustand separat pro Fenster. Die Serverversion unter 130.83.85.181 kann vom geprüften GitHub-Commit abweichen. Desktop-Rahmen 900 × 900 px, Mobil-Rahmen 390 × 1200 px; beide Seiten werden bei Platzmangel gleichmäßig skaliert.
