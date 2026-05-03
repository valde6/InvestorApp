const express = require('express');
const router = express.Router();
const { pool, poolConnect, sql } = require('../services/db');
const Finansiering = require('../models/finansiering');
const Driftsbudget = require('../models/driftsbudget');
const Udlejning = require('../models/udlejning');
const Renovering = require('../models/renovering');
const Simulering = require('../models/simulering');

// Hjælpefunktion — henter alt data for én case og kører simulering
// Vi laver den som en separat funktion fordi vi skal bruge den to gange (case A og case B)
async function hentCaseMedSimulering(id) {
    const caseReq = pool.request();
    caseReq.input('id', sql.Int, id);
    const caseRes = await caseReq.query(`SELECT * FROM Investeringscase WHERE investeringscase_id = @id`);
    const sagen = caseRes.recordset[0];
    if (!sagen) return null;

    const finansReq = pool.request();
    finansReq.input('id', sql.Int, id);
    const finansRes = await finansReq.query(`SELECT * FROM Finansiering WHERE investeringscase_id = @id`);
    const finansData = finansRes.recordset[0];

    const driftsReq = pool.request();
    driftsReq.input('id', sql.Int, id);
    const driftsRes = await driftsReq.query(`
        SELECT o.* FROM Driftsomkostning o
        JOIN Driftsbudget b ON o.driftsbudget_id = b.driftsbudget_id
        WHERE b.investeringscase_id = @id
    `);

    const udlejningReq = pool.request();
    udlejningReq.input('id', sql.Int, id);
    const udlejningRes = await udlejningReq.query(`SELECT * FROM Udlejning WHERE investeringscase_id = @id`);

    const renoveringReq = pool.request();
    renoveringReq.input('id', sql.Int, id);
    const renoveringRes = await renoveringReq.query(`SELECT * FROM Renovering WHERE investeringscase_id = @id`);

    // Opret kun finansiering-objektet hvis der faktisk er data fra databasen.
    // Hvis finansData er undefined (ingen finansiering tilknyttet casen),
    // sættes finansiering til null så simuleringsmodellen kan håndtere det uden at crashe.
    const finansiering = finansData ? new Finansiering(
        finansData.laanebeloeb,
        finansData.rente_procent / 100,
        finansData.loebetid_aar,
        finansData.afdragsfri_periode_aar
    ) : null; // håndter tilfælde uden finansiering

    const driftsbudget = new Driftsbudget();
    driftsRes.recordset.forEach(p => driftsbudget.tilfoejPost(p.beskrivelse, p.maanedlig_beloeb));

    const udlejningData = udlejningRes.recordset[0];
    const udlejning = udlejningData
        ? new Udlejning(udlejningData.maanedlig_leje, udlejningData.udlejningsomkostning)
        : null;

    const renoveringer = renoveringRes.recordset.map(r => {
        const tidspunktAar = new Date(r.tidspunkt).getFullYear() - new Date().getFullYear();
        return new Renovering(r.beskrivelse, r.beloeb, tidspunktAar);
    });

    const simulering = new Simulering(finansiering, driftsbudget, udlejning, renoveringer, 30);
    const resultater = simulering.beregnSimulering(sagen.ejendomspris);

    return { sagen, resultater };
}

// GET /sammenligning
// Viser siden med dropdowns — eller sammenligner to cases hvis id_a og id_b er valgt
router.get('/', async (req, res) => {
    await poolConnect;
    try {
        // Hent alle cases til dropdowns
        const alleRes = await pool.request().query(`
            SELECT i.investeringscase_id, i.navn, e.adresse
            FROM Investeringscase i
            JOIN Ejendomsprofil e ON i.ejendomsprofil_id = e.ejendomsprofil_id
            ORDER BY i.investeringscase_id DESC
        `);
        const alleCases = alleRes.recordset;

        const { id_a, id_b } = req.query;
        let caseA = null;
        let caseB = null;

        // Hvis begge er valgt — hent data og kør simulering
        if (id_a && id_b) {
            caseA = await hentCaseMedSimulering(parseInt(id_a));
            caseB = await hentCaseMedSimulering(parseInt(id_b));
        }

        res.render('sammenligning', { alleCases, caseA, caseB, id_a, id_b });

    } catch (err) {
        console.error('Fejl ved sammenligning:', err);
        res.status(500).send('Der skete en fejl. Prøv igen.');
    }
});

module.exports = router;