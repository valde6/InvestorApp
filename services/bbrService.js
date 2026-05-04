const BBR_BASE_URL = 'https://services.datafordeler.dk/BBR/BBRPublic/1/REST';

const datafordelerUsername = process.env.DATAFORDELER_USERNAME
const datafordelerPassword = process.env.DATAFORDELER_PASSWORD

//Kontrollerer at de eksiterer i .env ved serveropstart så vi hurtigt og effektivt opdager fejl
if (!datafordelerUsername || !datafordelerPassword) {
    throw new Error('DATAFORDELER credentials mangler i .env (DATAFORDELER_USERNAME og DATAFORDELER_PASSWORD)');
};

// --- Privat hjælpefunktion: laver selve HTTP-kaldet ---
async function hentBbrData(endpoint, ekstraParams) {
    const url = `${BBR_BASE_URL}/${endpoint}?username=${datafordelerUsername}&Format=JSON&password=${datafordelerPassword}&${ekstraParams}`;
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

// Oversætter BBR's anvendelseskode til læsbar ejendomstype
function oversætAnvendelse(kode) {
    const typer = {
        "110": "Stuehus til landbrugsejendom",
        "120": "Fritliggende enfamiliehus",
        "130": "Række-, kæde- eller dobbelthus",
        "140": "Etagebolig",
        "150": "Kollegium",
        "160": "Døgninstitution",
        "190": "Anden helårsbeboelse",
        "210": "Erhvervsmæssig produktion",
        "217": "Landbrug, dambrug eller lignende",
        "220": "Kontor, handel, lager",
        "230": "Hotel, restaurant",
        "290": "Anden erhvervsmæssig anvendelse",
    };
    return typer[kode] || `Ukendt type (${kode})`;
}

async function findBygninger(husnummerId) {
    const bygninger = await hentBbrData('bygning', `Husnummer=${encodeURIComponent(husnummerId)}`);
    bygninger.forEach(byg => {
        byg.ejendomstype = oversætAnvendelse(byg.byg021BygningensAnvendelse);
    });
    return bygninger;
}

async function findEnheder(bygningsId) {
    return await hentBbrData('enhed', `bygning=${encodeURIComponent(bygningsId)}`);
}

async function findGrund(grundId) {
    return await hentBbrData('grund', `id=${encodeURIComponent(grundId)}`);
}

// Fallback: henter bygning via BFE-nummer — bruges til lejligheder i etageejendomme
async function findBygningViaBfe(bfeNummer) {
    const bygninger = await hentBbrData('bygning', `BFEnummer=${encodeURIComponent(bfeNummer)}`);

    // Midlertidig debug — vis alle bygninger og deres anvendelseskoder
    console.log('DEBUG antal bygninger fra BFE:', bygninger.length);
    bygninger.forEach((byg, i) => {
        console.log(`DEBUG bygning ${i}: anvendelse=${byg.byg021BygningensAnvendelse}, status=${byg.status}`);
    });

    bygninger.forEach(byg => {
        byg.ejendomstype = oversætAnvendelse(byg.byg021BygningensAnvendelse);
    });
    return bygninger.find(byg => {
        const kode = parseInt(byg.byg021BygningensAnvendelse);
        return kode >= 110 && kode <= 299;
    }) || null;
}

module.exports = { findBygninger, findEnheder, findGrund, oversætAnvendelse, findBygningViaBfe };