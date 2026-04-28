// ============================================
// models/Finansiering.js
// Klasse der repræsenterer finansiering af en ejendomsinvestering
// ============================================

class Finansiering {
    constructor(laanebeloeb, renteProcent, loebetidAar, afdragsfriPeriodeAar = 0) {
        this.laanebeloeb = laanebeloeb;
        this.renteProcent = renteProcent;
        this.loebetidAar = loebetidAar;
        this.afdragsfriPeriodeAar = afdragsfriPeriodeAar;
    }

    // Beregner den månedlige rente
    maanedligRente() {
        return this.renteProcent / 12;
    }

    // Beregner månedlig ydelse (kun rente i afdragsfri periode, ellers annuitet)

    maanedligYdelse() {
        const r = this.renteProcent / 12; 
        const n = this.loebetidAar * 12;

        if (r === 0) return this.laanebeloeb / n; // særtilfælde

        return this.laanebeloeb * (r / (1 - Math.pow(1 + r, -n)));
    }


    // Beregner total renteomkostning over hele lånets løbetid
    totalRenteomkostning() {
        const n = this.loebetidAar * 12;
        return (this.maanedligYdelse() * n) - this.laanebeloeb;
    }
}

module.exports = Finansiering;

