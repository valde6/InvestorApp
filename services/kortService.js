//======================
//kortService.js
//Henter koordinaterne vha. DAWAs adresseID og bygger en URL op embedes i et iframe i ejs
//=======================

const SKRAAFOTO_BASE_URL = 'https://skraafoto.dataforsyningen.dk/';
const DAWA_BASE_URL = 'https://api.dataforsyningen.dk';

// Henter longitude og latitude for et adresse-ID via DAWA.
// Koordinaterne ligger under adgangsadresse.vejpunkt.koordinater som [lon, lat].
async function hentKoordinater(adresseId) {
    const url = `${DAWA_BASE_URL}/adresser/${adresseId}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`DAWA svarede med status ${response.status}`);
    const data = await response.json();
    
    // koordinater-arrayet er [lon, lat] - longitude kommer først (omvendt af mange andre formater)
    return { lon: data.adgangsadresse.vejpunkt.koordinater[0], lat: data.adgangsadresse.vejpunkt.koordinater[1] };
}

// Bygger en URL til en Skråfoto-viewer centreret om de givne koordinater.
// Tager (longitude, latitude) i WGS84 (EPSG:4326). (formatet for koordinaterne)
// URL'en er beregnet til at blive embedded i et <iframe>.
function byggeLuftfotoUrl(longitude, latitude) {
    return `${SKRAAFOTO_BASE_URL}?project=Denmark&lon=${longitude}&lat=${latitude}`;
}

module.exports = { hentKoordinater, byggeLuftfotoUrl };