const express = require('express');
const router = express.Router();

// Importer kortService for at kunne hente koordinater og bygge Skråfoto-URL i /ejendom/:id-routen
const { hentKoordinater, byggeLuftfotoUrl } = require('../services/kortService');

// Importer DAR-service til at oversætte adresse-ID til husnummer-ID
const { adresseIdTilHusnummerId } = require('../services/darService');

// Importer BBR-service til at hente bygnings- og enhedsdata
const { findBygninger, findEnheder } = require('../services/bbrService');


router.get('/:id', async (req, res) => {
    try {
        const adresseId = req.params.id;

        // Hent koordinater fra DAWA og byg Skråfoto-URL til kortvisning
        const { lon, lat } = await hentKoordinater(adresseId);
        const kortUrl = byggeLuftfotoUrl(lon, lat);

        // Oversæt adresse-ID til husnummer-ID via DAR (påkrævet af BBR)
        const husnummerId = await adresseIdTilHusnummerId(adresseId);

        // Hent bygningsdata fra BBR og tag den første aktive bygning
        const bygninger = await findBygninger(husnummerId);

        //Denne linje anvendes, idet der i bygningsarrayet kan være flere bygninger. Find finder den bygning i bygninger, der har koden for "bolig", så man
        //F.eks. ikke ender med en carport eller et udehus -> Det slår fejl når man kører resten af funktionerne og prøver ejs.
        const bygning = bygninger.find(byg => {
            const kode = parseInt(byg.byg021BygningensAnvendelse);
            return kode >= 110 && kode <= 199;
        });

        if (!bygning) {
            return res.status(404).json({ fejl: 'Ingen boligbygning fundet for denne adresse' });
        }

        // Hent enhedsdata (boligoplysninger) for den fundne bygning
        const enheder = await findEnheder(bygning.id_lokalId);
        const enhed = enheder[0];

        res.render('ejendom', { adresseId, kortUrl, bygning, enhed });
    } catch (error) {
        console.error('Fejl i /ejendomme/:id', error);
        res.status(500).json({ fejl: 'Kunne ikke hente ejendomsdata' });
    }

});

module.exports = router;