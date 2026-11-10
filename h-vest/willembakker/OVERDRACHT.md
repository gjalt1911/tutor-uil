# Overdracht – Willem Bakker teamportaal (stand 3 november 2026, 00:10)

## Doel

Een website waarmee het team van Stichting Willem Bakker Archer (Gjalt, Piet, Tanja, Ruud, Cornelie, Herbert, plus Willem zelf) alles rond boogschutter Willem Bakker bijhoudt:

1. Financiën: sponsorbijdragen met financiële planning per jaar en kwartaal.
2. BV: balans en winst-en-verliesrekening (cijfers uit Snelstart), samenvatting per kwartaal en jaar. Privé: inkomen uit A-status en prijzengeld.
3. Events: eerste event is de sponsoravond van 2 december 2026 in Het Klooster. Per event: planning, actielijst (wie, wanneer), programma van de avond, financieel plaatje, presentaties met samenvatting, notulen.

Eisen van Gjalt: moet op de Mac mini draaien, onder zijn eigen domein (h-vest.nl, dus h-vest.nl/willembakker), met een inlog per persoon (voornaam + wachtwoord). Huisstijl op basis van de kleuren van willembakker.eu.

## Wat af is

- Code staat op GitHub: repo `gjalt1911/tutor-uil`, branch `willembakker`, map `h-vest/willembakker/` (laatste commit baef915, gepusht).
- `server.js`: Node.js-server (18+), geen extra pakketten. Inlog met sessiecookie (90 dagen), wachtwoorden als scrypt-hash, blokkade na 8 mislukte pogingen, gebruikersbeheer (alleen beheerder), live updates via server-sent events (`api/stream`), bulk-import/export, opdrachten `--setup`, `--gebruiker`, `--wachtwoord`. Instellingen via `PORT` (3010), `HOST`, `BASE_PATH` (bijv. `/willembakker`), `WB_DATA`. Data in `data/db.json`, `data/gebruikers.json`, `data/sessies.json` (staan in .gitignore).
- `public/index.html`: de hele site in één bestand (Nederlands, licht en donker, telefoon en desktop). Kiest zelf de opslag: serverversie met inlogscherm en Beheer-tabblad, anders browseropslag. Schermen: Overzicht, Sponsoren, BV, Privé-inkomen, Events (met tabbladen Planning, Actielijst, Programma, Financieel, Presentaties, Samenvatting en notulen), Team, Gegevens (export/import, eigen wachtwoord), Beheer.
- `seed.json`: startgegevens bij de eerste start: team met rollen, bekende sponsoren (Saluqi Motors, ORGwaalre, FotoTB.nl, Financieel Zeker, Robert, Roelie, Kees, adopteer een pijl, WeConnect geweigerd), event 2 december volledig gevuld uit de notulen van 2 november (aanmeldingen 7, verwacht 15, capaciteit 120, zaalhuur € 400, programma met Michael, Willem, Jacco, Jan van Veen, Pepijn en de sponsoroproep, 14 acties met wie en wanneer, 6 mijlpalen, begroting, samenvatting, volledige notulentekst), volgende vergadering 10 november.
- Feiten over Willem op het overzicht met bronlinks (EK-goud Antalya 24 mei 2026, brons World Games 2025, NK 2023, Grand Prix Plovdiv 2022, WK 2025 57e, WK veld 2024 14e, jeugdzilver 2018/2019, wereldranglijst circa 14, doel LA 2028, stichting WBA, site willembakker.eu).
- `README.md`: installatie op de mini, launchd-plist, reverse proxy, back-up.
- Getest in de cloud-sandbox: inloggen (goed en fout wachtwoord), live doorgeven van een nieuwe actie naar een tweede ingelogde gebruiker, account aanmaken in Beheer met gegenereerd wachtwoord, wachtwoord wijzigen, uitloggen en opnieuw inloggen, opslag op schijf, api zonder login geeft 401; statische versie zonder fouten op desktop en telefoon, licht en donker; Nederlandse bedragen ("2.500", "2500,50") worden goed gelezen.
- Voorbeeldweergave als Claude-artifact: https://claude.ai/artifact/JbTFCGv5ZzCGwRmyBgg3Bj (versie 2, alleen browseropslag, niet de echte versie; de oude gedeelde opslag van versie 1 bevat nog 35 verouderde startdocumenten en wordt niet meer gebruikt).

## Toegevoegd op 10 november

