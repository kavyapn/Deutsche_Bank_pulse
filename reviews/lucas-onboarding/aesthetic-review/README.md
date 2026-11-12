# Ästhetik und Einfachheit · Review vom 12. November 2026

**Die größten Hebel sind Themenauswahl, Quiz, Lernpfad und Simulator.** Das Onboarding ist durch die bisherigen Änderungen bereits ruhiger geworden. Den gleichen Grad an Klarheit erreichen die nachfolgenden Ansichten noch nicht.

Dies sind **offene Vorschläge, keine umgesetzten Designänderungen**. Die freigegebene Einführung, der zentrierte Bank-Button, die reduzierten Importaktionen und die simulierte PIN-Eingabe bleiben bestehen. Berechnungen, Fragen, Antwortskalen und Gewichtungen werden durch dieses Review nicht verändert.

Basis: aktuelle Einzel-HTMLs im Branch `codex/puls-onboarding-review`, Stand `d83fc28`; zugrunde liegendes GitHub-Original `LucasKi9000/PULS`, `b9537cc`.

## Diese Seiten zuerst anschauen

| Reihenfolge | Seite | Größter offener Punkt |
| --- | --- | --- |
| 1 | [Themenprioritäten](../seperatre%20i.%20files/06-themen-prioritaeten.html) | 16 Emojis, lange Erklärung und Gewichtungszeile konkurrieren mit der Auswahl. |
| 2 | [Quiz / Lektion](../seperatre%20i.%20files/lernen-lesson-cash.html) | Das neue Auswahlprinzip aus dem Onboarding fehlt hier noch. |
| 3 | [Lernpfad](../seperatre%20i.%20files/puls-learn.html) | Lernstraße, weitere Übungen, Quests, Videos und Beratung auf einer Seite. |
| 4 | [Simulator](../seperatre%20i.%20files/puls-simulator.html) | Unterschiedliche Score-Begriffe und mehrere Erklärungsebenen erschweren das Erfassen. |
| 5 | [Retirement-Simulator](../seperatre%20i.%20files/puls-simulator-retirement.html) | Zwei Speicheraktionen und ein Folgetext zum ursprünglichen Lebensplan statt zum aktiven Tab. |
| 6 | [Assessment](../seperatre%20i.%20files/puls-capability.html) | 15 Fragen als langer Dropdown-Fragebogen; andere Formularoptik. |

## P1 · Zuerst bearbeiten

### A01 · Themenauswahl verständlicher und ruhiger machen

[Seite](../seperatre%20i.%20files/06-themen-prioritaeten.html) · [Screenshot](screenshots/06-themen-prioritaeten.jpg) · [Mobil](screenshots/mobile-06-themen-prioritaeten.jpg)

**Beobachtung:** Acht Themen haben jeweils zwei Daumen-Emojis. Der neutrale Zustand ist nur das Fehlen einer Auswahl. Darüber erklärt ein langer Absatz die Mechanik; darunter stehen vier technische Gewichte. Auf Mobilgeräten nehmen Erklärung und Gewichtszeile besonders viel Raum ein.

**Vorschlag:** Die drei vorhandenen Zustände als eine gemeinsame Auswahl pro Zeile sichtbar machen: „Weniger · Neutral · Mehr“. Neutrale Auswahl zurückhaltend, Abweichungen dunkelblau markieren. Eine kurze Anweisung genügt; die Gewichte bleiben hinter einer aufrufbaren Erklärung erreichbar. Lange Fachbegriffe verständlicher formulieren, ohne Themen zusammenzulegen.

**Woran man die Verbesserung erkennt:** Keine Emojis nötig; der aktuelle Zustand ist ohne Erklärung erkennbar; alle drei Gewichtungszustände bleiben erhalten. Die Seite erklärt nicht länger die Berechnungsmechanik, bevor man eine Präferenz angeben kann.

### A02 · Quiz an die bereits verbesserten Auswahlkarten angleichen

[Beispiel](../seperatre%20i.%20files/lernen-lesson-cash.html) · [Screenshot](screenshots/lernen-lesson-cash.jpg) · [Mobil](screenshots/mobile-lernen-lesson-cash.jpg)

**Beobachtung:** Im Onboarding sind die ganzen Karten wählbar und ausgewählte Antworten dunkelblau. In den Lektionen erscheinen wieder sichtbare Radiokreise. Lehrtext, Beispiel, lange Frage und kleiner „Check my answer“-Button bilden eine durchgehende Textspalte.

