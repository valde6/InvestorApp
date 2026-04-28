// ============================================
// routes/forside.js
// HTTP-endpoints til forsiden
// ============================================

const express = require('express');
const router = express.Router();

// Importer databaseforbindelsen
const { pool, poolConnect, sql } = require('../services/db');

// GET / — viser forsiden med tidligere ejendomsprofiler
router.get('/', async (req, res) => {
    try {
        // Vent på at databaseforbindelsen er klar
        await poolConnect;

        // Hent alle ejendomsprofiler og tæl antal tilknyttede investeringscases
        // LEFT JOIN sikrer at ejendomme uden cases stadig vises med antal_cases = 0
        // GROUP BY er påkrævet når COUNT() bruges — alle ikke-aggregerede kolonner skal med
        // ORDER BY viser nyeste ejendomme øverst
        const result = await pool.request().query(`
            SELECT e.ejendomsprofil_id, e.adresse, e.ejendomstype, e.oprettet_dato,
                   COUNT(i.investeringscase_id) AS antal_cases
            FROM Ejendomsprofil e
            LEFT JOIN Investeringscase i ON e.ejendomsprofil_id = i.ejendomsprofil_id
            GROUP BY e.ejendomsprofil_id, e.adresse, e.ejendomstype, e.oprettet_dato
            ORDER BY e.oprettet_dato DESC
        `);
        console.log('Antal ejendomme hentet:', result.recordset.length); // Debug: tjek at vi får data tilbage fra databasen

        // Send ejendomsprofilerne til index.ejs som variablen 'ejendomme'
        res.render('index', { ejendomme: result.recordset });

    } catch (err) {
        console.error('Fejl ved hentning af ejendomme:', err);
        // Ved fejl vises forsiden stadig — bare med tom liste
        res.render('index', { ejendomme: [] });
    }
});

module.exports = router;