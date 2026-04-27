const BBR_BASE_URL = 'https://services.datafordeler.dk/BBR/BBRPublic/1/REST';

const datafordelerUsername = process.env.DATAFORDELER_USERNAME
const datafordelerPassword = process.env.DATAFORDELER_PASSWORD


//Kontrollerer at de eksiterer i .env ved serveropstart så vi hurtigt og effektivt opdager fejl
if (!datafordelerUsername || !datafordelerPassword) {
    throw new Error('DATAFORDELER credentials mangler i .env (DATAFORDELER_USERNAME og DATAFORDELER_PASSWORD)');
};

// --- Privat hjælpefunktion: laver selve HTTP-kaldet ---
async function hentBbrData(endpoint, queryParams) {
    const params = new URLSearchParams({
        ...queryParams,
        Format: 'JSON',
        username: datafordelerUsername,
        password: datafordelerPassword
    });

    const url = `${BBR_BASE_URL}/${endpoint}?${params.toString()}`;
    console.log(`DEBUG BBR ${endpoint}:`, url.replace(datafordelerPassword, '***'));

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`BBR /${endpoint} svarede med status ${response.status}`);
    }

    const data = await response.json();

    // Filtrér kun aktive registreringer (status 6 = gældende)
    return data.filter(objekt => objekt.status === '6');
}


// --- Offentlige funktioner ---

// Hent bygninger for et givent husnummerId
async function findBygninger(husnummerId) {
    return await hentBbrData('bygning', { Husnummer: husnummerId });
}
// Hent enheder for et givent husnummerId
async function findEnheder(bygningsId) {
    return await hentBbrData('enhed', { bygning: bygningsId });
}
// Hent grund for et givent grundId
// TODO: Grundareal returnerer tomt array for denne adressetype.
// BBR knytter muligvis grunden via jordstykke-relationer i stedet for husnummer-id.
// Alternativ: hent grundareal fra Dataforsyningens jordstykke-API via matrikelnummer.
async function findGrund(grundId) {
    return await hentBbrData('grund', { id: grundId });
}

module.exports = { findBygninger, findEnheder, findGrund };