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


//==========================================
//
// TRIN 3.2 Finansiering — Redigering
//
//==========================================

// GET /investeringscases/:id/rediger/finansiering
// Henter eksisterende finansieringsdata og viser formularen med udfyldte felter
router.get('/:id/rediger/finansiering', async (req, res) => {

    // Venter på at databaseforbindelsen er klar
    await poolConnect;

    // req.params.id henter case-id fra URL'en (:id)
    // fx /investeringscases/7/rediger/finansiering giver id = 7
    const investeringscase_id = req.params.id;

    try {
        // Hent finansieringsdata der er tilknyttet denne investeringscase
        const request = pool.request();
        request.input('id', sql.Int, investeringscase_id);
        const result = await request.query(`
            SELECT * FROM Finansiering WHERE investeringscase_id = @id
        `);

        // recordset[0] henter første række — der er kun én finansieringsrække per case
        // || null sikrer at finansiering er null hvis der ingen data er, frem for undefined
        const finansiering = result.recordset[0] || null;

        // Renderer finansierings-formularen med eksisterende data.
        // EJS-filen bruger finansiering-objektet til at udfylde felterne på forhånd
        res.render('investeringscase-finansiering', {
            finansiering,        // eksisterende finansieringsdata til at udfylde felterne
            investeringscase_id  // bruges til det skjulte felt i formularen
        });

    } catch (err) {
        console.error('Fejl ved hentning af finansiering til redigering:', err);
        res.status(500).send('Der skete en fejl. Prøv igen.');
    }
});

// POST /investeringscases/:id/rediger/finansiering
// Modtager formulardata og gemmer ændringerne med UPDATE i stedet for INSERT
router.post('/:id/rediger/finansiering', async (req, res) => {
    await poolConnect;

    // Hent case-id fra URL og formulardata fra req.body
    const investeringscase_id = req.params.id;
    const { laanebeloeb, rente_procent, loebetid_aar, afdragsfri_periode_aar, laanetype } = req.body;

    // Tjekker om der overhovedet er et lånebeløb angivet
    // Hvis ikke sættes alle lånefelter til 0 så databasen ikke får ugyldige værdier
    const erLaan = parseFloat(laanebeloeb) > 0;

    try {
        const request = pool.request();

        // @id bruges i WHERE-klausulen til at identificere hvilken række der opdateres
        request.input('id', sql.Int, investeringscase_id);
        request.input('laanebeloeb', sql.Decimal(15, 2), laanebeloeb || 0);

        // Ternary operator: hvis erLaan er sand bruges den indtastede værdi, ellers 0/null
        // Dette forhindrer at rente og løbetid gemmes hvis der ikke er et lån
        request.input('rente_procent', sql.Decimal(8, 4), erLaan ? rente_procent || 0 : 0);
        request.input('loebetid_aar', sql.Int, erLaan ? loebetid_aar || 0 : 0);
        request.input('afdragsfri_periode_aar', sql.Int, erLaan ? afdragsfri_periode_aar || 0 : 0);
        request.input('laanetype', sql.VarChar, erLaan ? laanetype || null : null);

        // UPDATE ændrer den eksisterende finansieringsrække frem for at oprette en ny
        // WHERE investeringscase_id = @id sikrer at kun den rigtige case opdateres
        await request.query(`
            UPDATE Finansiering SET
                laanebeloeb = @laanebeloeb,
                rente_procent = @rente_procent,
                loebetid_aar = @loebetid_aar,
                afdragsfri_periode_aar = @afdragsfri_periode_aar,
                laanetype = @laanetype
            WHERE investeringscase_id = @id
        `);

        // Send brugeren videre til næste trin i redigeringsflowet
        res.redirect('/investeringscases/' + investeringscase_id + '/rediger/renovering');

    } catch (err) {
        console.error('Fejl ved opdatering af finansiering:', err);
        res.status(500).send('Der skete en fejl. Prøv igen.');
    }
});


//==========================================
//
// TRIN 3.3 Renovering — Redigering
//
//==========================================

// GET /investeringscases/:id/rediger/renovering
// Henter eksisterende renoveringer og viser formularen med udfyldte felter
router.get('/:id/rediger/renovering', async (req, res) => {

    // Venter på at databaseforbindelsen er klar
    await poolConnect;

    // req.params.id henter case-id fra URL'en (:id)
    const investeringscase_id = req.params.id;

    try {
        // Hent alle renoveringer tilknyttet denne investeringscase
        // Der kan være flere renoveringer per case, så recordset kan indeholde flere rækker
        const request = pool.request();
        request.input('id', sql.Int, investeringscase_id);
        const result = await request.query(`
            SELECT * FROM Renovering WHERE investeringscase_id = @id
        `);

        // Renderer renoverings-formularen med eksisterende renoveringer.
        // EJS-filen looper over renoveringer-arrayet og viser hver renovering som en linje
        res.render('investeringscase-renovering', {
            renoveringer: result.recordset, // array af eksisterende renoveringer
            investeringscase_id
        });

    } catch (err) {
        console.error('Fejl ved hentning af renovering til redigering:', err);
        res.status(500).send('Der skete en fejl. Prøv igen.');
    }
});

