# PULS: kommentierter Onboarding-Vorschlag

Dieser Ordner enthält einen Vorschlag für **LucasKi9000/PULS**, keine Änderung an der Anwendung in diesem Repository. Lucas’ Repository und die laufende Website wurden nicht verändert. Der Vorschlag wird separat in `kavyapn/Deutsche_Bank_pulse` aufbewahrt, damit Tobias ihn selbst übernehmen kann.

Quelle: https://github.com/LucasKi9000/PULS/tree/b9537cc0d7adb739c289b8f0a80c3433324fb37a

## Vorschau

`preview.html` im Browser öffnen: Vorher und Vorschlag nebeneinander. `after.html` zeigt den Vorschlag allein und passt sich an die Fensterbreite an. Die Navigation ist in diesen statischen Vorschauen deaktiviert. Die CSS-Datei und das Logo sind unveränderte Kopien der Quelle. Inter ist wie in der Quelle über Google Fonts eingebunden; offline greift die vorhandene Systemschrift als Ersatz.

Die Quelle hat inzwischen vier Fortschrittsschritte; der annotierte Screenshot zeigte drei. Die Vorschau verwendet den angegebenen Quellstand und behauptet keinen Pixelvergleich mit der Serverversion.

## Jede Änderung mit Kommentar

| ID | Änderung | Begründung |
| --- | --- | --- |
| REVIEW-01 | `Get to know PULS` → `Start with your plans` | Die Überschrift beschreibt, worum es auf dieser Seite geht. Sie kündigt keine allgemeine Produktwerbung an. |
| REVIEW-02 | Definition von Financial Wellbeing und beide Kästen entfernen. Ein Satz bleibt: `Choose what’s coming up in your life, then answer a few questions about your finances.` | Der Satz beschreibt die tatsächlichen nächsten Schritte. Keine allgemeinen Versprechen über weniger Stress oder bessere Entscheidungen. Die zwei fast gleichen Erklärungsebenen entfallen. |
| REVIEW-03 | `Choose life goals` → `Choose your plans` | Der Button greift die Überschrift auf und benennt die folgende Auswahl. `data-branch="goals"` bleibt erhalten. |

Die IDs stehen auch direkt im Patch als JavaScript- bzw. HTML-Kommentare. Keine neue Karte, kein neues Farbsystem und keine zusätzlichen Symbole. Weißraum unter dem Inhalt bleibt bewusst frei. Die vorhandenen Abstände, Schriftgrößen, Breakpoints und Bedienelemente werden weiterverwendet.

## Selbst übernehmen

Im lokalen Checkout von **LucasKi9000/PULS** ausführen, nachdem du den Patch dorthin kopiert hast:

```sh
git apply --check /pfad/zu/onboarding.patch
git apply /pfad/zu/onboarding.patch
git diff -- dist/branch.js
```

Der Patch betrifft ausschließlich `dist/branch.js`. Bei späteren Quelländerungen zuerst den Kontext vergleichen. Die drei Kommentare erlauben auch eine manuelle Übernahme. Die bestehenden `.intro-notes`-CSS-Regeln bleiben absichtlich unberührt, um den Vorschlag klein zu halten.

## Prüfung

- Patch gegen den oben genannten Quellstand mit `git apply --check` geprüft, ohne ihn im Quellrepository anzuwenden.
- Vorgeschlagene JavaScript-Datei mit `node --check` geprüft.
- Inhaltsvorschau im Browser bei Desktop- und Mobilbreite geprüft (Details in `verification.md`).
- Keine vollständige Funktionsprüfung der Anwendung: Der Vorschlag verändert nur Texte und entfernt die zwei statischen Erklärungskästen. Bestehende Aktionskennung, Stufen und Fragebögen werden im Patch nicht verändert.

## Gemeinsamer Review: nächste Schritte

Die Gegenüberstellung nennt die Ansichten ausdrücklich „Seine Version“ und „Dein Vorschlag“ und zeigt die Begründungen direkt darunter. Zuerst wird die Einführung besprochen. Die neuen Kommentare sind als nächste Schritte dokumentiert, noch nicht umgesetzt:

1. Lebenspläne: ganze Karten auswählen, ausgewählte Karten dunkelblau, keine sichtbaren Checkboxen.
2. Fragen: ebenso ganze Boxen auswählen; Einzel- und Mehrfachauswahl funktional beibehalten.
3. Datenquellen: weniger Container, Verbindungsmöglichkeiten hervorheben und „View my PULS score“ zentral präsentieren.
