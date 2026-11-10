# Ontwerp "Adopteer een pijl" – tafelkaart en tafelvlag

Stijl afgeleid van de uitnodiging voor 2 december (donkerblauw, oranje, witte kapitalen, chevrons).

- `ontwerp.html` – het ontwerp (drie vellen: A6 voorkant, A6 achterkant, tafelvlag 200×80 mm). Open in een browser; met `?sheet=a6-voor`, `?sheet=a6-achter` of `?sheet=vlag` zie je één vel.
- `render.js` – maakt met Playwright de PNG-voorbeelden en de PDF's op drukformaat (`node render.js`).
- `qr.png` – QR-code naar https://willembakker.eu/adopteer-een-pijl (foutcorrectie H).
- `willem-crop.jpg` – tijdelijke foto, uitgesneden uit een foto van de gedrukte uitnodiging. Vervangen door de originele foto uit de digitale uitnodiging vóór het drukken.
- `tafelkaart-A6-*.pdf`, `tafelvlag-200x80.pdf` – drukbestanden zonder afloop (bleed). Vraag de drukker of 3 mm afloop nodig is; dan het vel in `ontwerp.html` 6 mm groter maken.
- `fonts/` – Anton en Barlow Condensed (Google Fonts, SIL Open Font License).

Te bevestigen vóór drukken: prijs van een set van 12 (notulen: € 900), en de tekst "eenmalig of maandelijks" (van willembakker.eu).
