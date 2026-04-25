/* Tidligere test af DAR
require('dotenv').config(); // Loader .env så process.env virker

const { adresseIdTilHusnummerId } = require('./services/darService');
const { findAdresseData } = require('./services/bbrService');

const adresseId = '8657b8af-f6a7-4a73-b12e-eb271364764e'; // Solbjerg Plads 4

async function test() {
    console.log('--- Trin 1: DAR-opslag ---');
    const darResultat = await adresseIdTilHusnummerId(adresseId);
    console.log(JSON.stringify(darResultat, null, 2));

    console.log('\n--- Trin 2: BBR-opslag ---');
    // Vi ved endnu ikke hvordan vi får husnummer-id'et ud af DAR-svaret
    // — det er det vi skal finde ud af når vi ser resultatet ovenfor
}

test().catch(err => console.error('FEJL:', err.message));
*/


require('dotenv').config(); // Loader .env så process.env virker

const { adresseIdTilHusnummerId } = require('./services/darService');
const { findAdresseData } = require('./services/bbrService');

const adresseId = '95697f98-a3d8-44c4-a16f-cddc8d29a3a1'; // Rentemestervej 8, 2400 København NV

async function test() {
    console.log('--- Trin 1: DAR-opslag ---');
    const husnummerId = await adresseIdTilHusnummerId(adresseId);
    console.log('Fik husnummer-id:', husnummerId);

    console.log('\n--- Trin 2: BBR-opslag ---');
    const bbrData = await findAdresseData(husnummerId);
    console.log(JSON.stringify(bbrData, null, 2));
}

test().catch(err => console.error('FEJL:', err.message));

