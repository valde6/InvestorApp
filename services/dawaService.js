// ============================================
// services/dawaService.js
// Service der taler med DAWA (Danmarks Adressers Web API)
// Dokumentation: https://dawadocs.dataforsyningen.dk
// ============================================

const DAWA_BASE_URL = 'https://api.dataforsyningen.dk';

// Slår en søgestreng op via DAWA's autocomplete-endpoint.
// Returnerer en liste af adresseforslag.
async function søgAdresse(q) {
    const url = `${DAWA_BASE_URL}/autocomplete?q=${encodeURIComponent(q)}`; //EncodeURI anvendes fordi der ikke toleres mellemrum/specialtegn. Metoden erstatter specialtegn med sikre koder. f.eks. mellemrum bliver til %20

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`DAWA svarede med status ${response.status}`);
    }

    const data = await response.json();
    return data;
}

// Henter longitude og latitude for et adresse-ID via DAWA.
// Koordinaterne ligger under adgangsadresse.vejpunkt.koordinater som [lon, lat].
async function hentKoordinater(adresseId) {
    const url = `${DAWA_BASE_URL}/adresser/${adresseId}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`DAWA svarede med status ${response.status}`);
    const data = await response.json();
    return { lon: data.adgangsadresse.vejpunkt.koordinater[0], lat: data.adgangsadresse.vejpunkt.koordinater[1] };
}


module.exports = { søgAdresse, hentKoordinater };
