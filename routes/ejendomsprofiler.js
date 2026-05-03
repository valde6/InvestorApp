const express = require('express');
const router = express.Router();
const { pool, poolConnect, sql } = require('../services/db');
const { hentKoordinater, byggeLuftfotoUrl } = require('../services/kortService');

router.get('/:id', async (req, res) => {
    try {
        await poolConnect;
        const request = pool.request();
        request.input('id', sql.Int, req.params.id);
        const result = await request.query(`
            SELECT * FROM Ejendomsprofil WHERE ejendomsprofil_id = @id
        `);
        const profil = result.recordset[0];

        if (!profil) {
            return res.status(404).send('Profil ikke fundet');
        }
        const casesRequest = pool.request();
        casesRequest.input('id', sql.Int, req.params.id);
        const casesResult = await casesRequest.query(`
            SELECT investeringscase_id, navn, oprettet_dato 
            FROM Investeringscase 
            WHERE ejendomsprofil_id = @id
        `);
        const cases = casesResult.recordset;

        const { lon, lat } = await hentKoordinater(profil.adresse_id);
        const kortUrl = byggeLuftfotoUrl(lon, lat);

        res.render('ejendomsprofil', {
            profil,        // hele DB-rækken direkte
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
// Sletter ejendomsprofilen. ON DELETE CASCADE sørger automatisk for
// at alle tilknyttede investeringscases og deres data også slettes
router.post('/:id/slet', async (req, res) => {
    try {
        await poolConnect;

        const request = pool.request();
        request.input('id', sql.Int, req.params.id);

        await request.query(`
            DELETE FROM Ejendomsprofil WHERE ejendomsprofil_id = @id
        `);

        // Send brugeren tilbage til forsiden efter sletning
        res.redirect('/');

    } catch (err) {
        console.error('Fejl ved sletning af ejendomsprofil:', err);
        res.status(500).send('Der skete en fejl ved sletning.');
    }
});

module.exports = router;

