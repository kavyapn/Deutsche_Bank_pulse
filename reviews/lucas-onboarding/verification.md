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

## Spiegelung und zentrierte Einführung

- Vollständigen Filialablauf erneut durchlaufen, dabei pro Schritt ausschließlich eine Seite bedient. Abwechselnd links und rechts: Karte, PIN, Einführung, Lebensplan, Einzelantwort, Mehrfachantwort, Vorbereitung, Prioritäten, Datenquellen. Gegenüberliegende Anwendung folgt demselben Ablauf. Keine doppelte Formularnavigation.
- Native Auswahlwerte werden gespiegelt, statt durch Label- und Input-Klicks doppelt umzuschalten. Zielereignisse sind gegen Rückkopplung geschützt.
- Texteingaben rechts im manuellen Formular geprüft: Name „Review demo“ und Wert „100“ erscheinen auch links. Formular nicht abgeschickt; anschließend beide Anwendungen neu gestartet.
- Originaldateien bleiben byteweise unverändert. Spiegelung liegt ausschließlich in comparison.js, das Event-Listener an beide Dokumente bindet. Die Vorschau zeigt einen Hinweis, wenn eine Aktion nicht zugeordnet werden kann.
- Zentrierung am Desktop gemessen: Zwischenraum der Originalkästen y=376–386 px, neue Blockmitte y=385 px. Erklärung horizontal zentriert; Button mindestens 56 px hoch und 280 px breit (bei ausreichend Platz).
- Die Rahmen verhindern mit overflow:clip, dass die Browser-Fokusbewegung eine Vergleichsspalte innerhalb ihres Rahmens verschiebt.
- Nicht alle denkbaren App-Interaktionen und Dateiimporte geprüft. Verifiziert sind der obige Filialablauf, Auswahlen, Formularnavigation und Texteingaben.

## HTML-Export

- JavaScript mit esbuild gebündelt, Styles/Bilder und unveränderte Demo-JSON-Daten eingebettet. Kein externer JavaScript-Modulimport und keine relativen Bildpfade mehr.
- Inline-JavaScript mit `node --check` geprüft.
- Export im Browser geöffnet und Start → Alex-Karte → simulierte PIN → zentrierte Einführung erfolgreich durchlaufen. Demo-Daten werden aus dem HTML geladen.
- Direkter file://-Aufruf nicht separat automatisiert getestet; Prüfung über lokalen HTTP-Server. Google Fonts bleibt wie im Original eine optionale Netzwerkabhängigkeit.

## Bankverbindung im Fokus

- Einzelne HTML-Datei neu exportiert und bis zur echten Datenquellen-Seite durchlaufen.
- Visuell geprüft: „Connect a bank“ dunkelblau, volle Breite und 72 px hoch; darunter „Import a CSV“ und „Add manually“ nebeneinander, jeweils 48 px hoch.
- Am Desktop gemessen: Bank 680 px breit; Alternativen jeweils 335 px breit. Aktionskennungen und Formularlogik unverändert. Screenshot: `screenshots/bank-primary.jpg`.

## Reduzierte Alternativen

- HTML neu exportiert und den vollständigen Filialablauf bis zu den Datenquellen durchlaufen.
- Bankverbindung als 68 px hohe Hauptaktion mit linksbündigem Text und Pfeil rechts visuell geprüft. CSV und manuelle Eingabe sind kompakte Textbuttons, behalten aber mindestens 44 px Bedienhöhe. Keine zusätzlichen Container.
- Aktionskennungen und bestehende Formulare unverändert. Screenshot: `screenshots/bank-modern.jpg`.
