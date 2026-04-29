const { pool, poolConnect, sql } = require('../services/db');
const express = require('express');
const router = express.Router();

// Importer kortService for at kunne hente koordinater og bygge Skråfoto-URL i /ejendom/:id-routen
const { hentKoordinater, byggeLuftfotoUrl } = require('../services/kortService');

// Importer DAR-service til at oversætte adresse-ID til husnummer-ID
const { adresseIdTilHusnummerId } = require('../services/darService');

// Importer BBR-service til at hente bygnings- og enhedsdata
const { findBygninger, findEnheder } = require('../services/bbrService');

// Importer DAWA-service for at kunne hente den fulde adresse
const { hentAdresse } = require('../services/dawaService');

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
        const bygninger = await findBygninger(husnummerId);
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

        // Gem eller find eksisterende ejendomsprofil i databasen
        await poolConnect;
        const profileRequest = pool.request();
        profileRequest.input('adresse_id', sql.VarChar, adresseId); // TIlføjer også adresse id til DB så det er nemmere at opbygge luftfoto senere
        profileRequest.input('adresse', sql.VarChar, adresse);
        profileRequest.input('ejendomstype', sql.VarChar, bygning.byg021BygningensAnvendelse);
        profileRequest.input('byggeaar', sql.Int, bygning.byg026Opførelsesår || null);
        profileRequest.input('boligareal_m2', sql.Int, enhed?.enh026EnhedensSamledeAreal || null);
        profileRequest.input('antal_vaerelser', sql.Int, enhed?.enh031AntalVærelser || null);

        const profileResult = await profileRequest.query(`
            INSERT INTO Ejendomsprofil (adresse_id, adresse, ejendomstype, byggeaar, boligareal_m2, antal_vaerelser)
            OUTPUT INSERTED.ejendomsprofil_id
            VALUES (@adresse_id, @adresse, @ejendomstype, @byggeaar, @boligareal_m2, @antal_vaerelser)
        `);
        const ejendomsprofil_id = profileResult.recordset[0].ejendomsprofil_id;

        res.render('ejendom', {
            adresseId,
            kortUrl,
            bygning,
            enhed,
            adresse,
            ejendomsprofil_id,
            // Tom liste — nye ejendomme har ingen cases endnu
            cases: []
        });
    } catch (error) {
        console.error('Fejl i /ejendomme/:id', error);
        res.status(500).json({ fejl: 'Kunne ikke hente ejendomsdata' });
    }

});

module.exports = router;