- "Adopteer een pijl" heet nu "Doneer een pijl". Ontwerpen (tafelkaart A6, tafelvlag 20×8 cm en flesetiket 205×65 mm) staan in `ontwerp/doneer-een-pijl/`; de QR-code verwijst naar https://h-vest.nl/willembakker/doneer.
- Openbare doneerpagina `public/doneer.html` op `/doneer`, met iDEAL via Mollie (server: `maakDonatie`, `mollieWebhook`), terugval op rekeningnummer en bankbetaalverzoeken zolang er geen Mollie-sleutel is. Donaties in verzameling `donaties`; portaalscherm "Doneer een pijl" en instellingen onder Beheer. Getest met een nep-Mollie (betalen, annuleren, webhook, stand, beheer).
- Nog te doen: Mollie-account voor de stichting aanvragen en de live-sleutel invullen; `publicBaseUrl` zetten; pagina live op de mini vóór het drukken; 150 flesjes bestellen (etiketformaat bij leverancier controleren).

## Wat open staat

1. **Installatie op de Mac mini** en reverse proxy naar h-vest.nl/willembakker. De cloudsessie kan de mini niet bereiken: de sessies op de mini accepteren alleen opdrachten vanaf vertrouwde apparaten en er zijn geen Remote Control-mappen zichtbaar. Doen vanuit een sessie op de mini (telefoon › Claude Code › bijvoorbeeld "★ PA", of `claude remote-control` in een map). Stappen: branch binnenhalen, `node server.js --setup`, server via launchd met `PORT=3010` en `BASE_PATH=/willembakker`, in de webserver van h-vest.nl `/willembakker/` doorsturen naar `http://127.0.0.1:3010/willembakker/` (pad meegeven; buffering uit voor `/willembakker/api/stream`), testen op https://h-vest.nl/willembakker/.
2. **Wachtwoorden uitdelen.** `--setup` toont ze één keer; daarna via Beheer of `node server.js --wachtwoord <naam>`. Accounts: gjalt (beheerder), piet, tanja, ruud, cornelie, herbert, willem. Mensen uit de WhatsApp-groep "Stichting Willem Bakker Archer" die ontbreken toevoegen onder Beheer (WhatsApp is voor Claude niet bereikbaar).
3. **Huisstijl op basis van willembakker.eu.** Nog niet gedaan: het domein is in de cloudomgeving geblokkeerd. Nodig: `willembakker.eu` toestaan onder Network access van de omgeving, of een schermafbeelding/kleurcodes. Alle kleuren staan als variabelen in het `:root`-blok bovenin `public/index.html`; de lettertypen zijn Barlow Condensed (koppen) en Barlow (tekst) via Google Fonts.
4. **Google Docs-link uit de WhatsApp-groep.** Link nog niet ontvangen; `docs.google.com` moet ook toegestaan zijn.
5. **Inhoud aanvullen:** sponsorbedragen (nu € 0), echte jaardoelen (nu voorbeeld 40/50/60 duizend), BV-kwartaalcijfers uit Snelstart, privé-inkomen, achternamen van Robert, Roelie en Kees, acties "hapjes" en "QR-tafelvlaggetjes" toewijzen, plek van Pepijn in het programma bevestigen, catering (Lucca) en begroting van hapjes/koffie.
6. Optioneel: branch `willembakker` mergen in `main`; het losse `public/index.html` werkt ook op GitHub Pages maar dan alleen met browseropslag.

## Belangrijke bestanden

- `h-vest/willembakker/server.js` – server en opdrachtregel
- `h-vest/willembakker/public/index.html` – de site (kleuren bovenin in `:root`, startgegevens in `const SEED`, feiten in `const FEITEN`)
- `h-vest/willembakker/seed.json` – startgegevens voor de server (zelfde inhoud als `SEED`)
- `h-vest/willembakker/README.md` – installatie en beheer
- `h-vest/willembakker/data/` – ontstaat op de mini; is de volledige back-up

## Besluiten en aannames

- "h-vest" is het domein h-vest.nl op de mini; er is geen aparte repo, de site staat als map in tutor-uil.
- Geen frameworks of pakketten, aan beide kanten: één HTML-bestand en een server met alleen Node-ingebouwde modules, zodat het op de mini zonder installatiestappen draait en makkelijk te lezen blijft.
- Opslag in JSON-bestanden in plaats van een database; genoeg voor zeven gebruikers en een paar honderd regels.
- Inlognaam is de voornaam in kleine letters; Gjalt is beheerder; iedereen die ingelogd is mag alles bewerken.
- "Wie"-velden zijn vrije tekst met suggesties, omdat sprekers (Michael, Jacco, Jan van Veen, Pepijn) geen teamleden zijn.
- Datamodel: verzamelingen team, sponsors, bv, prive, events, mijlpalen, acties, programma, eventbudget, presentaties, settings; onderdelen van een event hangen via `eventId` aan het event; BV-kwartalen hebben id `jaar-qN`; de server zet `_door` en `_op` op elk document (wie, wanneer).
- "Gert" in de notulen is als Gjalt gelezen (transcriptiefout); Herbert is de vader van Willem.
- Event 2 december heet "Sponsoravond 2 december"; tijden in het programma zijn een voorstel op basis van de notulen.
- De artifact-versie is alleen een voorbeeld; de server op de mini is de bron van de waarheid.
