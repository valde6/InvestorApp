// ============================================
// routes/adresser.js
// Endpoint til adressesøgning via DAWA.
// Kaldes fra frontend mens brugeren skriver
// og returnerer forslag som JSON til autocomplete.
// ============================================

const express = require('express');
const router = express.Router();
const { søgAdresse } = require('../services/dawaService');

// GET /api/adresser/sog?q=solbjerg
// q er det brugeren har skrevet indtil videre.
// Svaret er et array af adresseforslag som forsiden bruger til at vise en dropdown.
router.get('/sog', async (req, res) => {
    const q = req.query.q;

    try {
        const forslag = await søgAdresse(q);
        res.json(forslag);
    } catch (error) {
        console.error('Fejl ved adressesøgning:', error);
        res.status(500).json({ fejl: 'Kunne ikke hente adresser' });
    }
});

module.exports = router;