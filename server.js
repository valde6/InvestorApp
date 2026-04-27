// ============================================
// SERVER.JS — Ejendomsinvesterings-app
// Entry point: starter Express og samler routes
// ============================================

const express = require('express');
require('dotenv').config();

// Importer vores route-fil (samme princip som G7's routes/listings.js)
//const ejendommeRoutes = require('./routes/ejendomme');

const adresserRoutes = require('./routes/adresser');
// Importer kortService for at kunne hente koordinater og bygge Skråfoto-URL i /ejendom/:id-routen
const { hentKoordinater, byggeLuftfotoUrl } = require('./services/kortService');

// Importer DAR-service til at oversætte adresse-ID til husnummer-ID
const { adresseIdTilHusnummerId } = require('./services/darService');
// Importer BBR-service til at hente bygnings- og enhedsdata
const { findBygninger, findEnheder } = require('./services/bbrService');

const investeringscasesRoutes = require('./routes/investeringscases');

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// MIDDLEWARE
// ============================================

// Tillader at læse JSON i request body (fx fra POST/PUT)
app.use(express.json());

// Servér statiske filer (CSS, client-side JS, billeder) fra public/
app.use(express.static('public'));

//
app.use('/api/adresser', adresserRoutes);

app.use('/investeringscases', investeringscasesRoutes);

// Sæt EJS som template engine
app.set('view engine', 'ejs');

// ============================================
// ROUTES
// ============================================

// Forsiden — render index.ejs
app.get('/', (req, res) => {
    res.render('index');
});



app.get('/ejendom/:id', async (req, res) => {
    const adresseId = req.params.id;

    // Hent koordinater fra DAWA og byg Skråfoto-URL til kortvisning
    const { lon, lat } = await hentKoordinater(adresseId);
    const kortUrl = byggeLuftfotoUrl(lon, lat);

    // Oversæt adresse-ID til husnummer-ID via DAR (påkrævet af BBR)
    const husnummerId = await adresseIdTilHusnummerId(adresseId);

    // Hent bygningsdata fra BBR og tag den første aktive bygning
    const bygninger = await findBygninger(husnummerId);
    const bygning = bygninger[0];

    // Hent enhedsdata (boligoplysninger) for den fundne bygning
    const enheder = await findEnheder(bygning.id_lokalId);
    const enhed = enheder[0];

    res.render('ejendom', { adresseId, kortUrl, bygning, enhed });
});


// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
    console.log(`Server kører på http://localhost:${PORT}`);
});