**Vorschlag:** Dasselbe Kartendesign und dieselben Auswahlzustände verwenden. Lerninhalt und Frage klar gliedern; das Beispiel als gezielt aufrufbare Hilfe anbieten, wenn es nicht für die konkrete Frage notwendig ist. Den Prüfbutton als klare Hauptaktion ausrichten und ausreichend groß halten. Vor der Antwortauswahl einen eindeutigen inaktiven Zustand zeigen.

**Woran man die Verbesserung erkennt:** Eine Antwort lässt sich über die ganze Fläche wählen. Die Frage ist visuell eindeutig, die nächste Aktion vorhersehbar. Aufgaben, Lösungen, Punkte und Feedback bleiben fachlich unverändert. Gilt für alle vier exportierten Lektionen.

### A03 · Lernpfad auf eine nächste Aufgabe konzentrieren

[Seite](../seperatre%20i.%20files/puls-learn.html) · [Screenshot](screenshots/puls-learn.jpg)

**Beobachtung:** Vier große Stationen stehen auf einer ausgedehnten Lernstraße. Darunter folgen sechs zusätzliche Übungen, Score-Erklärung, Quests, Videos und Beratung. Die Fortschrittsanzeige zählt zehn Lektionen, die Lernstraße zeigt vier. Der Zusammenhang ist nicht unmittelbar erklärt.

**Vorschlag:** Die nächste Lektion und der zugehörige Fortschritt bilden den ersten klaren Bereich. Die Lernstraße darf bleiben, sollte aber weniger Höhe beanspruchen. Weitere Übungen, Videos und Beratung als nachgeordnete, bei Bedarf geöffnete Bereiche anbieten. Klar benennen, ob ein Fortschritt den Basispfad oder alle Übungen zählt; keine Punkte neu berechnen.

**Woran man die Verbesserung erkennt:** Man kann sofort beantworten: „Was mache ich jetzt?“ und „Wie weit bin ich?“ Zusätzliche Angebote stehen weiterhin bereit, konkurrieren aber nicht gleichwertig mit der nächsten Lektion.

**Unterscheidung zum Export:** Die ursprüngliche App scrollt beim Öffnen zum aktiven Lernschritt. Der Einzelseiten-Export setzt anschließend an den Seitenanfang zurück. Die Startposition im Export ist deshalb ein separater Review-Komfortpunkt, kein nachgewiesener Fehler der ursprünglichen App-Navigation.

### A04 · Simulator: eine klare Hierarchie für Eingabe, Ergebnis und Aktion

[Life events](../seperatre%20i.%20files/puls-simulator.html) · [Retirement](../seperatre%20i.%20files/puls-simulator-retirement.html) · [Screenshot](screenshots/puls-simulator.jpg)

**Beobachtung:** Oben steht projizierte Future readiness; darunter erscheinen aktueller PULS-Score sowie Baseline- und Szenario-Scores. Das sind unterschiedliche Kennzahlen, werden aber ähnlich präsentiert. Wiederholte Überschriften und mehrere Karten verteilen die Aufmerksamkeit. Bei Family/Retirement sind „Save forecast“ und „Save rehearsal“ gleichzeitig sichtbar. Der Folgetext bleibt beim ursprünglichen Onboarding-Lebensplan, im geprüften Retirement-Fall also bei einer Einkommenspause.

**Vorschlag:** Erst den Plan beziehungsweise die Änderung bearbeiten, dann genau einen klar beschrifteten Ergebnisvergleich zeigen. Aktuellen und projizierten Wert sowie Gesamt-Score und Teil-Score ausdrücklich unterscheiden. Eine eindeutige Speicheraktion je aktivem Szenario hervorheben. Folgetext und nächste Aktion auf den aktiven Tab beziehen. Eingangsgrößen und Annahmen bleiben nachvollziehbar zugänglich.

**Woran man die Verbesserung erkennt:** Alle Zahlen lassen sich eindeutig zuordnen; es ist klar, welche Änderung gerade geprüft und was gespeichert wird. Diagramm, Berechnung, Risiken und Annahmen werden nicht aus Gründen der Optik verändert oder weggelassen.

## P2 · Danach vereinheitlichen und kürzen

### A05 · Assessment in überschaubare Schritte gliedern

