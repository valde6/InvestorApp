//==================================
// routes/ejendomme.js
//Anvendes når en bruger har fundet en legitim ejendom, og har aktivt trykket på den
//Efter de har søgt gennem sog.js, og adresser.js
//Anvender de forskellige eksterne API service fra services, til at hente den nødvendige info
//Til at opbygge en side der sendes til viewert
//==================================


//Starter databaseconneciton for at sikre at profilen kan gemmes i databasen
const { pool, poolConnect, sql } = require('../services/db');
const express = require('express');
const router = express.Router();

//kortService bruges til at hente koordinater og bygge Skråfoto-URL til kortvisning
const { hentKoordinater, byggeLuftfotoUrl } = require('../services/kortService');

// arService oversætter adresse-ID til husnummer-ID (påkrævet af BBR)
const { adresseIdTilHusnummerId, husnummerTilBygningBfe } = require('../services/darService');

//bbrService henter bygnings- og enhedsdata fra Datafordeler
const { findBygningViaId, findBygningViaBfe, oversætAnvendelse, findEnhedViaAdresse } = require('../services/bbrService');

//dawaService henter adressetekst og adgangsadresse (inkl. jordstykke-href til grundareal)
const { hentAdresse, hentAdgangsadresse } = require('../services/dawaService');

// matrikelService henter grundareal fra DAWA's jordstykke-endpoint
const { hentGrundareal } = require('../services/matrikelService');


// GET /ejendomme/:id
// Henter BBR-data for en adresse og viser dem uden at gemme noget i databasen.
// Brugeren kan herefter vælge at oprette en ejendomsprofil.
router.get('/:id', async (req, res) => {
    try {
        const adresseId = req.params.id;

        // Hent koordinater og byg luftfoto-URL til kortvisning
        const { lon, lat } = await hentKoordinater(adresseId);
        const kortUrl = byggeLuftfotoUrl(lon, lat);

        // Hent den fulde adressetekst fra DAWA
        const adresse = await hentAdresse(adresseId);

        // Forsøg at hente enhed direkte via adresse-ID.
        // Dette virker for alle adressetyper - også ejerlejligheder,
        // fordi BBR knytter enheden til adressen via adresseIdentificerer.
        const alleEnheder = await findEnhedViaAdresse(adresseId);

        const enhed = alleEnheder.find(e => e.adresseIdentificerer === adresseId) || alleEnheder[0];

        // Hent bygningen via enhedens bygnings-ID.
        // Dette er mere robust end at gå via husnummer-ID, da ejerlejligheder
        // ikke altid har en direkte bygningskobling via husnummeret.
        let bygninger = enhed ? await findBygningViaId(enhed.bygning) : [];

        // Fallback: hvis bygning stadig ikke findes, forsøg via husnummer -> BFE-nummer.
        // Dette håndterer etageejendomme hvor bygningen er knyttet til ejendommen
        // frem for den individuelle lejlighedsadresse.
        if (!bygninger.length) {
            const husnummerId = await adresseIdTilHusnummerId(adresseId);
            const bfeNummer = await husnummerTilBygningBfe(husnummerId);
            if (bfeNummer) {
                const bygningViaFbe = await findBygningViaBfe(bfeNummer);
                if (bygningViaFbe) bygninger = [bygningViaFbe];
            }
        }

        // Find den relevante boligbygning ud fra anvendelseskode (110–190 = bolig (Inden for gruppes definerede ramme)).
        // Dette sikrer at vi ikke ender med en carport, garage eller erhvervsbygning.
        const bygning = bygninger.find(byg => {
            const kode = parseInt(byg.byg021BygningensAnvendelse);
            return kode >= 110 && kode <= 190;
        });

        //Vis fejlside hvis ingen boligbygning kunne identificeres
        if (!bygning) {
            return res.render('fejl', {
                besked: 'Vi kunne ikke finde boligdata for denne adresse. Dette kan skyldes at ejendommen er registreret som erhverv, har en ukendt bygningstype, eller ikke er registreret korrekt i BBR. Prøv en anden adresse.'
            });
        }

        //Hent adgangsadresse for at afgøre om det er en lejlighed og for at få jordstykke-href
        const adgangsadresse = await hentAdgangsadresse(adresseId);

        //Grundareal hentes kun for ikke-lejligheder, idet lejligheder giver grundareal
        //ikke mening da grunden tilhører hele ejendommen, ikke den individuelle bolig.
        //Vi anvender anvendelseskoden til at definere om ejendommens grundareal er relevant at indhente eller ej. Vi har via. BBR's anvendelseskoder fundet frem til at det
        //Kun er relevant for anvendelskoder under 140
        const anvendelseskode = parseInt(bygning.byg021BygningensAnvendelse);
        const erLejlighed = anvendelseskode >= 140;
        const grundareal = erLejlighed ? null : await hentGrundareal(adgangsadresse.jordstykke.href);

        // Send BBR-data til viewet uden at gemme i databasen
        res.render('ejendom', {
            adresseId,
            kortUrl,
            bygning,
            enhed,
            adresse,
            grundareal
        });

    } catch (error) {
        console.error('Fejl i /ejendomme/:id', error);
        res.status(500).json({ fejl: 'Kunne ikke hente ejendomsdata' });
    }
});


