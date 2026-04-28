require('dotenv').config();

const { adresseIdTilHusnummerId } = require('./services/darService');
const { findBygninger, findEnheder, findGrund } = require('./services/bbrService');

const adresseId = '0a3f50a3-f963-32b8-e044-0003ba298018'; // Alberts forældres adresse


// Fordi de forskellige data vi akal bruge om boligen ikke ligger i samme BBR-endpoint, så har jeg lavet 3 forskellige funktioner i bbrService:
// - findBygninger(husnummerId) → finder bygninger knyttet til det husnummer-id
// - findEnheder(husnummerId) → finder enheder (boliger) knyttet til det husnummer-id
// - findGrund(grundId) → finder grunddata baseret på et grund-id (som vi håber at finde i bygning-dataen)
//
// I test-funktionen nedenfor kører vi alle 3 trin i rækkefølge, og printer resultaterne så vi kan se hvordan dataen ser ud.
async function test() {
    console.log('--- Trin 1: DAR-opslag ---');
    const husnummerId = await adresseIdTilHusnummerId(adresseId);

    if (!husnummerId) {
        throw new Error('Kunne ikke finde husnummerId i DAR-svar');
    }

    console.log('Fik husnummer-id:', husnummerId);

    console.log('\n--- Trin 2: BBR Bygninger ---');
    const bygninger = await findBygninger(husnummerId);
    console.log(`Fandt ${bygninger.length} bygning(er)`);
    console.log(JSON.stringify(bygninger, null, 2));

    console.log('\n--- Trin 3: BBR Enheder ---');

    // const bygning = bygninger.find(byg => byg.byg021BygningensAnvendelse === "120") <--
    const bygning = bygninger[0];
    bygning.ejendomstype = oversætAnvendelse(bygning.byg021BygningensAnvendelse);
    const bygningsId = bygning.id_lokalId;

    const enheder = await findEnheder(bygningsId);
    console.log(`Fandt ${enheder.length} enhed(er)`);
    console.log(JSON.stringify(enheder, null, 2));

    console.log('\n--- Trin 4: BBR Grund ---');
    // Vi ved endnu ikke præcis hvilket felt i bygning der peger på grund.
    // Efter trin 2 har kørt, kig i bygning-outputtet efter et felt som
    // "grund", "jordstykke", eller noget der ligner et grund-id.
    const grundIdFraBygning = bygninger[0]?.grund; // <-- RET dette feltnavn når I har set output
    if (grundIdFraBygning) {
        const grund = await findGrund(grundIdFraBygning);
        console.log(JSON.stringify(grund, null, 2));
    } else {
        console.log('Kunne ikke finde grund-reference i bygning-svar — kig i trin 2 output');
    }
}

test().catch(err => console.error('FEJL:', err.message));