[Seite](../seperatre%20i.%20files/puls-capability.html) · [Screenshot](screenshots/puls-capability.jpg)

15 Fragen aus Knowledge, Behaviour und Planning attitudes erscheinen als langer Fragebogen. Die kantigen, kaum gestalteten Dropdowns fallen aus dem restlichen Formularstil heraus. Die drei vorhandenen Themenblöcke können einen klaren Ablauf mit Fortschritt bilden. Formulare und Abstände an die übrige Oberfläche angleichen. Wortlaut, Reihenfolge, Antwortskalen und Auswertung des Instruments dabei erhalten.

**Ziel:** Man erkennt Umfang, aktuellen Abschnitt und nächste Aktion. Kein kleinerer Text, um mehr Inhalt gleichzeitig unterzubringen.

### A06 · Lebensplan-Auswahl: Weiter-Aktion auf Mobilgeräten erreichbar halten

[Seite](../seperatre%20i.%20files/05-lebensplaene.html) · [Mobil](screenshots/mobile-05-lebensplaene.jpg)

Die neuen Auswahlkarten funktionieren visuell gut. Elf Pläne bilden auf Mobilgeräten jedoch eine lange Liste; „Continue“ steht erst darunter. Ein ruhiger Aktionsbereich mit Auswahlanzahl und Weiter-Button könnte die Aktion beim Scrollen erreichbar halten. Dafür ausreichend Abstand zum letzten Listeneintrag und zur unteren Gerätefläche einplanen. Keine Optionen verstecken und keine kleineren Bedienflächen erzwingen.

### A07 · Score-Übersicht: nächste Handlung früher erkennbar machen

[Seite](../seperatre%20i.%20files/10-puls-score.html) · [Mobil](screenshots/mobile-10-puls-score.jpg)

Der große Score, Wochenchart, Status und Viertelkreis konkurrieren um die erste Bildschirmfläche. Die nächste konkrete Aufgabe folgt erst nach der großen Grafik; auf kurzen Displays kommt sie spät. Den visuellen Platzbedarf des Score-Bereichs reduzieren oder die nächste Aufgabe näher an den Gesamtwert rücken. Die vier Bereiche und ihre Werte können bestehen bleiben. „Normal“ ist als klickbares Element wenig aussagekräftig; die Aktion dahinter klarer benennen. Weitere Aktionen hierarchisch ordnen.

### A08 · Fitness und Behaviour: wichtigste Aussage vor Detaildaten

[Fitness](../seperatre%20i.%20files/puls-fitness.html) · [Behaviour](../seperatre%20i.%20files/puls-behaviour.html)

Viele Zahlen sind bereits sinnvoll gegliedert, aber der nächste Schritt steht nach längeren Analysen. Bei Fitness ist die Rechenliste standardmäßig aufgeklappt; Beispieltext und Kennzahlen wiederholen dieselbe Aussage. Bei Behaviour ergänzt ein allgemeiner Umfragevergleich die persönliche Sparübersicht, ohne die konkrete nächste Handlung zu erklären.

Die wichtigste persönliche Beobachtung und die passende Aktion zuerst anbieten, Details und Quellen gezielt darunter. Die aufgeklappte Eingabeliste ist für den Bericht nützlich, muss aber nicht die Standardansicht der Detailseite bestimmen. Fachliche Daten und Quellen erhalten.

### A09 · Score-Bericht: Zusammenfassung vor Rechenwerk

[Seite](../seperatre%20i.%20files/puls-report.html) · [Screenshot](screenshots/puls-report.jpg)

Die vollständig sichtbare Tabelle enthält viele Gewichte, Punkte, Quellen und Regeln. Das ist als Nachweis nützlich, für einen ersten Überblick jedoch dicht. Eine kompakte Zusammenfassung der vier Bereiche voranstellen, Berechnung je Bereich aufklappbar machen und den vollständigen Export erhalten. Technische Formulierungen wie „Mock banking API“ können im sichtbaren Bericht als verständlich bezeichnete Demo-Datenquelle erscheinen; die genaue Herkunft bleibt aufrufbar.

„Export report“ ist auf dieser Seite die naheliegende Hauptaktion; die optisch stärkere Vorbereitung eines Beratungsgesprächs sollte sie nicht verdrängen.

### A10 · Datenquellen: bisherige Reduktion erhalten

[Seite](../seperatre%20i.%20files/07-datenquellen.html)