//POST /ejendomme/:id/opret
//Opretter en ejendomsprofil i databasen ud fra BBR-data sendt som hidden inputs fra formularen.
//Hvis profilen allerede findes (samme adresse_id), sendes brugeren direkte derhen.
router.post('/:id/opret', async (req, res) => {
    try {
        await poolConnect;

        const adresseId = req.params.id;
        const { adresse, ejendomstype, byggeaar, boligareal_m2, antal_vaerelser, grundareal_m2 } = req.body;

        // Tjek om der allerede findes en profil med dette adresse-ID
        const tjekRequest = pool.request();
        tjekRequest.input('adresse_id', sql.VarChar, adresseId);
        const tjekResult = await tjekRequest.query(`
            SELECT ejendomsprofil_id FROM Ejendomsprofil
            WHERE adresse_id = @adresse_id
        `);

        // Profil eksisterer allerede - send brugeren direkte derhen
        if (tjekResult.recordset.length > 0) {
            const eksisterendeId = tjekResult.recordset[0].ejendomsprofil_id;
            return res.redirect('/ejendomsprofiler/' + eksisterendeId);
        }

        // Oversæt BBR-anvendelseskoden til læsbart navn inden gemning i database 
        //Så det ikke behøver blive gjort på et andet tidspunkt
        const ejendomstypeNavn = oversætAnvendelse(ejendomstype);

        // Gem den nye ejendomsprofil i databasen.
        // OUTPUT INSERTED bruges til at fange det auto-genererede ejendomsprofil_id
        // som databasen selv tildeler, så vi kan redirecte brugeren til den nye profil.
        const request = pool.request();
        request.input('adresse_id', sql.VarChar, adresseId);
        request.input('adresse', sql.VarChar, adresse);
        request.input('ejendomstype', sql.VarChar, ejendomstypeNavn || 'Ukendt');
        request.input('byggeaar', sql.Int, byggeaar ? parseInt(byggeaar) : null);
        request.input('boligareal_m2', sql.Int, boligareal_m2 ? parseInt(boligareal_m2) : null);
        request.input('antal_vaerelser', sql.Int, antal_vaerelser ? parseInt(antal_vaerelser) : null);
        request.input('grundareal_m2', sql.Int, grundareal_m2 ? parseInt(grundareal_m2) : null);

        const result = await request.query(`
            INSERT INTO Ejendomsprofil 
                (adresse_id, adresse, ejendomstype, byggeaar, boligareal_m2, antal_vaerelser, grundareal_m2)
            OUTPUT INSERTED.ejendomsprofil_id 
            VALUES 
                (@adresse_id, @adresse, @ejendomstype, @byggeaar, @boligareal_m2, @antal_vaerelser, @grundareal_m2)
        `);

        const ejendomsprofil_id = result.recordset[0].ejendomsprofil_id;
        res.redirect('/ejendomsprofiler/' + ejendomsprofil_id);

    } catch (err) {
        console.error('Fejl ved oprettelse af ejendomsprofil:', err);
        res.status(500).send('Der skete en fejl ved oprettelse af ejendomsprofil.');
    }
});

module.exports = router;