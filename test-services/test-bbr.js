// ============================================
// test-services/test-bbr.js
// Simpelt forbindelsestest til Azure SQL databasen.
// Kører med: node test-bbr.js
// Tjekker at vi kan hente en bygning og dens enheder fra BBR via vores service-funktioner.
// ============================================

require('dotenv').config();

// Importér de nye funktioner fra darService og bbrService
// husnummerTilBygningBfe og findBygningViaBfe er tilføjet som del af lejligheds-fallbacken
const { adresseIdTilHusnummerId, husnummerTilBygningBfe } = require('../services/darService');
const { findBygninger, findEnheder, findGrund, findBygningViaBfe } = require('../services/bbrService');

// Testadresse - en kendt lejlighed i en etageejendom
const adresseId = 'ed03664b-6ec0-412c-a7ef-bc4ec414e440'; // Alberts forældres adresse

async function test() {

    // --- Trin 1: DAR-opslag ---
    // Oversætter DAWA's adresse-ID til et DAR husnummer-ID som BBR kan bruge
    console.log('--- Trin 1: DAR-opslag ---');
    const husnummerId = await adresseIdTilHusnummerId(adresseId);
    if (!husnummerId) throw new Error('Kunne ikke finde husnummerId i DAR-svar');
    console.log('Fik husnummer-id:', husnummerId);

    // --- Trin 2: BBR direkte bygningsopslag ---
    // Virker for enfamiliehuse, men returnerer 0 for lejligheder i etageejendomme
    console.log('\n--- Trin 2: BBR Bygninger (direkte) ---');
    const bygninger = await findBygninger(husnummerId);
    console.log(`Fandt ${bygninger.length} bygning(er)`);

    // bygning er den variabel vi bruger resten af testen - sættes enten herunder eller via fallback
    let bygning;

    if (bygninger.length) {
        // Direkte opslag virkede - find den primære boligbygning og filtrer garager/carporten fra
        bygning = bygninger.find(byg => {
            const kode = parseInt(byg.byg021BygningensAnvendelse);
            return kode >= 110 && kode <= 299;
        });
    } else {
        // Direkte opslag returnerede 0 - typisk en lejlighed i etageejendom
        // Fallback: hent BFE-nummer via DAR og brug det til at finde bygningen i BBR
        console.log('Ingen direkte bygning - prøver BFE-fallback...');

        // --- Trin 2b: DAR BFE-opslag ---
        // DAR ved hvilken bygning et husnummer tilhører - returnerer bygningens BFE-nummer
        console.log('\n--- Trin 2b: DAR BFE-opslag ---');
        const bfeNummer = await husnummerTilBygningBfe(husnummerId);
        console.log('Fik BFE-nummer:', bfeNummer);

        // --- Trin 2c: BBR bygning via BFE-nummer ---
        // Nu hvor vi har BFE-nummeret kan vi slå den rigtige bygning op i BBR
        console.log('\n--- Trin 2c: BBR Bygning via BFE ---');
        bygning = await findBygningViaBfe(bfeNummer);
        console.log('Bygning fundet:', JSON.stringify(bygning, null, 2));
    }

    // Hvis vi stadig ikke har en bygning, er der ikke mere vi kan gøre
    if (!bygning) throw new Error('Ingen boligbygning fundet - hverken direkte eller via BFE');

    // --- Trin 3: BBR Enheder ---
    // Henter enhedsdata (boligoplysninger) for den fundne bygning via bygningens id_lokalId
    console.log('\n--- Trin 3: BBR Enheder ---');
    const enheder = await findEnheder(bygning.id_lokalId);
    console.log(`Fandt ${enheder.length} enhed(er)`);
    console.log(JSON.stringify(enheder, null, 2));

    // --- Trin 4: BBR Grund ---
    // Grunddata hentes via grund-referencen på bygningen
    // Feltnavnet i BBR-svaret er endnu ikke verificeret - kig i trin 2/2c output hvis det fejler
    console.log('\n--- Trin 4: BBR Grund ---');
    const grundIdFraBygning = bygning?.grund;
    if (grundIdFraBygning) {
        const grund = await findGrund(grundIdFraBygning);
        console.log(JSON.stringify(grund, null, 2));
    } else {
        console.log('Kunne ikke finde grund-reference i bygning-svar - kig i trin 2c output');
    }
}

test().catch(err => console.error('FEJL:', err.message));