// ============================================
// routes/rediger.js
// HTTP-endpoints til redigering af investeringscaser
// Parallel til investeringscases.js, men bruger UPDATE
// frem for INSERT da data allerede eksisterer i databasen
// ============================================

const express = require('express');
const router = express.Router();

// Importerer databaseforbindelsen fra services/db.js
// pool: selve forbindelsen, poolConnect: løfte der venter til forbindelsen er klar, sql: datatyper
const { pool, poolConnect, sql } = require('../services/db');

//==========================================
//
// TRIN 3.1 Køb — Redigering
//
//==========================================

// GET /investeringscases/:id/rediger/koeb
// Henter eksisterende data og viser formularen med udfyldte felter.
// :id er en URL-parameter — fx /investeringscases/7/rediger/koeb henter case med id 7
router.get('/:id/rediger/koeb', async (req, res) => {

    // Venter på at databaseforbindelsen er klar inden vi laver opslag
    await poolConnect;

    // req.params.id henter den dynamiske del af URL'en (:id)
    // Modsat req.query der henter ?id=x efter spørgsmålstegnet
    const investeringscase_id = req.params.id;

    try {
        // Hent den eksisterende investeringscase fra databasen
        // så vi kan sende dens data med til formularen
        const request = pool.request();
        request.input('id', sql.Int, investeringscase_id);
        const result = await request.query(`
            SELECT * FROM Investeringscase WHERE investeringscase_id = @id
        `);

        // recordset[0] henter første (og eneste) række fra resultatet
        // da investeringscase_id er unik, er der aldrig mere end én række
        const sagen = result.recordset[0];

        // Hent eventuelle ekstra købsomkostninger tilknyttet denne case
        const ekstraRequest = pool.request();
        ekstraRequest.input('id', sql.Int, investeringscase_id);
        const ekstraResult = await ekstraRequest.query(`
            SELECT * FROM Koebsomkostning WHERE investeringscase_id = @id
        `);

        // Renderer samme EJS-formular som ved oprettelse (investeringscase-koeb.ejs)
        // men sender eksisterende data med så felterne er udfyldt på forhånd
        res.render('investeringscase-koeb', {
            sagen,
            koebsomkostninger: ekstraResult.recordset,
            ejendomsprofil_id: sagen.ejendomsprofil_id
        });

    } catch (err) {
        console.error('Fejl ved hentning af køb til redigering:', err);
        res.status(500).send('Der skete en fejl. Prøv igen.');
    }
});

// POST /investeringscases/:id/rediger/koeb
// Modtager formulardata og gemmer ændringerne i databasen.
// Bruger UPDATE frem for INSERT da rækken allerede eksisterer
router.post('/:id/rediger/koeb', async (req, res) => {
    await poolConnect;

    // Hent case-id fra URL og formulardata fra req.body
    const investeringscase_id = req.params.id;
    const { navn, ejendomspris, omkostninger_koeb, advokat, tinglysning, koeberraadgivning } = req.body;

    try {
        const request = pool.request();

        // @id bruges i WHERE-klausulen til at identificere hvilken række der skal opdateres
        request.input('id', sql.Int, investeringscase_id);
        request.input('navn', sql.VarChar, navn);
        request.input('ejendomspris', sql.Decimal(15, 2), ejendomspris);

        // || 0 sikrer at tomme felter gemmes som 0 frem for null
        request.input('omkostninger_koeb', sql.Decimal(15, 2), omkostninger_koeb || 0);
        request.input('advokat', sql.Decimal(15, 2), advokat || 0);
        request.input('tinglysning', sql.Decimal(15, 2), tinglysning || 0);
        request.input('koeberraadgivning', sql.Decimal(15, 2), koeberraadgivning || 0);

        // UPDATE ændrer værdierne i den eksisterende række
        // WHERE investeringscase_id = @id sikrer at kun den rigtige case opdateres
        await request.query(`
            UPDATE Investeringscase SET
                navn = @navn,
                ejendomspris = @ejendomspris,
                omkostninger_koeb = @omkostninger_koeb,
                advokat = @advokat,
                tinglysning = @tinglysning,
                koeberraadgivning = @koeberraadgivning
            WHERE investeringscase_id = @id
        `);

        // Send brugeren videre til næste trin i redigeringsflowet
        res.redirect('/investeringscases/' + investeringscase_id + '/rediger/finansiering');

    } catch (err) {
        console.error('Fejl ved opdatering af køb:', err);
        res.status(500).send('Der skete en fejl. Prøv igen.');
    }
});

module.exports = router;