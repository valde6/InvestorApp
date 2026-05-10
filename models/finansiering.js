// ============================================
// models/Finansiering.js
// Klasse der repræsenterer finansiering af en ejendomsinvestering
// ============================================

class Finansiering {
    constructor(laanebeloeb, renteProcent, loebetidAar, afdragsfriPeriodeAar = 0) {
        this.laanebeloeb = laanebeloeb;

        // renteProcent forventes som decimaltal, ikke procent
        // fx 4% rente sendes ind som 0.04 - ikke 4
        // Konverteringen sker i route-filen inden objektet oprettes (rente_procent / 100)
        this.renteProcent = renteProcent;

        // loebetidAar er det samlede antal år lånet løber, inkl. eventuel afdragsfri periode
        this.loebetidAar = loebetidAar;


        // afdragsfriPeriodeAar er valgfri - default er 0 (ingen afdragsfri periode)
        this.afdragsfriPeriodeAar = afdragsfriPeriodeAar;
    }

    // Beregner den månedlige rente
    maanedligRente() {
        return this.renteProcent / 12;
    }

    // Beregner månedlig ydelse efter den afdragsfrie periode er udløbet.
    // Den afdragsfrie periode trækkes fra løbetiden fordi hele gælden
    // stadig skal afdrages - bare over færre år.
    // Eksempel: 30 års lån, 5 år afdragsfrit -> annuitet beregnes over 25 år
    maanedligYdelse() {
        const r = this.renteProcent / 12;
        const effektivLoebetid = this.loebetidAar - this.afdragsfriPeriodeAar;
        const n = effektivLoebetid * 12;

        // Annuitetsformel: M = P * (r / (1 - (1+r)^-n))
        // M = månedlig ydelse, P = lånebeløb, r = månedlig rente, n = antal måneder
        // Formlen giver en fast ydelse hvor renteandelen falder og afdragsandelen stiger over tid
        return this.laanebeloeb * (r / (1 - Math.pow(1 + r, -n)));
        if (r === 0) return this.laanebeloeb / n; // særtilfælde: rentefrit lån (Kontant køb)

        return this.laanebeloeb * (r / (1 - Math.pow(1 + r, -n)));
    }

    // Beregner total renteomkostning over hele lånets løbetid.
    // I den afdragsfrie periode betales kun renter (gæld * månedlig rente * 12 måneder).
    // Herefter betales annuiteten over den resterende løbetid.
    totalRenteomkostning() {
        const r = this.renteProcent / 12;
        const afdragsfriMaaneder = this.afdragsfriPeriodeAar * 12;
        const effektivMaaneder = (this.loebetidAar - this.afdragsfriPeriodeAar) * 12;

        // Renteomkostning i den afdragsfrie periode: fuld gæld * månedlig rente * antal måneder
        const renteAfdragsfri = this.laanebeloeb * r * afdragsfriMaaneder;

        // Renteomkostning i afdrags-perioden: total betaling minus det der faktisk afdrages
        const renteAfdrags = (this.maanedligYdelse() * effektivMaaneder) - this.laanebeloeb;

        return renteAfdragsfri + renteAfdrags;
    }
}

module.exports = Finansiering;