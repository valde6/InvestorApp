// ============================================
// routes/adresser.js
// HTTP-endpoints til adressesøgning
// ============================================

const express = require('express');
const router = express.Router();

const { søgAdresse } = require('../services/dawaService');

// GET /api/adresser/sog?q=solbjerg
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