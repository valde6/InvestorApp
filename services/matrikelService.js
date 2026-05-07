// ============================================
// services/matrikelService.js
// Henter grundareal fra DAWA's jordstykke-endpoint.
// Ingen credentials påkrævet — åbent offentligt API.
// ============================================

// Henter grundareal i kvadrat meter for et jordstykke via dets direkte href fra DAWA.
// Returnerer null hvis arealet ikke kan hentes.
async function hentGrundareal(jordstykkeHref) {
    const response = await fetch(jordstykkeHref);
    if (!response.ok) return null;
    const data = await response.json();
    return data.registreretareal ?? null;
}

module.exports = { hentGrundareal };