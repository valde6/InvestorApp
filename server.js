// ============================================
// SERVER.JS - Ejendomsinvesterings-app
// Entry point: starter Express og samler routes
// ============================================

const express = require('express');
require('dotenv').config();

// ============================================
// IMPORTS AF ROUTES
// ============================================

// Adressesøgning via DAWA
const adresserRoutes = require('./routes/adresser');

// Investeringscase-formularen (trin 3.1-3.5)
const investeringscasesRoutes = require('./routes/investeringscases');

// Ejendomsprofil - viser BBR-data og kort for en valgt adresse
const ejendommeRoutes = require('./routes/ejendomme');

// Forsiden - viser søgefelt og tidligere ejendomsprofiler
const forsideRoutes = require('./routes/forside');

// Ejendomsprofiler - Viser en ejendomsprofil ud fra data i databasen der er oprettet
const ejendomsprofilRoutes = require('./routes/ejendomsprofiler');

// Oversigt over investeringscasen
const oversigtRoutes = require('./routes/investeringscase-oversigt');

// Rediger investeringscase - viser en form med eksisterende data for at redigere en case
const redigerRoutes = require('./routes/rediger');

// Sammenlign investeringscase, Viser en sammenligning af 2 eksisterende cases
const sammenligning = require('./routes/sammenligning');

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// MIDDLEWARE
// ============================================

// Tillader at læse JSON i request body (fx fra POST/PUT)
app.use(express.json());

// Læser formulardata fra POST-requests og gør det tilgængeligt via req.body
// extended: true tillader komplekse strukturer som arrays (fx ekstra udgifter)
app.use(express.urlencoded({ extended: true }));

// Servér statiske filer (CSS, client-side JS, billeder) fra public/
app.use(express.static('public'));

// Sæt EJS som template engine
app.set('view engine', 'ejs');

// ============================================
// ROUTES
// ============================================

app.use('/api/adresser', adresserRoutes);
app.use('/investeringscases', investeringscasesRoutes);
app.use('/ejendomme', ejendommeRoutes);
app.use('/ejendomsprofiler', ejendomsprofilRoutes);
app.use('/', forsideRoutes);
app.use('/investeringscase-oversigt', oversigtRoutes);

// Redigering af investeringscase (trin 3.1-3.5)
// Registreres under /investeringscases så URL-strukturen bliver
// /investeringscases/:id/rediger/koeb - parallelt med oprettelsesflowet
// som ligger på /investeringscases/ny/koeb.
// Express sender alle requests der starter med /investeringscases
// videre til redigerRoutes, som derefter matcher /:id/rediger/koeb
app.use('/investeringscases', redigerRoutes);
app.use('/sammenligning', sammenligning);

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
    console.log(`Server kører på http://localhost:${PORT}`);
});