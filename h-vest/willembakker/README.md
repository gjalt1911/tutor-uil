# Willem Bakker – teamportaal

Website voor het team van Stichting Willem Bakker Archer. Iedereen logt in met de eigen voornaam en een wachtwoord; alle gegevens staan op de server (de Mac mini) en wijzigingen verschijnen direct bij de anderen.

Onderdelen: Overzicht · Sponsoren en financiële planning · BV (balans en W&V per kwartaal, uit Snelstart) · Privé-inkomen (A-status, prijzengeld) · Events (planning, actielijst met wie en wanneer, programma van de avond, financieel plaatje, presentaties met samenvatting, notulen) · Team · Gegevens (export/import) · Beheer (accounts, alleen beheerder).

## Bestanden

- `server.js` – de server (Node.js, geen extra pakketten nodig)
- `public/index.html` – de website (één bestand)
- `seed.json` – startgegevens bij de allereerste start (team, sponsoren, event 2 december uit de notulen van 2 november 2026)
- `data/` – wordt aangemaakt bij de eerste start: `db.json` (alle gegevens), `gebruikers.json` (accounts, wachtwoorden versleuteld), `sessies.json`. Staat niet in git.

## Op de Mac mini zetten

1. Node.js installeren (versie 18 of nieuwer): via https://nodejs.org (macOS-installer) of `brew install node`. Controleer met `node --version`.
2. Deze map op de mini zetten, bijvoorbeeld `git clone https://github.com/gjalt1911/tutor-uil.git` en dan `cd tutor-uil/h-vest/willembakker`.
3. Eerste inrichting: `node server.js --setup`. Dit maakt de accounts gjalt (beheerder), piet, tanja, ruud, cornelie, herbert en willem aan en toont hun wachtwoorden één keer. Schrijf ze op en geef ze persoonlijk door.
4. Starten: `node server.js`. De site draait dan op http://localhost:3010/ (en in het thuisnetwerk op http://<ip-van-de-mini>:3010/).

Handige opdrachten:

```
node server.js --gebruiker jan "Jan van Veen" "Spreker"   # account erbij (wachtwoord wordt getoond)
node server.js --gebruiker naam --admin                   # account met beheerrechten
node server.js --wachtwoord piet                          # nieuw wachtwoord voor piet
```

Accounts toevoegen en wachtwoorden resetten kan ook in de site zelf, onder Beheer (alleen voor beheerders). Iedereen kan het eigen wachtwoord wijzigen onder Gegevens › Mijn account.

### Automatisch starten bij opstarten (launchd)

Maak `~/Library/LaunchAgents/nl.hvest.willembakker.plist` met de juiste paden:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>Label</key><string>nl.hvest.willembakker</string>
  <key>ProgramArguments</key><array><string>/usr/local/bin/node</string><string>/Users/JOUWNAAM/tutor-uil/h-vest/willembakker/server.js</string></array>
  <key>WorkingDirectory</key><string>/Users/JOUWNAAM/tutor-uil/h-vest/willembakker</string>
  <key>EnvironmentVariables</key><dict><key>PORT</key><string>3010</string></dict>
  <key>RunAtLoad</key><true/>
  <key>KeepAlive</key><true/>
  <key>StandardOutPath</key><string>/Users/JOUWNAAM/Library/Logs/willembakker.log</string>
  <key>StandardErrorPath</key><string>/Users/JOUWNAAM/Library/Logs/willembakker.log</string>
</dict></plist>
```

Daarna: `launchctl load ~/Library/LaunchAgents/nl.hvest.willembakker.plist`. Het pad naar `node` vind je met `which node` (bij Homebrew op Apple Silicon is dat `/opt/homebrew/bin/node`).

### Bereikbaar van buiten

Voor het team buiten het thuisnetwerk zet je de site achter een adres met https. Twee gangbare manieren:

- **Eigen domein, bijvoorbeeld h-vest.nl/willembakker**: een reverse proxy op de mini (Caddy regelt https automatisch) die `/willembakker/*` doorstuurt naar poort 3010. Start de server dan met `BASE_PATH=/willembakker node server.js`.
- **Zonder poorten openzetten**: Cloudflare Tunnel of Tailscale naar de mini.

Instellingen via omgevingsvariabelen: `PORT` (3010), `HOST` (0.0.0.0), `BASE_PATH` (leeg of bijv. `/willembakker`), `WB_DATA` (map voor de data).

## Back-up

De map `data/` is alles. Daarnaast kan iedere ingelogde gebruiker onder Gegevens een export (JSON) maken en terugzetten.

## Bronnen voor de feiten op het overzicht

World Archery, KHSN/handboogsport.nl, HSV De Vriendschap Waalre, Omroep Brabant, Eindhoven News, Financieel Zeker en willembakker.eu (verzameld op 2 november 2026).
