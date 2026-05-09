// ============================================
// routes/investeringscaser.js
// HTTP-endpoints til investeringscaser
// ============================================

//importerer DB fra services/db
const { pool, poolConnect, sql } = require('../services/db');

const express = require('express');
const router = express.Router();

//==========================================
//
// TRIN 3.1 Køb
//
//==========================================

// GET /investeringscaser/ny/køb
// Viser formularen for trin 3.1: Køb og renoveringsudgifter
router.get('/ny/koeb', function (req, res) {
    const ejendomsprofil_id = req.query.ejendomsprofil_id;
    res.render('investeringscase-koeb', {
        ejendomsprofil_id,
        sagen: null,          // null fortæller EJS at vi er i oprettelsestilstand
        koebsomkostninger: [] // tomt array så EJS ikke fejler
    });
});

// POST /investeringscaser/ny/koeb
// Gemmer trin 3.1 data i databasen
router.post('/ny/koeb', async (req, res) => {

    // Vent på at databaseforbindelsen er klar
    await poolConnect;
    console.log('req.body:', req.body);

    // Tilføj ejendomsprofil_id til destructuring fra req.body
    const { navn, ejendomsprofil_id, ejendomspris, omkostninger_koeb, advokat, tinglysning, koeberraadgivning, ekstra_beskrivelse, ekstra_beloeb } = req.body;

    try { // bruger try/catch, da ting i databaser kan gå galt
        // Byg forespørgslen op trin for trin
        const request = pool.request(); // samler alle disse som .input for at undgå SQL injection. .input sendes IKKE til databasen endnu, først når den pakkes i .query længere nede
        request.input('navn', sql.VarChar, navn); // navn kommer her fra req.body (defineret foroven)
        // Læs ejendomsprofil_id fra formularen i stedet for hardcodet 1
        request.input('ejendomsprofil_id', sql.Int, ejendomsprofil_id);
        request.input('ejendomspris', sql.Decimal(15, 2), ejendomspris); //ejendomspris kommer fra req.body osv osv
        request.input('omkostninger_koeb', sql.Decimal(15, 2), omkostninger_koeb || 0); // 'omkostninger_koeb' matcher til @omkostninger_koeb forneden (VALUES)
        request.input('advokat', sql.Decimal(15, 2), advokat || 0);
        request.input('tinglysning', sql.Decimal(15, 2), tinglysning || 0);
        request.input('koeberraadgivning', sql.Decimal(15, 2), koeberraadgivning || 0);

        // Kør queryen og gem resultatet
        // .query bruges her for at modvirke SQL injection. Der kan nemlig ikke sendes noget direkte som query. Den "endelige" query sendes efter den
        // "pakkes" samlet vha. input foroven der laver en const request = ... for det hele.
        const result = await request.query(`
            INSERT INTO Investeringscase 
                (navn, ejendomsprofil_id, ejendomspris, omkostninger_koeb, advokat, tinglysning, koeberraadgivning)
            OUTPUT INSERTED.investeringscase_id
            VALUES 
                (@navn, @ejendomsprofil_id, @ejendomspris, @omkostninger_koeb, @advokat, @tinglysning, @koeberraadgivning)
        `);
        // vha. OUTPUT INSERTED.inveseringscase_id får vi databasen (som ellers selv finder på et nyt id vha. IDENTITY(1,1)) til at sende id'et tilbage.

        // Hent det auto-genererede id på den nye række
        const investeringscase_id = result.recordset[0].investeringscase_id; // result blev defineret i linje 42. I queryen beder vi databasen sende investeringscase_id tilbage
        // vha. OUTPUT INSERTED.investeringscase_id. Ved .query sender databasen et svar tiblage i JS-format, som indeholder recordset: [investeringscase_id = x] og andre ting.
        // Recordset er altså et array af rækker (investeringscase_id, navn, ejendomspris osv (så basically en "record")) og i queryen beder vi kun om ét objekt - investeringscase_id,
        // så objektet der sendes tilbage indeholder kun 1 element, som findes på 0. plads i arrayet.
        // I vores tilfælde bad vi kun om investeringscase_id via OUTPUT INSERTED, så hver række har kun en kolonne.

        // Gem ekstra udgifter, kun hvis brugeren har tilføjet nogle
        if (ekstra_beskrivelse) {

            // Sørg for at det altid er et array
            const beskrivelser = Array.isArray(ekstra_beskrivelse) ? ekstra_beskrivelse : [ekstra_beskrivelse];
            const beloeb = Array.isArray(ekstra_beloeb) ? ekstra_beloeb : [ekstra_beloeb];

            // Loop igennem hver ekstra udgift og gem dem en ad gangen
            for (let i = 0; i < beskrivelser.length; i++) {
                const ekstraRequest = pool.request(); // pool er vores forbindelse til databasen fra db.js importeret hertil øverst
                ekstraRequest.input('investeringscase_id', sql.Int, investeringscase_id);
                ekstraRequest.input('beskrivelse', sql.VarChar, beskrivelser[i]);
                ekstraRequest.input('beloeb', sql.Decimal(15, 2), beloeb[i]);

                await ekstraRequest.query(`
                    INSERT INTO Koebsomkostning (investeringscase_id, beskrivelse, beloeb)
                    VALUES (@investeringscase_id, @beskrivelse, @beloeb)
                `);
            }
        }

        // Send brugeren videre til trin 3.2
        res.redirect('/investeringscases/ny/finansiering?id=' + investeringscase_id); // svaret på req er at redirecte brugeren med dette specifikke id

        //FEjlhåndtering
    } catch (err) {
        console.error('Fejl ved oprettelse af investeringscase:', err);
        res.status(500).send('Der skete en fejl. Prøv igen.');
    }
});

