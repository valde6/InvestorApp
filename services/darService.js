const DAR_BASE_URL = 'https://services.datafordeler.dk/DAR/DAR_BFE_Public/1/rest/adresseTilHusnummer';

const datafordelerUsername = process.env.DATAFORDELER_USERNAME
const datafordelerPassword = process.env.DATAFORDELER_PASSWORD

//Kontrollerer at de eksiterer i .env ved serveropstart så vi hurtigt og effektivt opdager fejl
if (!datafordelerUsername || !datafordelerPassword) {
    throw new Error('DATAFORDELER credentials mangler i .env (DATAFORDELER_USERNAME og DATAFORDELER_PASSWORD)');
};

async function adresseIdTilHusnummerId(adresseId) {
    const url = `${DAR_BASE_URL}?username=${datafordelerUsename}&password=${datafordelerPassword}&adresseId=${encodeURIComponent(adresseId)}`; //EncodeURI anvendes fordi der ikke toleres mellemrum/specialtegn. Metoden erstatter specialtegn med sikre koder. f.eks. mellemrum bliver til %20

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`dar svarede med status ${response.status}`);
    }

    const data = await response.json();
    return data;
};

module.exports = { adresseIdTilHusnummerId };
