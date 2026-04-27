const KORT_BASE_URL = 'https://api.dataforsyningen.dk/orto_foraar';

const dataforsyningenToken = process.env.DATAFORSYNINGEN_TOKEN;

if (!dataforsyningenToken) {
    throw new Error('Datafordeleren-token mangler i .env (DATAFORSYNINGEN_TOKEN)');
}

// Bygger en URL til et luftfoto-billede centreret om de givne koordinater.
// Tager (longitude, latitude) i WGS84 (EPSG:4326).
function byggeLuftfotoUrl(longitude, latitude) {

    const url = `${KORT_BASE_URL}?token=${dataforsyningenToken}`
}

module.exports = { byggeLuftfotoUrl };