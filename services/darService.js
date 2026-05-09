const DAR_BASE_URL = 'https://services.datafordeler.dk/DAR/DAR/3.0.0/rest/adresseTilHusnummer';
const DAR_BFE_BASE_URL = 'https://services.datafordeler.dk/DAR/DAR_BFE_Public/1/REST/husnummerTilBygningBfe';

const datafordelerUsername = process.env.DATAFORDELER_USERNAME
const datafordelerPassword = process.env.DATAFORDELER_PASSWORD

//Kontrollerer at de eksiterer i .env ved serveropstart så vi hurtigt og effektivt opdager fejl
if (!datafordelerUsername || !datafordelerPassword) {
    throw new Error('DATAFORDELER credentials mangler i .env (DATAFORDELER_USERNAME og DATAFORDELER_PASSWORD)');
};

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

async function husnummerTilBygningBfe(husnummerId) {
    const url = `${DAR_BFE_BASE_URL}?username=${datafordelerUsername}&Format=JSON&password=${datafordelerPassword}&husnummerId=${encodeURIComponent(husnummerId)}`;


    const response = await fetch(url);

    if (!response.ok) {
        const fejlTekst = await response.text();
        console.log('DEBUG fejl-svar fra DAR BFE:', fejlTekst);
        throw new Error(`DAR BFE svarede med status ${response.status}`);
    }

    const data = await response.json();

    // DAR returnerer ikke bfeNummer direkte, idet BFE-nummeret for ejendommen
    // ligger som 'samletFastEjendom' inde i det første element af jordstykkeList
    const bfeNummer = data?.jordstykkeList?.[0]?.samletFastEjendom;

    if (!bfeNummer) {
        console.warn('Intet BFE-nummer fundet i DAR-svar:', JSON.stringify(data));
        return null;
    }

    return bfeNummer;
}

module.exports = { adresseIdTilHusnummerId, husnummerTilBygningBfe };
