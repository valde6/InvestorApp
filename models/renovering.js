// ============================================
// models/Renovering.js
// Klasse der repræsenterer en renovering/forbedring af en ejendomsinvestering
// ============================================

class Renovering {
    constructor(beskrivelse, udgift, tidspunktAar) {
        this.beskrivelse = beskrivelse;
        this.udgift = udgift;
        this.tidspunktAar = tidspunktAar;
    }

    // Returnerer udgiften til brug i samlet økonomi
    hentUdgift() {
        return this.udgift;
    }

    // Returnerer tidspunktet for renoveringen
    hentTidspunkt() {
        return this.tidspunktAar;
    }

    // Returnerer en tekstbeskrivelse af renoveringen
    opsummering() {
        return `${this.beskrivelse}: ${this.udgift} kr. i år ${this.tidspunktAar}`;
    }
}

module.exports = Renovering;