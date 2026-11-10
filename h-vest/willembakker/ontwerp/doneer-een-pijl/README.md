# Ontwerp "Doneer een pijl" – tafelkaart, tafelvlag en flesetiket

Stijl afgeleid van de uitnodiging voor 2 december (donkerblauw, oranje, witte kapitalen, chevrons).

- `ontwerp.html` – het ontwerp (vier vellen: A6 voorkant, A6 achterkant, tafelvlag 200×80 mm, flesetiket 205×65 mm met 3 mm afloop en 15 mm overlapzone rechts). Open in een browser; met `?sheet=a6-voor`, `?sheet=a6-achter`, `?sheet=vlag` of `?sheet=etiket` zie je één vel.
- `render.js` – maakt met Playwright de PNG-voorbeelden en de PDF's op drukformaat (`node render.js`).
- `qr.png` – QR-code naar https://h-vest.nl/willembakker/doneer, de doneerpagina van het portaal (foutcorrectie H). Pas drukken als die pagina live is.
- `willem-crop.jpg` – tijdelijke foto, uitgesneden uit een foto van de gedrukte uitnodiging. Vervangen door de originele foto uit de digitale uitnodiging vóór het drukken.
- `tafelkaart-A6-*.pdf`, `tafelvlag-200x80.pdf` – drukbestanden zonder afloop (bleed); `flesetiket-205x65-met-afloop.pdf` – etiket op 211×71 mm (205×65 plus 3 mm afloop rondom). Controleer het etiketformaat bij de flesjesleverancier (gangbaar 205×65, ook 207×60, 198×65 of 220×65 mm) en pas `.etiket` in `ontwerp.html` aan. Vraag de drukker of 3 mm afloop nodig is; dan het vel in `ontwerp.html` 6 mm groter maken.
- `fonts/` – Anton en Barlow Condensed (Google Fonts, SIL Open Font License).

Te bevestigen vóór drukken: prijs van een set van 12 (notulen: € 900; 12 × € 80 is € 960) en de originele foto van Willem.
