# Doneerpagina, statische versie (zonder portaalserver)

Dit is dezelfde pagina als `public/doneer.html`, maar met de betaalgegevens in het bestand zelf. Hij heeft geen server nodig: één bestand op de webserver van h-vest.nl is genoeg.

1. Maak in de Rabo Business-app drie betaalverzoeken, elk "meerdere keren te betalen": € 80 (1 pijl), € 240 (3 pijlen) en zonder bedrag (eigen bedrag). Omschrijving bijvoorbeeld "Doneer een pijl – Willem Bakker".
2. Plak de drie links, het IBAN en een contactadres bovenin `index.html` in het blok `window.DONEER_STATISCH`.
3. Zet het bestand op de mini zodat het bereikbaar is als https://h-vest.nl/willembakker/doneer/ (bijvoorbeeld in de webroot van h-vest.nl als map `willembakker/doneer/index.html`). Zorg dat ook https://h-vest.nl/willembakker/doneer (zonder slash) werkt; de meeste webservers sturen dat automatisch door.
4. Scan de QR-code op het etiket of de tafelkaart: hij moet deze pagina openen.

Zodra later de portaalserver achter h-vest.nl/willembakker draait, neemt die dezelfde URL over en komen donaties automatisch in het portaal.
