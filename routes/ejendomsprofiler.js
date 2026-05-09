// ============================================
// routes/ejendomsprofiler.js
// Viser en gemt ejendomsprofil fra databasen
// og håndterer sletning af profiler.
// Modsat routes/ejendomme.js som kun viser
// et live BBR-preview, arbejder denne route
// udelukkende med data der allerede er gemt.
// ============================================

const express = require('express');
const router = express.Router();
const { pool, poolConnect, sql } = require('../services/db');
const { hentKoordinater, byggeLuftfotoUrl } = require('../services/kortService');

// GET /ejendomsprofiler/:id
// Henter profilen og alle tilknyttede investeringscases fra databasen
// og renderer ejendomsprofil.ejs med kortvisning
router.get('/:id', async (req, res) => {
    try {
        await poolConnect;

        const request = pool.request();
        request.input('id', sql.Int, req.params.id);
        const result = await request.query(`
            SELECT * FROM Ejendomsprofil WHERE ejendomsprofil_id = @id
        `);
        const profil = result.recordset[0];

        // Hvis profilen ikke findes i databasen — vis 404
        if (!profil) {
            return res.status(404).send('Profil ikke fundet');
        }

        // Hent alle investeringscases tilknyttet denne profil
        // Vises som en liste på profilsiden så brugeren kan åbne dem
        const casesRequest = pool.request();
        casesRequest.input('id', sql.Int, req.params.id);
        const casesResult = await casesRequest.query(`
            SELECT investeringscase_id, navn, oprettet_dato 
            FROM Investeringscase 
            WHERE ejendomsprofil_id = @id
        `);
        const cases = casesResult.recordset;

        // Hent koordinater fra DAWA via adresse_id og byg luftfoto-URL
        // adresse_id er det DAWA-UUID vi gemte da profilen blev oprettet
        const { lon, lat } = await hentKoordinater(profil.adresse_id);
        const kortUrl = byggeLuftfotoUrl(lon, lat);

        res.render('ejendomsprofil', {
            profil,
            kortUrl,
            adresse: profil.adresse,
            cases
        });

    } catch (err) {
        console.error('Fejl ved hentning af ejendomsprofil:', err);
        res.status(500).send('Der skete en fejl');
    }
});

// POST /ejendomsprofiler/:id/slet
// Sletter profilen fra databasen.
// ON DELETE CASCADE i schema.sql sørger for at alle
// tilknyttede investeringscases og deres data også forsvinder automatisk.
router.post('/:id/slet', async (req, res) => {
    try {
        await poolConnect;

        const request = pool.request();
        request.input('id', sql.Int, req.params.id);

        await request.query(`
            DELETE FROM Ejendomsprofil WHERE ejendomsprofil_id = @id
        `);

        res.redirect('/');

    } catch (err) {
        console.error('Fejl ved sletning af ejendomsprofil:', err);
        res.status(500).send('Der skete en fejl ved sletning.');
    }
});

module.exports = router;