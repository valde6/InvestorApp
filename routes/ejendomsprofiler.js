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

        const { lon, lat } = await hentKoordinater(profil.adresse_id);
        const kortUrl = byggeLuftfotoUrl(lon, lat);

        res.render('ejendom', {
            adresseId: profil.adresse_id,
            kortUrl,
            bygning: {
                byg026Opførelsesår: profil.byggeaar,
                byg038SamletBygningsareal: null,
                byg054AntalEtager: null,
                ejendomstype: profil.ejendomstype
            },
            enhed: {
                enh026EnhedensSamledeAreal: profil.boligareal_m2,
                enh031AntalVærelser: profil.antal_vaerelser
            },
            adresse: profil.adresse,
            ejendomsprofil_id: profil.ejendomsprofil_id
        });
    } catch (err) {
        console.error('Fejl ved hentning af ejendomsprofil:', err);
        res.status(500).send('Der skete en fejl');
    }
});

module.exports = router;

