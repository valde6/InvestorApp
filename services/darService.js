const DAR_BASE_URL = 'https://services.datafordeler.dk/DAR/DAR/3.0.0/rest/adresseTilHusnummer';

const datafordelerUsername = process.env.DATAFORDELER_USERNAME
const datafordelerPassword = process.env.DATAFORDELER_PASSWORD

//Kontrollerer at de eksiterer i .env ved serveropstart så vi hurtigt og effektivt opdager fejl
if (!datafordelerUsername || !datafordelerPassword) {
    throw new Error('DATAFORDELER credentials mangler i .env (DATAFORDELER_USERNAME og DATAFORDELER_PASSWORD)');
};

async function adresseIdTilHusnummerId(adresseId) {
    const url = `${DAR_BASE_URL}?username=${datafordelerUsername}&Format=JSON&password=${datafordelerPassword}&adresseId=${encodeURIComponent(adresseId)}`; //EncodeURI anvendes fordi der ikke toleres mellemrum/specialtegn. Metoden erstatter specialtegn med sikre koder. f.eks. mellemrum bliver til %20

    console.log('DEBUG URL:', url.replace(datafordelerPassword, '***')); // Skjuler password i log


    const response = await fetch(url);

    if (!response.ok) {
        const fejlTekst = await response.text(); // Hent fejlbeskeden fra serveren
        console.log('DEBUG fejl-svar fra DAR:', fejlTekst);
        throw new Error(`dar svarede med status ${response.status}`);
    }

    const data = await response.json();
    return data;
};

module.exports = { adresseIdTilHusnummerId };
