// ============================================
// routes/oversigt/oversigt.js
// Henter data fra databasen, kører simulering
// og sender resultater til oversigts-siden
// ============================================

const express = require('express');
const router = express.Router();
const { pool, poolConnect, sql } = require('../services/db');

const Finansiering = require('../models/finansiering');
const Driftsbudget = require('../models/driftsbudget');
const Udlejning = require('../models/udlejning');
const Renovering = require('../models/renovering');
const Simulering = require('../models/simulering');

// GET /oversigt?id=x
router.get('/', async (req, res) => {
    await poolConnect;

    const investeringscase_id = req.query.id;

    try {
        // Hent investeringscase
        const caseRequest = pool.request();
        caseRequest.input('id', sql.Int, investeringscase_id);
        const caseResult = await caseRequest.query(`
            SELECT * FROM Investeringscase WHERE investeringscase_id = @id
        `);
        const sagen = caseResult.recordset[0];

        // Hent finansiering
        const finansRequest = pool.request();
        finansRequest.input('id', sql.Int, investeringscase_id);
        const finansResult = await finansRequest.query(`
            SELECT * FROM Finansiering WHERE investeringscase_id = @id
        `);
        const finansData = finansResult.recordset[0];

        // Hent driftsomkostninger
        const driftsRequest = pool.request();
        driftsRequest.input('id', sql.Int, investeringscase_id);
        const driftsResult = await driftsRequest.query(`
            SELECT o.* FROM Driftsomkostning o
            JOIN Driftsbudget b ON o.driftsbudget_id = b.driftsbudget_id
            WHERE b.investeringscase_id = @id
        `);

        // Hent udlejning
        const udlejningRequest = pool.request();
        udlejningRequest.input('id', sql.Int, investeringscase_id);
        const udlejningResult = await udlejningRequest.query(`
            SELECT * FROM Udlejning WHERE investeringscase_id = @id
        `);

        // Hent renoveringer
        const renoveringRequest = pool.request();
        renoveringRequest.input('id', sql.Int, investeringscase_id);
        const renoveringResult = await renoveringRequest.query(`
            SELECT * FROM Renovering WHERE investeringscase_id = @id
        `);

        // Hent ekstra købsomkostninger
        // Disse er variable udgifter brugeren selv har tilføjet i trin 1 (udover de faste felter)
        const koebsRequest = pool.request();
        koebsRequest.input('id', sql.Int, investeringscase_id);
        const koebsResult = await koebsRequest.query(`
            SELECT * FROM Koebsomkostning WHERE investeringscase_id = @id
        `);

        // --- BYGG MODEL-OBJEKTER FRA DATABASE-DATA ---

        // Byg Finansiering-objekt
        const finansiering = finansData ? new Finansiering(
            finansData.laanebeloeb,
            finansData.rente_procent / 100,
            finansData.loebetid_aar,
            finansData.afdragsfri_periode_aar
        ) : null; // håndter tilfælde uden finansiering

        // Byg Driftsbudget-objekt og tilføj poster
        const driftsbudget = new Driftsbudget();
        driftsResult.recordset.forEach(post => {
            driftsbudget.tilfoejPost(post.beskrivelse, post.maanedlig_beloeb);
        });

        // Byg Udlejning-objekt hvis der er udlejningsdata
        const udlejningData = udlejningResult.recordset[0];
        const udlejning = udlejningData
            ? new Udlejning(udlejningData.maanedlig_leje, udlejningData.udlejningsomkostning)
            : null; // håndter tilfælde uden udlejning

        // Byg Renovering-objekter
        const renoveringer = renoveringResult.recordset.map(r => {
            // Beregn tidspunkt i år ud fra dato
            const tidspunktAar = new Date(r.tidspunkt).getFullYear() - new Date().getFullYear();
            return new Renovering(r.beskrivelse, r.beloeb, tidspunktAar);
        });

        // --- KØR SIMULERING ---
        const simulering = new Simulering(finansiering, driftsbudget, udlejning, renoveringer, 30);
        const simuleringResultater = simulering.beregnSimulering(sagen.ejendomspris);

        // Send alt til EJS-siden
        res.render('investeringscase-oversigt', {
            sagen,
            finansiering: finansData,
            driftsomkostninger: driftsResult.recordset,
            udlejninger: udlejningResult.recordset,
            koebsomkostninger: koebsResult.recordset,
            renoveringer: renoveringResult.recordset,
            finansieringModel: finansiering,
            simulering: simuleringResultater,
            ejendomsprofil_id: sagen.ejendomsprofil_id
        });
        // Fejlhåndtering
    } catch (err) {
        console.error('Fejl ved hentning af oversigt:', err);
        res.status(500).send('Der skete en fejl. Prøv igen.');
    }
});

module.exports = router;