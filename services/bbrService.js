const BBR_BASE_URL = 'https://services.datafordeler.dk/BBR/BBRPublic/1/REST/bygning';

const bbrUsername = process.env.BBR_USERNAME
const bbrPassword = process.env.BBR_PASSWORD


//Kontrollerer at de eksiterer i .env ved serveropstart så vi hurtigt og effektivt opdager fejl
if (!bbrUsername || !bbrPassword) {
    throw new Error('BBR credentials mangler i .env (BBR_USERNAME og BBR_PASSWORD)');
};

async function findAdresseData(adresseId) {
    const url = `${BBR_BASE_URL}?Husnummer=${encodeURIComponent(adresseId)}&username=${bbrUsername}&password=${bbrPassword}`; //EncodeURI anvendes fordi der ikke toleres mellemrum/specialtegn. Metoden erstatter specialtegn med sikre koder. f.eks. mellemrum bliver til %20

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`BBR svarede med status ${response.status}`);
    }

    const data = await response.json();
    return data;
};

module.exports = { findAdresseData };
