const { pool, poolConnect, sql } = require('../services/db');
const express = require('express');
const router = express.Router();

// Importer kortService for at kunne hente koordinater og bygge Skråfoto-URL i /ejendom/:id-routen
const { hentKoordinater, byggeLuftfotoUrl } = require('../services/kortService');

// Importer DAR-service til at oversætte adresse-ID til husnummer-ID
const { adresseIdTilHusnummerId, husnummerTilBygningBfe } = require('../services/darService');

// Importer BBR-service til at hente bygnings- og enhedsdata
const { findBygninger, findEnheder, findGrund, oversætAnvendelse, findBygningViaBfe } = require('../services/bbrService');

// Importer DAWA-service for at kunne hente den fulde adresse
const { hentAdresse } = require('../services/dawaService');

//Importer BBR-service til at oversætte boligens anvendelseskode
const { oversætAnvendelse } = require('../services/bbrService');


router.get('/:id', async (req, res) => {
    try {
        const adresseId = req.params.id;

        // Hent koordinater fra DAWA og byg Skråfoto-URL til kortvisning
        const { lon, lat } = await hentKoordinater(adresseId);
        const kortUrl = byggeLuftfotoUrl(lon, lat);
        const adresse = await hentAdresse(adresseId);
        // Oversæt adresse-ID til husnummer-ID via DAR (påkrævet af BBR)
        const husnummerId = await adresseIdTilHusnummerId(adresseId);

        // Hent bygningsdata fra BBR og tag den første aktive bygning
        let bygninger = await findBygninger(husnummerId);

        // Fallback til enhed-opslag hvis bygning ikke findes direkte via husnummer-ID.
        // Dette sker typisk for lejligheder i etageejendomme, hvor bygningen er knyttet
        // til selve ejendommen frem for den individuelle lejlighedsadresse.
        if (!bygninger.length) {
            const bfeNummer = await husnummerTilBygningBfe(husnummerId);
            if (bfeNummer) {
                const bygning = await findBygningViaBfe(bfeNummer);
                if (bygning) bygninger = [bygning];
            }
        }

        //console.log('Bygningskoder:', bygninger.map(b => b.byg021BygningensAnvendelse)); -> kan bruges til at debugge og se hvilke anvendelseskoder der kommer tilbage i data

        //Denne linje anvendes, idet der i bygningsarrayet kan være flere bygninger. Find finder den bygning i bygninger, der har koden for "bolig", så man
        //F.eks. ikke ender med en carport eller et udehus -> Det slår fejl når man kører resten af funktionerne og prøver ejs.
        const bygning = bygninger.find(byg => {
            const kode = parseInt(byg.byg021BygningensAnvendelse);
            return kode >= 110 && kode <= 299;
        });


        //Denne returnerer hvis ikke der kan findes nogle "korrekte" boligtyper. 
        if (!bygning) {
            return res.render('fejl', { besked: 'Vi kunne ikke finde boligdata for denne adresse. Dette kan skyldes at ejendommen er registreret som erhverv, har en ukendt bygningstype, eller ikke er registreret korrekt i BBR. Prøv en anden adresse.' });
        }


        // Hent enhedsdata (boligoplysninger) for den fundne bygning
        const enheder = await findEnheder(bygning.id_lokalId);
        const enhed = enheder[0];

        // Send BBR-data til viewet uden at gemme i DB
        res.render('ejendom', {
            adresseId,
            kortUrl,
            bygning,
            enhed,
            adresse,
            // Ingen ejendomsprofil_id endnu — profilen er ikke oprettet
            ejendomsprofil_id: null,
        });
    } catch (error) {
        console.error('Fejl i /ejendomme/:id', error);
        res.status(500).json({ fejl: 'Kunne ikke hente ejendomsdata' });
    }

});

// POST /ejendomme/:id/opret
// Opretter en ejendomsprofil i databasen ud fra BBR-data sendt fra formularen
router.post('/:id/opret', async (req, res) => {
    try {
        await poolConnect;

        const adresseId = req.params.id;
        const { adresse, ejendomstype, byggeaar, boligareal_m2, antal_vaerelser } = req.body;

        // Tjek om der allerede findes en profil med dette adresse_id
        const tjekRequest = pool.request();
        tjekRequest.input('adresse_id', sql.VarChar, adresseId);
        const tjekResult = await tjekRequest.query(`
            SELECT ejendomsprofil_id FROM Ejendomsprofil
            WHERE adresse_id = @adresse_id
        `);

        // Hvis der allerede findes en profil — send brugeren direkte derhen
        if (tjekResult.recordset.length > 0) {
            const eksisterendeId = tjekResult.recordset[0].ejendomsprofil_id;
            return res.redirect('/ejendomsprofiler/' + eksisterendeId);
        };

        // Oversæt BBR-koden til læsbart navn inden vi gemmer
        const ejendomstypeNavn = oversætAnvendelse(ejendomstype);

        const request = pool.request();
        request.input('adresse_id', sql.VarChar, adresseId);
        request.input('adresse', sql.VarChar, adresse);
        request.input('ejendomstype', sql.VarChar, ejendomstypeNavn || 'Ukendt');
        request.input('byggeaar', sql.Int, byggeaar ? parseInt(byggeaar) : null);
        request.input('boligareal_m2', sql.Int, boligareal_m2 ? parseInt(boligareal_m2) : null);
        request.input('antal_vaerelser', sql.Int, antal_vaerelser ? parseInt(antal_vaerelser) : null);


        //Vi anvender OUTPUT INSERTED til at fange det autogenerede ejendomsprofil_ID som Databasen selv laver.
        //Vi anvende rbagefter dette til at redirecte brugeren til ejendomsprofilen de lige har oprettet med result.recordset[0].
        const result = await request.query(`
            INSERT INTO Ejendomsprofil 
                (adresse_id, adresse, ejendomstype, byggeaar, boligareal_m2, antal_vaerelser)
            OUTPUT INSERTED.ejendomsprofil_id 
            VALUES 
                (@adresse_id, @adresse, @ejendomstype, @byggeaar, @boligareal_m2, @antal_vaerelser)
        `);

        const ejendomsprofil_id = result.recordset[0].ejendomsprofil_id;

        res.redirect('/ejendomsprofiler/' + ejendomsprofil_id);

    } catch (err) {
        console.error('Fejl ved oprettelse af ejendomsprofil:', err);
        res.status(500).send('Der skete en fejl ved oprettelse af ejendomsprofil.');
    }
});

module.exports = router;