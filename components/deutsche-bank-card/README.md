# Deutsche Bank · HTML-Karte

[DeutscheBank_Karte.html](DeutscheBank_Karte.html) direkt im Browser öffnen. Eine eigenständige Datei ohne Bilder, externe Schriftarten oder Bibliotheken. Karte in HTML/CSS mit SVG-Logo, Chip und Kontaktlos-Symbol. Nur maskierte Demo-Daten.

Die Vorschau zeigt die Karte zunächst vollständig. „Karte einstecken“ dreht sie und zieht sie in einen kleinen Demo-Kartenschlitz ein. „Zurücksetzen“ bringt sie zurück; wiederholtes Abspielen wird unterstützt. Reduzierte Bewegung wird berücksichtigt.

## Karte später im Cashier verwenden

Das Custom Element ist von der Vorschau getrennt. Den Scriptblock `deutsche-bank-card-component` aus der HTML-Datei übernehmen und das Element im Zielcontainer einsetzen:

```html
<div style="width:360px;max-width:100%">
  <deutsche-bank-card holder="Lena Muster" last-four="0428"></deutsche-bank-card>
</div>
```

Breite und Seitenverhältnis passen sich an den Container an; Styles bleiben im Shadow DOM gekapselt. `holder` und `last-four` lassen sich als Attribute setzen. Andere Zeichen als Ziffern werden aus den vier Endziffern entfernt; Texte werden als Text und nicht als HTML eingesetzt.

Für den Vorschau-Aufbau sind außerdem `.stage`, `.insertion-window`, `.card-track`, `.reader` und der zweite Scriptblock zuständig. Er stellt `window.bankCardPreview.insert()` und `.reset()` sowie die Events `card:inserting`, `card:inserted` und `card:reset` bereit. `insert()` gibt ein Promise zurück, das nach abgeschlossener Animation `true` liefert und bei Abbruch `false`. Der Cashier kann daran später den PIN-Schritt anschließen.

Die bestehende PULS-Anwendung und der Cashier-Mock wurden nicht geändert. Die Animation ist eine konzeptionelle Einsteckvorschau, keine Nachbildung eines bestimmten Kartenlesegeräts oder Zahlungsnetzes.

## Prüfung

- Beide Inline-Scriptblöcke mit `node --check` geprüft.
- Im Browser: Karte sichtbar, Einstecken wechselt über `inserting` zu `inserted`, Wiederholen-Button wird freigegeben, Zurücksetzen stellt `ready` wieder her.
- Abbruch während laufender Animation geprüft: stabiler Zustand `ready`.
- Bei 390 × 844 px geprüft: Body und scrollWidth jeweils 390 px, kein horizontaler Überlauf.
- Screenshots: [Desktop](screenshots/card.jpg), [Mobil](screenshots/mobile.jpg).

## Vollständiger Einzug

Die Animation ermittelt die tatsächliche Schlitzmitte und richtet dort ihre Schnittkante aus. Ihre Endposition wird aus der Kartengröße berechnet, mit zusätzlichem Abstand für den Schatten. Im Zustand `inserted` ist der Kartenträger vollständig ausgeblendet; beim Wiederholen und Zurücksetzen wird er wieder sichtbar.

Die Korrektur wurde am Desktop und bei 390 px Breite im Browser geprüft: Schnittkante und Schlitzmitte stimmen überein; die Kartenoberkante liegt am Ende jeweils 96 px darunter. Karten-Träger im Endzustand unsichtbar. Wiederholen und Abbruch mit Zurücksetzen funktionieren weiterhin. Screenshots: [eingesteckt](screenshots/inserted.jpg), [mobil eingesteckt](screenshots/inserted-mobile.jpg).

Die Leserabdeckung ist an der Schlitzmitte in zwei Ebenen getrennt: obere Platte hinter der Karte, untere Lippe davor. Die Karten-Schnittkante und die obere Kante der Vordergrundlippe liegen am Desktop beide bei derselben Schlitzmitte. Einzug bis `inserted` und Rücksetzen im Browser geprüft.
