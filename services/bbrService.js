const BBR_BASE_URL = 'https://services.datafordeler.dk/BBR/BBRPublic/1/REST/bygning';

const datafordelerUsername = process.env.DATAFORDELER_USERNAME
const datafordelerPassword = process.env.DATAFORDELER_PASSWORD


//Kontrollerer at de eksiterer i .env ved serveropstart så vi hurtigt og effektivt opdager fejl
if (!datafordelerUsername || !datafordelerPassword) {
    throw new Error('DATAFORDELER credentials mangler i .env (DATAFORDELER_USERNAME og DATAFORDELER_PASSWORD)');
};

async function findAdresseData(adresseId) {
    const url = `${BBR_BASE_URL}?Husnummer=${encodeURIComponent(adresseId)}&Format=JSON&username=${datafordelerUsername}&password=${datafordelerPassword}`; //EncodeURI anvendes fordi der ikke toleres mellemrum/specialtegn. Metoden erstatter specialtegn med sikre koder. f.eks. mellemrum bliver til %20

    console.log('DEBUG BBR URL:', url.replace(datafordelerPassword, '***')); //Debugger linje

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`BBR svarede med status ${response.status}`);
    }

    const data = await response.json();
    return data;
};

module.exports = { findAdresseData };