// POST /investeringscases/:id/rediger/renovering
// Bruger slet-og-genindsæt frem for UPDATE.
// Det er nemmere end at spore hvilke individuelle renoveringslinjer der er ændret,
// tilføjet eller fjernet — særligt når antallet af linjer kan variere
router.post('/:id/rediger/renovering', async (req, res) => {
    await poolConnect;

    const investeringscase_id = req.params.id;
    const { beskrivelse, beloeb, tidspunkt } = req.body;

    try {
        // Slet alle eksisterende renoveringer for denne case
        // Dette er sikkert fordi vi straks indsætter de nye/opdaterede renoveringer
        const sletRequest = pool.request();
        sletRequest.input('id', sql.Int, investeringscase_id);
        await sletRequest.query(`
            DELETE FROM Renovering WHERE investeringscase_id = @id
        `);

        // Indsæt de nye/opdaterede renoveringer hvis brugeren har tilføjet nogle
        if (beskrivelse) {

            // Sørg for at det altid er et array — hvis kun én linje er udfyldt
            // sender HTML'en en streng frem for et array
            const beskrivelser = Array.isArray(beskrivelse) ? beskrivelse : [beskrivelse];
            const beloeber = Array.isArray(beloeb) ? beloeb : [beloeb];
            const tidspunkter = Array.isArray(tidspunkt) ? tidspunkt : [tidspunkt];

            // Loop igennem hver renovering og gem dem én ad gangen
            for (let i = 0; i < beskrivelser.length; i++) {
                const request = pool.request();
                request.input('investeringscase_id', sql.Int, investeringscase_id);
                request.input('beskrivelse', sql.VarChar, beskrivelser[i]);
                request.input('beloeb', sql.Decimal(15, 2), beloeber[i]);
                request.input('tidspunkt', sql.Date, tidspunkter[i]);

                await request.query(`
                    INSERT INTO Renovering (investeringscase_id, beskrivelse, beloeb, tidspunkt)
                    VALUES (@investeringscase_id, @beskrivelse, @beloeb, @tidspunkt)
                `);
            }
        }

        // Send brugeren videre til næste trin i redigeringsflowet
        res.redirect('/investeringscases/' + investeringscase_id + '/rediger/driftsbudget');

    } catch (err) {
        console.error('Fejl ved opdatering af renovering:', err);
        res.status(500).send('Der skete en fejl. Prøv igen.');
    }
});


//==========================================
//
// TRIN 3.4 Driftsbudget — Redigering
//
//==========================================

// GET /investeringscases/:id/rediger/driftsbudget
// Henter eksisterende driftsomkostninger og viser formularen med udfyldte felter
router.get('/:id/rediger/driftsbudget', async (req, res) => {

    // Venter på at databaseforbindelsen er klar
    await poolConnect;

    const investeringscase_id = req.params.id;

    try {
        // Driftsomkostninger ligger ikke direkte på investeringscase — de er knyttet
        // til et Driftsbudget som er knyttet til investeringscasen.
        // Vi bruger JOIN for at hente omkostningerne via driftsbudgettet
        const request = pool.request();
        request.input('id', sql.Int, investeringscase_id);
        const result = await request.query(`
            SELECT o.* FROM Driftsomkostning o
            JOIN Driftsbudget b ON o.driftsbudget_id = b.driftsbudget_id
            WHERE b.investeringscase_id = @id
        `);

        // Renderer driftsbudget-formularen med eksisterende omkostninger.
        // EJS-filen looper over driftsomkostninger-arrayet og viser hver post som en linje
        res.render('investeringscase-driftsbudget', {
            driftsomkostninger: result.recordset, // array af eksisterende driftsomkostninger
            investeringscase_id
        });

    } catch (err) {
        console.error('Fejl ved hentning af driftsbudget til redigering:', err);
        res.status(500).send('Der skete en fejl. Prøv igen.');
    }
});