//==========================================
//
// TRIN 3.2 Finanseing
//
//==========================================

// GET /investeringscases/ny/finansiering

router.get('/ny/finansiering', (req, res) => {
    const investeringscase_id = req.query.id;// NATURLOV: req.query er et objekt der indeholder alt der står efter ? i en URL. OG req.body er altid formulardata.
    res.render('investeringscase-finansiering', { //res.render finder investeringscase-finansiering.ejs filen og sætter id'et ind.
        investeringscase_id,
        finansiering: null  // null fortæller EJS at vi er i oprettelsestilstand
        // // Det kan den fordi der i server.js står app.set('view engine', 'ejs'); som fortæller express at ejs er template 
        // engine (engine til at mixe html og data).
    });
});

// POST /investeringscases/ny/finansiering
router.post('/ny/finansiering', async (req, res) => {
    await poolConnect;

    const { investeringscase_id, laanebeloeb, rente_procent, loebetid_aar, afdragsfri_periode_aar, laanetype } = req.body;

    const erLaan = parseFloat(laanebeloeb) > 0; // tjekker om laanebeloebet overhovedet er over 0

    try {
        const request = pool.request();
        request.input('investeringscase_id', sql.Int, investeringscase_id);
        request.input('laanebeloeb', sql.Decimal(15, 2), laanebeloeb || 0);
        request.input('rente_procent', sql.Decimal(8, 4), erLaan ? rente_procent || 0 : 0); //tjekker om erLaan er sand.
        request.input('loebetid_aar', sql.Int, erLaan ? loebetid_aar || 0 : 0); //samme her
        request.input('afdragsfri_periode_aar', sql.Int, erLaan ? afdragsfri_periode_aar || 0 : 0); //samme her
        request.input('laanetype', sql.VarChar, erLaan ? laanetype || null : null); //samme her



        await request.query(`
            INSERT INTO Finansiering 
                (investeringscase_id, laanebeloeb, rente_procent, loebetid_aar, afdragsfri_periode_aar, laanetype)
            VALUES 
                (@investeringscase_id, @laanebeloeb, @rente_procent, @loebetid_aar, @afdragsfri_periode_aar, @laanetype)
        `);

        res.redirect('/investeringscases/ny/renovering?id=' + investeringscase_id);

    } catch (err) {
        console.error('Fejl ved oprettelse af finansiering:', err);
        res.status(500).send('Der skete en fejl. Prøv igen.');
    }
});

//==========================================
//
// TRIN 3.3 Renovering
//
//==========================================

// GET /investeringscases/ny/renovering
router.get('/ny/renovering', (req, res) => {
    const investeringscase_id = req.query.id;
    res.render('investeringscase-renovering', {
        investeringscase_id,
        renoveringer: []
    });
});

