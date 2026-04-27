// ============================================
// SERVER.JS — Ejendomsinvesterings-app
// Entry point: starter Express og samler routes
// ============================================

const express = require('express');
require('dotenv').config();

// Importer vores route-fil (samme princip som G7's routes/listings.js)
//const ejendommeRoutes = require('./routes/ejendomme');

const adresserRoutes = require('./routes/adresser');
const { hentKoordinater } = require('./services/dawaService');
const { byggeLuftfotoUrl } = require('./services/kortService');

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

// Sæt EJS som template engine
app.set('view engine', 'ejs');

// ============================================
// ROUTES
// ============================================

// Forsiden — render index.ejs
app.get('/', (req, res) => {
    res.render('index');
});

// Henter koordinater fra DAWA baseret på adresse-ID fra URL'en.
// Bygger en Skråfoto-URL og sender den til ejendom.ejs som kortUrl.
app.get('/ejendom/:id', async (req, res) => {
    const adresseId = req.params.id;
    const { lon, lat } = await hentKoordinater(adresseId);
    const kortUrl = byggeLuftfotoUrl(lon, lat);
    res.render('ejendom', { adresseId, kortUrl });
});


// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
    console.log(`Server kører på http://localhost:${PORT}`);
});