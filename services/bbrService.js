// ============================================
// services/bbrService.js
// Henter bygnings- og enhedsdata fra BBR via Datafordeler.
// Dokumentation: https://datafordeler.dk/dataoversigt/bygnings-og-boligregistret-bbr/bbr/
// ============================================

const BBR_BASE_URL = 'https://services.datafordeler.dk/BBR/BBRPublic/1/REST';

const datafordelerUsername = process.env.DATAFORDELER_USERNAME;
const datafordelerPassword = process.env.DATAFORDELER_PASSWORD;

// Kontrollér at credentials eksisterer ved serveropstart — fejler hurtigt og tydeligt
if (!datafordelerUsername || !datafordelerPassword) {
    throw new Error('DATAFORDELER credentials mangler i .env (DATAFORDELER_USERNAME og DATAFORDELER_PASSWORD)');
}

// ============================================
// Privat hjælpefunktion — laver selve HTTP-kaldet til BBR
// Filtrerer automatisk på status = '6' (kun gældende registreringer)
// ============================================
async function hentBbrData(endpoint, ekstraParams) {
    const url = `${BBR_BASE_URL}/${endpoint}?username=${datafordelerUsername}&Format=JSON&password=${datafordelerPassword}&${ekstraParams}`;

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`BBR /${endpoint} svarede med status ${response.status}`);
    }

    const data = await response.json();

    // Kun aktive registreringer returneres (status 6 = gældende i BBR)
    return data.filter(objekt => objekt.status === '6');
}

// ============================================
// Oversætter BBR's numeriske anvendelseskode til læsbart dansk navn.
// Bruges inden data gemmes i databasen så vi ikke gemmer rå koder.
// ============================================
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

// ============================================
// Henter bygninger tilknyttet et husnummer-ID.
// Primært opslag — virker for enfamiliehuse og de fleste ejendomme.
// ============================================
async function findBygninger(husnummerId) {
    const bygninger = await hentBbrData('bygning', `Husnummer=${encodeURIComponent(husnummerId)}`);
    // Tilføj læsbart ejendomstypenavn på hvert bygningsobjekt
    bygninger.forEach(byg => {
        byg.ejendomstype = oversætAnvendelse(byg.byg021BygningensAnvendelse);
    });
    return bygninger;
}

// ============================================
// Henter bygning via bygningens eget UUID.
// Bruges når vi kender bygnings-ID'et fra en enhed (typisk lejligheder),
// da enhedsobjektet indeholder et direkte bygnings-UUID.
// ============================================
async function findBygningViaId(bygningsId) {
    const bygninger = await hentBbrData('bygning', `id=${encodeURIComponent(bygningsId)}`);
    bygninger.forEach(byg => {
        byg.ejendomstype = oversætAnvendelse(byg.byg021BygningensAnvendelse);
    });
    return bygninger;
}

// ============================================
// Fallback: henter bygning via BFE-nummer.
// Bruges til etageejendomme hvor husnummer-opslaget ikke returnerer bygningen,
// fordi bygningen er registreret på ejendommen frem for den specifikke adresse.
// Returnerer den første boligbygning (anvendelseskode 110–299) eller null.
// ============================================
async function findBygningViaBfe(bfeNummer) {
    const bygninger = await hentBbrData('bygning', `BFEnummer=${encodeURIComponent(bfeNummer)}`);
    bygninger.forEach(byg => {
        byg.ejendomstype = oversætAnvendelse(byg.byg021BygningensAnvendelse);
    });
    return bygninger.find(byg => {
        const kode = parseInt(byg.byg021BygningensAnvendelse);
        return kode >= 110 && kode <= 299;
    }) || null;
}

// ============================================
// Henter alle enheder (lejligheder/boliger) tilknyttet en adresse.
// Bruges som primært opslag — virker for alle adressetyper inkl. ejerlejligheder,
// fordi BBR knytter enheden direkte til adresse-ID'et via adresseIdentificerer.
// ============================================
async function findEnhedViaAdresse(adresseId) {
    return await hentBbrData('enhed', `AdresseIdentificerer=${encodeURIComponent(adresseId)}`);
}

module.exports = { oversætAnvendelse, findBygninger, findBygningViaId, findBygningViaBfe, findEnhedViaAdresse };