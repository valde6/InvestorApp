// ============================================
// services/darService.js
// Service der taler med DAR (Danmarks Adresseregister)
// DAR bruges som mellemled når BBR ikke kan finde en bygning
// direkte via adresse-ID - fx ved etageejendomme.
// DAR oversætter adresse-ID til husnummer-ID og videre til BFE-nummer,
// som BBR kan bruge til at finde den korrekte bygning.
// Dokumentation: https://datafordeler.dk/dataoversigt/dar-danmarks-adresseregister/
// ============================================

const DAR_BASE_URL = 'https://services.datafordeler.dk/DAR/DAR/3.0.0/rest/adresseTilHusnummer';
const DAR_BFE_BASE_URL = 'https://services.datafordeler.dk/DAR/DAR_BFE_Public/1/REST/husnummerTilBygningBfe';

const datafordelerUsername = process.env.DATAFORDELER_USERNAME
const datafordelerPassword = process.env.DATAFORDELER_PASSWORD

//Kontrollerer at de eksiterer i .env ved serveropstart så vi hurtigt og effektivt opdager fejl
if (!datafordelerUsername || !datafordelerPassword) {
    throw new Error('DATAFORDELER credentials mangler i .env (DATAFORDELER_USERNAME og DATAFORDELER_PASSWORD)');
};

// Oversætter et DAWA adresse-ID til et DAR husnummer-ID.
// Husnummer-ID'et bruges videre til at slå BFE-nummeret op,
// som igen bruges til at finde bygningen i BBR.
async function adresseIdTilHusnummerId(adresseId) {
    const url = `${DAR_BASE_URL}?username=${datafordelerUsername}&Format=JSON&password=${datafordelerPassword}&adresseId=${encodeURIComponent(adresseId)}`;
    //EncodeURI anvendes fordi der ikke toleres mellemrum/specialtegn. Metoden erstatter specialtegn med sikre koder. f.eks. mellemrum bliver til %20


    const response = await fetch(url);

    if (!response.ok) {
        const fejlTekst = await response.text(); // Hent fejlbeskeden fra serveren
        console.log('DEBUG fejl-svar fra DAR:', fejlTekst);
        throw new Error(`dar svarede med status ${response.status}`);
    }

    const data = await response.json();
    return data;
};

// Oversætter et husnummer-ID til et BFE-nummer (Bygnings- og FodsporElemenets nummer).
// BFE-nummeret identificerer den samlede faste ejendom i BBR,
// og bruges som fallback når bygningen ikke kan findes via adresse-ID alene.
async function husnummerTilBygningBfe(husnummerId) {
    const url = `${DAR_BFE_BASE_URL}?username=${datafordelerUsername}&Format=JSON&password=${datafordelerPassword}&husnummerId=${encodeURIComponent(husnummerId)}`;


    const response = await fetch(url);

    if (!response.ok) {
        const fejlTekst = await response.text();
        console.log('DEBUG fejl-svar fra DAR BFE:', fejlTekst);
        throw new Error(`DAR BFE svarede med status ${response.status}`);
    }

    const data = await response.json();

    // ?. er optional chaining - returnerer undefined frem for at kaste en fejl hvis feltet ikke findes
    // [0] henter første element i jordstykkeList-arrayet
    // samletFastEjendom er DAR's navn for BFE-nummeret på den samlede faste ejendom
    const bfeNummer = data?.jordstykkeList?.[0]?.samletFastEjendom;

    if (!bfeNummer) {
        console.warn('Intet BFE-nummer fundet i DAR-svar:', JSON.stringify(data));
        return null;
    }

    return bfeNummer;
}

module.exports = { adresseIdTilHusnummerId, husnummerTilBygningBfe };
