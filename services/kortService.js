const SKRAAFOTO_BASE_URL = 'https://skraafoto.dataforsyningen.dk/';

// Bygger en URL til en Skråfoto-viewer centreret om de givne koordinater.
// Tager (longitude, latitude) i WGS84 (EPSG:4326).
// URL'en er beregnet til at blive embedded i et <iframe>.
function byggeLuftfotoUrl(longitude, latitude) {
    return `${SKRAAFOTO_BASE_URL}?project=Denmark&lon=${longitude}&lat=${latitude}`;
}

module.exports = { byggeLuftfotoUrl };