Der große Bank-Button und die reduzierten Alternativen sind bereits deutlich klarer. Keine neue Kartenschicht oder zusätzliche Erklärung einführen. Der mittige Score-Button sollte sichtbar bleiben, aber als nachgeordnete Fortsetzung gegenüber der Bankverbindung erkennbar sein. Bei CSV und manueller Eingabe die ergänzenden Formularfelder einheitlich gestalten. Hinweise zu Demo-Daten und Speicherung erhalten; technische CSV-Formatdetails nahe am Upload beziehungsweise in einer Hilfe anbieten.

### A11 · Einheitliche visuelle Regeln statt mehr Dekoration

Betrifft insbesondere [Assessment](../seperatre%20i.%20files/puls-capability.html), [Quiz](../seperatre%20i.%20files/lernen-lesson-cash.html), [Fitness](../seperatre%20i.%20files/puls-fitness.html) und [Simulator](../seperatre%20i.%20files/puls-simulator.html).

- Pro Ansicht eine erkennbare Hauptaktion; zusätzliche Aktionen als sekundäre oder Textbuttons.
- Gleiche Auswahlzustände für vergleichbare Eingaben. Single- und Multi-Select müssen unterscheidbar erklärt bleiben.
- Gleiche Schrift- und Abstandshierarchie für Seitentitel, kurze Erklärung und Eingabe. Nicht jede Unterseite braucht einen weiteren Rahmen.
- Eingaben mit sichtbaren Labels, konsistenter Höhe und gut lesbarer Schrift. Keine kleineren Felder als Mittel gegen lange Seiten.
- Auf Mobilgeräten beanspruchen Markenheader, Modusschalter, Navigation, Benachrichtigung und Sitzungsanzeige viel Platz. Anordnung beruhigen; Sitzungsende und Warnungen erhalten. Den Prototyp-Modusschalter nicht mit regulären Aufgaben vermischen.
- Persönliche Aussagen von allgemeiner Motivation trennen. Aussagen wie „Rehearse your plan“ durch die konkrete Aufgabe des aktiven Kontexts ergänzen.

## Was bereits funktioniert und erhalten bleiben sollte

- Die zentrierte, kurze Einführung mit klarer nächster Aktion.
- Dunkelblaue ausgewählte Karten im Onboarding.
- „Connect a bank“ als Hauptaktion und kleine Importalternativen.
- Simulierte PIN-Eingabe; hierfür besteht kein zusätzlicher ästhetischer Umbauauftrag.
- Freier Raum auf kurzen Seiten. Eine leere Bildschirmhälfte muss nicht mit Karten gefüllt werden.
- Fortschritts-, Banking- und Serviceansichten haben derzeit weniger dringenden Bedarf als Themenauswahl, Lernen und Simulator. Der leere Inbox-Zustand kann später als einfache Zeile statt eigener Karte erscheinen.

## Prüfung und Grenzen

| Bereich | Nachweis |
| --- | --- |
| 63 Einzelansichten | Im Browser geöffnet, Struktur erfasst und Screenshots gesichert; keine Exportfehler. [Desktop-Protokoll](desktop-findings.json) |
| Mobile Layouts | Zehn repräsentative Ansichten bei exakt 390 px Inhaltsbreite geprüft. In diesen zehn Ansichten kein horizontaler Überlauf. [Mobil-Protokoll](mobile-findings.json) |
| Darstellung und Daten | Statischer Review-Server; die exportierten Apps verwenden die eingebetteten Demo-Daten. Kein produktiver Backend- oder KI-Test. |
| Quellenprüfung | Renderer für Onboarding, Prioritäten, Lernen, Detailseiten, Datenquellen und Simulator mitgelesen. |

Die Browserbreite der großen Ansichten änderte sich während der Prüfung; die Screenshots sind Belege für Layoutbefunde, kein Pixelvergleich unter identischen Viewports. Mobile Prüfungen liefen in einem 390 × 1000 px Browser-Frame, nicht auf einem physischen Telefon. Nicht jede Quizantwort, Fehlermeldung, Dialogkombination oder Langtextskalierung wurde erneut getestet. Die Empfehlungen sind Designurteile; eine Nutzungsstudie wurde nicht durchgeführt.

[Alle Seiten mit zugeordneten Review-Punkten](coverage.md) · [Screenshots](screenshots/)