// POST /investeringscases/ny/renovering
router.post('/ny/renovering', async (req, res) => {
    await poolConnect;

    const { investeringscase_id, beskrivelse, beloeb, tidspunkt } = req.body;

    try {
        if (beskrivelse) {
            const beskrivelser = Array.isArray(beskrivelse) ? beskrivelse : [beskrivelse];
            const beloeber = Array.isArray(beloeb) ? beloeb : [beloeb];
            const tidspunkter = Array.isArray(tidspunkt) ? tidspunkt : [tidspunkt];

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

        res.redirect('/investeringscases/ny/driftsbudget?id=' + investeringscase_id);

    } catch (err) {
        console.error('Fejl ved oprettelse af renovering:', err);
        res.status(500).send('Der skete en fejl. Prøv igen.');
    }
});

//==========================================
//
// TRIN 3.4 Driftsbudget
//
//==========================================

// GET /investeringscases/ny/driftsbudget
router.get('/ny/driftsbudget', (req, res) => {
    const investeringscase_id = req.query.id;
    res.render('investeringscase-driftsbudget', {
        investeringscase_id,
        driftsomkostninger: []
    });
});

// POST /investeringscases/ny/driftsbudget
router.post('/ny/driftsbudget', async (req, res) => {
    await poolConnect;

    const { investeringscase_id, beskrivelse, maanedlig_beloeb, kategori } = req.body;

    try {
        // Opret selve driftsbudgettet
        const budgetRequest = pool.request();
        budgetRequest.input('investeringscase_id', sql.Int, investeringscase_id);
        budgetRequest.input('navn', sql.VarChar, 'Driftsbudget');

        const budgetResult = await budgetRequest.query(`
            INSERT INTO Driftsbudget (investeringscase_id, navn)
            OUTPUT INSERTED.driftsbudget_id
            VALUES (@investeringscase_id, @navn)
        `);

        const driftsbudget_id = budgetResult.recordset[0].driftsbudget_id;

        // Gem driftsomkostninger
        if (beskrivelse) {
            const beskrivelser = Array.isArray(beskrivelse) ? beskrivelse : [beskrivelse];
            const beloeber = Array.isArray(maanedlig_beloeb) ? maanedlig_beloeb : [maanedlig_beloeb];
            const kategorier = Array.isArray(kategori) ? kategori : [kategori];

            for (let i = 0; i < beskrivelser.length; i++) {
                const request = pool.request();
                request.input('driftsbudget_id', sql.Int, driftsbudget_id);
                request.input('beskrivelse', sql.VarChar, beskrivelser[i]);
                request.input('maanedlig_beloeb', sql.Decimal(15, 2), beloeber[i]);
                request.input('kategori', sql.VarChar, kategorier[i] || null);

                await request.query(`
                    INSERT INTO Driftsomkostning (driftsbudget_id, beskrivelse, maanedlig_beloeb, kategori)
                    VALUES (@driftsbudget_id, @beskrivelse, @maanedlig_beloeb, @kategori)
                `);
            }
        }

        res.redirect('/investeringscases/ny/udlejning?id=' + investeringscase_id);

    } catch (err) {
        console.error('Fejl ved oprettelse af driftsbudget:', err);
        res.status(500).send('Der skete en fejl. Prøv igen.');
    }
});

//==========================================
//
// TRIN 3.5 Udlejning
//
//==========================================

// GET /investeringscases/ny/udlejning
router.get('/ny/udlejning', (req, res) => {
    const investeringscase_id = req.query.id;
    res.render('investeringscase-udlejning', {
        investeringscase_id,
        udlejninger: []
    });
});

// POST /investeringscases/ny/udlejning
router.post('/ny/udlejning', async (req, res) => {
    await poolConnect;

    const { investeringscase_id, udlejes, maanedlig_leje, udlejningsomkostning, beskrivelse } = req.body;

    try {
        // Gem kun hvis brugeren har valgt at udleje
        if (udlejes && maanedlig_leje) {
            const lejer = Array.isArray(maanedlig_leje) ? maanedlig_leje : [maanedlig_leje];
            const omkostninger = Array.isArray(udlejningsomkostning) ? udlejningsomkostning : [udlejningsomkostning];
            const beskrivelser = Array.isArray(beskrivelse) ? beskrivelse : [beskrivelse];

            for (let i = 0; i < lejer.length; i++) {
                const request = pool.request();
                request.input('investeringscase_id', sql.Int, investeringscase_id);
                request.input('maanedlig_leje', sql.Decimal(15, 2), lejer[i]);
                request.input('udlejningsomkostning', sql.Decimal(15, 2), omkostninger[i] || 0);
                request.input('beskrivelse', sql.VarChar, beskrivelser[i] || null);

                await request.query(`
                    INSERT INTO Udlejning (investeringscase_id, maanedlig_leje, udlejningsomkostning, beskrivelse)
                    VALUES (@investeringscase_id, @maanedlig_leje, @udlejningsomkostning, @beskrivelse)
                `);
            }
        }

        // Trin 3.5 er sidste trin hvor det sendes til oversigt
        res.redirect('/investeringscase-oversigt?id=' + investeringscase_id);

    } catch (err) {
        console.error('Fejl ved oprettelse af udlejning:', err);
        res.status(500).send('Der skete en fejl. Prøv igen.');
    }
});


module.exports = router;