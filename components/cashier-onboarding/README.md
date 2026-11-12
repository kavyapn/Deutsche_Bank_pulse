# Cashier-Mock mit aktuellem PULS-Onboarding

[PULS_Cashier_Onboarding.html](PULS_Cashier_Onboarding.html) im Browser öffnen. Die Datei enthält den bereitgestellten Cashier-Mock, die wiederverwendbare HTML-Bankkarte, den aktuellen PULS-Frontend-Code und seine Demo-Bankdaten. Kein Installieren und kein Backend nötig. Die ursprüngliche Oberfläche im Display wird aus dem Originalcode erzeugt, nicht nachgebaut.

## Ablauf durchspielen

1. Auf dem Display **Insert a bank card** wählen.
2. Eine originale Demo-Karte auswählen: Lena, Alex oder Maya.
3. Die Deutsche-Bank-Karte dreht sich und wird in den Hardware-Schlitz eingezogen.
4. Vier beliebige Demo-Ziffern auf dem Metall-Keypad eingeben und mit dem grünen Haken bestätigen. **C** löscht die Eingabe. Alternativ führt **Enter PIN** vier animierte Tastendrücke aus.
5. Im Display mit dem Original-Onboarding fortfahren: Einführung → Lebenspläne → je drei Fragen pro gewähltem Plan → Themenprioritäten → optionale Datenquellen → PULS-Score.
6. **Restart original onboarding** oder **Reload PULS** setzt Display, Kartenanimation und Keypad zurück.

Das Keypad zählt nur Demo-Tastendrücke. Es prüft oder speichert keine echte PIN. Das bestehende native Enter auf dem Display bleibt Teil der Original-Anwendung.

## Verwendeter Stand

- Quelle: [LucasKi9000/PULS](https://github.com/LucasKi9000/PULS)
- Gepinnter Commit: [`f99a503617a1687e9c627d30e802822ebf2ba2aa`](https://github.com/LucasKi9000/PULS/tree/f99a503617a1687e9c627d30e802822ebf2ba2aa)
- Alle 39 Dateien des Frontends vor dem Bündeln anhand ihrer Git-Blob-Hashes verifiziert. Die ursprünglichen Quelltexte werden nicht verändert. Metadaten: [source.json](source.json).
- Separat öffnbarer Frontend-Export: [PULS_Onboarding_Original.html](PULS_Onboarding_Original.html).
- Ausgangsmock unverändert archiviert: [cashier-template.html](cashier-template.html).

Die früheren Designvorschläge aus dem Review-Ordner werden hier nicht auf das aktuelle Original angewendet. Enthalten ist ausdrücklich das aktuelle Onboarding von GitHub, einschließlich seiner Skip-Option und aller Fragen und Auswahlregeln.

## Aufbau

`cashier-controller.js` verbindet Kartenauswahl, Einsteckanimation und Hardware-Keypad mit den vorhandenen Demo-Aktionen des eingebetteten Frontends. Ein Overlay blendet die Karte ab der realen Schlitzmitte aus. Nach vollständigem Einzug wird die ursprüngliche Kartenauswahl weitergegeben und der PIN-Schritt geöffnet. Die PIN-Simulation füllt dessen vorhandene Punkte und löst die originale Enter-Aktion aus.

Das Frontend läuft im selben Dokumentursprung in einem `srcdoc`-Iframe. SVG/Bilder, Styles, gebündeltes JavaScript und Demo-JSON sind eingebettet. Ein kleiner Export-Adapter liefert die originalen lokalen Demo-Daten statt einer Netzwerk-API und erlaubt den ursprünglichen Moduswechsel auch im eingebetteten Dokument. Der Live-KI-Coach ist nicht verbunden; vorhandene Demo-Antworten bleiben verfügbar. Inter wird wie im Original über Google Fonts geladen, offline greift die vorhandene Systemschrift.

## Neu erzeugen

```sh
node build.mjs /pfad/zu/Lucas-PULS f99a503617a1687e9c627d30e802822ebf2ba2aa
```

Die Quelldateien werden nur aus Git gelesen. `build.mjs` verwendet esbuild 0.25.12; generierte Quellkopien liegen ignoriert in `.runtime/`. Das Original-Repository und dessen Live-Website werden nicht verändert.

## Prüfung

[verification.json](verification.json) dokumentiert die Browserprüfung: Alex mit automatischer PIN, zwei Lebensplänen und allen sechs Fragen, Prioritäten, Demo-Bankimport und Score; Lena mit manueller PIN inklusive Löschen und der neuen Skip-Option; Maya mit Karteneinzug bei 390 px Breite. Neustart während Karten- und PIN-Animation geprüft. Außenansicht 390 px und Display 320 px breit, jeweils ohne horizontalen Überlauf.

Getestet über lokalen HTTP-Server; direkter file://-Aufruf ist im In-App-Testbrowser nicht erlaubt und wurde nicht geprüft. Keine echte Bankverbindung oder PIN-Prüfung, kein physischer Automat getestet.

## Randloser Startbildschirm

`cashier-startscreen.css` entfernt ausschließlich im Cashier-Startzustand die weißen Außenabstände, die runden Ecken der blauen Startfläche und die darunterliegende Fußzeile. Die Startfläche füllt das Display unter dem Bank-Header. Alle Folgeschritte und der separat exportierte Original-Stand behalten ihr Layout.

Im Browser geprüft: Startfläche beginnt bei x=0, füllt die 397 px breite Displayfläche, Eckenradius 0. Kartenauswahl erreicht weiterhin den originalen Intake-Zustand; Neustart stellt die randlose Startfläche wieder her.

## PIN-Bereich und externe Kartenauswahl

Im PIN-Schritt sind Überschrift, Erklärung und PIN-Anzeige zentriert. Die ursprünglichen PIN-Aktionsbuttons im Display werden nur in diesem Schritt ausgeblendet. „Enter PIN“ und „Choose another card“ stehen in der äußeren Mock-Steuerung. Der Kartenwechsel löst weiterhin die originale Kartenauswahl aus und setzt den Zustand der Hardware-Simulation zurück. Der neue äußere Button wird nur im PIN-Schritt angezeigt.

PIN-Layout geprüft: Anzeige und Display haben am Desktop dieselbe horizontale Mitte (198,5 px), bei 320 px Displaybreite ebenfalls (160 px). Äußerer Kartenwechsel und äußere automatische PIN funktionieren; danach erscheint wieder die unveränderte Einführung.
