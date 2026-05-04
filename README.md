# InvestorApp

Gruppe 30 — HA(it), CBS, forår 2026

Webapplikation til analyse og simulering af ejendomsinvesteringer. Søg på en dansk adresse, hent BBR-data automatisk, og byg en investeringscase med køb, finansiering, renovering, drift og udlejning. Appen simulerer cashflow, gæld og egenkapital over 30 år.

## Krav

- Node.js v18+
- En SQL Server database (vi bruger Azure SQL)
- En bruger på [datafordeler.dk](https://datafordeler.dk) med adgang til BBR og DAR

## Kom i gang

Klon repo og installér dependencies:

```bash
git clone https://github.com/valde6/InvestorApp.git
cd InvestorApp
npm install
```

Kopiér eksempel-miljøfilen og udfyld dine egne værdier:

```bash
cp ".env example" .env
```

`.env` skal indeholde:

```
DB_SERVER=din-server.database.windows.net
DB_NAME=dit-databasenavn
DB_USER=dit-brugernavn
DB_PASSWORD=dit-password

DATAFORDELER_USERNAME=dit-brugernavn
DATAFORDELER_PASSWORD=dit-password
```

Kør `database/schema.sql` i din SQL-klient for at oprette tabellerne, og derefter `database/seed.sql` for eksempeldata.

Start serveren:

```bash
node server.js
```

Gå til [http://localhost:3000](http://localhost:3000)

## Projektstruktur

```
├── server.js                        # Entry point
├── routes/                          # En fil per side/flow
│   ├── forside.js                   # Søgefelt + tidligere profiler
│   ├── ejendomme.js                 # BBR-opslag og profiloprettelse
│   ├── ejendomsprofiler.js          # Vis, rediger og slet profiler
│   ├── investeringscases.js         # 5-trins formular
│   ├── investeringscase-oversigt.js # Simuleringsresultater
│   ├── rediger.js                   # Rediger, dupliker og slet cases
│   ├── sammenligning.js             # Sammenlign to cases
│   └── adresser.js                  # API-endpoint til autocomplete
├── services/                        # Eksterne API-kald
│   ├── dawaService.js               # Adressesøgning
│   ├── darService.js                # Husnummer-ID og BFE-opslag
│   ├── bbrService.js                # Bygnings- og boligdata
│   ├── kortService.js               # Luftfoto-URL
│   └── db.js                        # Databaseforbindelse
├── models/                          # Forretningslogik
│   ├── finansiering.js              # Annuitetsberegning
│   ├── driftsbudget.js              # Løbende udgifter
│   ├── udlejning.js                 # Lejeindtægter
│   ├── renovering.js                # Engangsudgifter
│   └── simulering.js                # 30-årig simulering
├── views/                           # EJS-templates
├── public/                          # CSS og client-side JS
├── database/                        # SQL-filer
└── test-models/                     # Unittests
```

## Tests

```bash
node --test test-models/test-driftsbudget.js
node --test test-models/test-udlejning.js
node --test test-models/test-renovering.js
```

## Kendte begrænsninger

Grundareal vises ikke for lejligheder i etageejendomme. BBR knytter grundareal til matriklen og ikke til den individuelle lejlighed, hvilket kræver et ekstra opslag via DAR's BFE-endpoint. Vi har kortlagt løsningen men valgt at prioritere andre dele af projektet.