// POST /investeringscases/:id/rediger/driftsbudget
// Bruger slet-og-genindsæt ligesom renovering.
// Sletter hele driftsbudgettet — ON DELETE CASCADE sørger automatisk for
// at alle tilknyttede driftsomkostninger også slettes
router.post('/:id/rediger/driftsbudget', async (req, res) => {
    await poolConnect;

    const investeringscase_id = req.params.id;
    const { beskrivelse, maanedlig_beloeb, kategori } = req.body;

    try {
        // Slet eksisterende driftsbudget for denne case.
        // ON DELETE CASCADE sletter automatisk alle tilknyttede driftsomkostninger
        // så vi behøver ikke slette dem manuelt
        const sletRequest = pool.request();
        sletRequest.input('id', sql.Int, investeringscase_id);
        await sletRequest.query(`
            DELETE FROM Driftsbudget WHERE investeringscase_id = @id
        `);

        // Opret et nyt driftsbudget som de nye omkostninger kan knyttes til.
        // OUTPUT INSERTED.driftsbudget_id returnerer det auto-genererede id
        // så vi kan bruge det til at indsætte driftsomkostningerne
        const budgetRequest = pool.request();
        budgetRequest.input('investeringscase_id', sql.Int, investeringscase_id);
        budgetRequest.input('navn', sql.VarChar, 'Driftsbudget');
        const budgetResult = await budgetRequest.query(`
            INSERT INTO Driftsbudget (investeringscase_id, navn)
            OUTPUT INSERTED.driftsbudget_id
            VALUES (@investeringscase_id, @navn)
        `);

        // Gem det nye driftsbudget_id til brug i løkken nedenfor
        const driftsbudget_id = budgetResult.recordset[0].driftsbudget_id;

        // Indsæt de nye/opdaterede driftsomkostninger hvis brugeren har tilføjet nogle
        if (beskrivelse) {

            // Sørg for at det altid er et array — hvis kun én linje er udfyldt
            // sender HTML'en en streng frem for et array
            const beskrivelser = Array.isArray(beskrivelse) ? beskrivelse : [beskrivelse];
            const beloeber = Array.isArray(maanedlig_beloeb) ? maanedlig_beloeb : [maanedlig_beloeb];
            const kategorier = Array.isArray(kategori) ? kategori : [kategori];

            // Loop igennem hver driftsomkostning og gem dem én ad gangen
            for (let i = 0; i < beskrivelser.length; i++) {
                const request = pool.request();
                request.input('driftsbudget_id', sql.Int, driftsbudget_id);
                request.input('beskrivelse', sql.VarChar, beskrivelser[i]);
                request.input('maanedlig_beloeb', sql.Decimal(15, 2), beloeber[i]);

                // || null sikrer at en tom kategori gemmes som null frem for en tom streng
                request.input('kategori', sql.VarChar, kategorier[i] || null);

                await request.query(`
                    INSERT INTO Driftsomkostning (driftsbudget_id, beskrivelse, maanedlig_beloeb, kategori)
                    VALUES (@driftsbudget_id, @beskrivelse, @maanedlig_beloeb, @kategori)
                `);
            }
        }

        // Send brugeren videre til næste trin i redigeringsflowet
        res.redirect('/investeringscases/' + investeringscase_id + '/rediger/udlejning');

    } catch (err) {
        console.error('Fejl ved opdatering af driftsbudget:', err);
        res.status(500).send('Der skete en fejl. Prøv igen.');
    }
});


//==========================================
//
// TRIN 3.5 Udlejning — Redigering
//
//==========================================

// GET /investeringscases/:id/rediger/udlejning
// Henter eksisterende udlejningsdata og viser formularen med udfyldte felter
router.get('/:id/rediger/udlejning', async (req, res) => {

    // Venter på at databaseforbindelsen er klar
    await poolConnect;

    const investeringscase_id = req.params.id;

    try {
        // Hent alle udlejninger tilknyttet denne investeringscase
        // Der kan være flere udlejninger per case, så recordset kan indeholde flere rækker
        const request = pool.request();
        request.input('id', sql.Int, investeringscase_id);
        const result = await request.query(`
            SELECT * FROM Udlejning WHERE investeringscase_id = @id
        `);

        // Renderer udlejnings-formularen med eksisterende data.
        // EJS-filen bruger udlejninger-arrayet til at udfylde felterne på forhånd
        // og til at afgøre om checkboxen skal være markeret
        res.render('investeringscase-udlejning', {
            udlejninger: result.recordset, // array af eksisterende udlejninger
            investeringscase_id
        });

    } catch (err) {
        console.error('Fejl ved hentning af udlejning til redigering:', err);
        res.status(500).send('Der skete en fejl. Prøv igen.');
    }
});



