// ============================================
// SERVER.JS — Ejendomsinvesterings-app
// Entry point: starter Express og samler routes
// ============================================

const express = require('express');
require('dotenv').config();

// Importer vores route-fil (samme princip som G7's routes/listings.js)
//const ejendommeRoutes = require('./routes/ejendomme');

const adresserRoutes = require('./routes/adresser');

const investeringscasesRoutes = require('./routes/investeringscases');

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// MIDDLEWARE
// ============================================

// Tillader at læse JSON i request body (fx fra POST/PUT)
app.use(express.json());

// express.urlencoded er en middleware, der læser formlardata fra en post-request og omskriver det til læseligt for express.
// extended: true betyder at den kan håndtere lidt mere komplekse strukturer fx arrays (vores ekstra udgifter)
app.use(express.urlencoded({ extended: true }));

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


const ejendommeRoutes = require('./routes/ejendomme');
app.use('/ejendomme', ejendommeRoutes);



// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
    console.log(`Server kører på http://localhost:${PORT}`);
});