// POST /investeringscases/:id/rediger/udlejning
// Bruger slet-og-genindsæt ligesom renovering og driftsbudget.
// Sletter alle eksisterende udlejninger og indsætter de nye
router.post('/:id/rediger/udlejning', async (req, res) => {
    await poolConnect;

    const investeringscase_id = req.params.id;
    const { udlejes, maanedlig_leje, udlejningsomkostning, beskrivelse } = req.body;

    try {
        // Slet alle eksisterende udlejninger for denne case
        // Dette er sikkert fordi vi straks indsætter de nye/opdaterede udlejninger
        const sletRequest = pool.request();
        sletRequest.input('id', sql.Int, investeringscase_id);
        await sletRequest.query(`
            DELETE FROM Udlejning WHERE investeringscase_id = @id
        `);

        // Indsæt kun nye udlejninger hvis brugeren har markeret at ejendommen udlejes
        // og der er angivet en månedlig leje
        if (udlejes && maanedlig_leje) {

            // Sørg for at det altid er et array — hvis kun én linje er udfyldt
            // sender HTML'en en streng frem for et array
            const lejer = Array.isArray(maanedlig_leje) ? maanedlig_leje : [maanedlig_leje];
            const omkostninger = Array.isArray(udlejningsomkostning) ? udlejningsomkostning : [udlejningsomkostning];
            const beskrivelser = Array.isArray(beskrivelse) ? beskrivelse : [beskrivelse];

            // Loop igennem hver udlejning og gem dem én ad gangen
            for (let i = 0; i < lejer.length; i++) {
                const request = pool.request();
                request.input('investeringscase_id', sql.Int, investeringscase_id);
                request.input('maanedlig_leje', sql.Decimal(15, 2), lejer[i]);

                // || 0 sikrer at tomme udgiftsfelter gemmes som 0 frem for null
                request.input('udlejningsomkostning', sql.Decimal(15, 2), omkostninger[i] || 0);

                // || null sikrer at en tom beskrivelse gemmes som null frem for en tom streng
                request.input('beskrivelse', sql.VarChar, beskrivelser[i] || null);

                await request.query(`
                    INSERT INTO Udlejning (investeringscase_id, maanedlig_leje, udlejningsomkostning, beskrivelse)
                    VALUES (@investeringscase_id, @maanedlig_leje, @udlejningsomkostning, @beskrivelse)
                `);
            }
        }

        // Redigeringsflowet er færdigt — send brugeren tilbage til oversigten
        // så de kan se den opdaterede simulering med de nye værdier
        res.redirect('/investeringscase-oversigt?id=' + investeringscase_id);

    } catch (err) {
        console.error('Fejl ved opdatering af udlejning:', err);
        res.status(500).send('Der skete en fejl. Prøv igen.');
    }
});


//==========================================
//
// Sletknap i oversigten
//
//==========================================

// POST /investeringscases/:id/slet
// Sletter investeringscasen og alt tilknyttet data.
// HTML-formularer understøtter kun GET og POST — derfor bruges POST til sletning
// frem for DELETE som ellers ville være den semantisk korrekte HTTP-metode
router.post('/:id/slet', async (req, res) => {
    await poolConnect;

    // req.params.id henter case-id fra URL'en (:id)
    // fx /investeringscases/7/slet sletter case med id 7
    const investeringscase_id = req.params.id;

    try {
        // Hent ejendomsprofil_id inden sletning så vi kan sende brugeren
        // tilbage til den rigtige ejendomsprofil bagefter.
        // Vi kan ikke hente det efter sletning da rækken ikke længere eksisterer
        const profilRequest = pool.request();
        profilRequest.input('id', sql.Int, investeringscase_id);
        const profilResult = await profilRequest.query(`
            SELECT ejendomsprofil_id FROM Investeringscase WHERE investeringscase_id = @id
        `);
        const ejendomsprofil_id = profilResult.recordset[0].ejendomsprofil_id;

        // Slet investeringscasen — én enkelt DELETE er nok da ON DELETE CASCADE
        // i databasen automatisk sletter alle tilknyttede rækker i:
        // Finansiering, Koebsomkostning, Renovering, Driftsbudget, Driftsomkostning og Udlejning
        const request = pool.request();
        request.input('id', sql.Int, investeringscase_id);
        await request.query(`
            DELETE FROM Investeringscase WHERE investeringscase_id = @id
        `);

        // Send brugeren tilbage til ejendomsprofilen så de kan se
        // at casen er fjernet fra listen over investeringscases
        res.redirect('/ejendomsprofiler/' + ejendomsprofil_id);

    } catch (err) {
        console.error('Fejl ved sletning af investeringscase:', err);
        res.status(500).send('Der skete en fejl. Prøv igen.');
    }
});

module.exports = router;