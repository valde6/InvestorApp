// ============================================
// models/Simulering.js
// Beregner udviklingen af en investeringscase
// over en given årrække (fx 30 år)
// Bruger Finansiering, Driftsbudget, Udlejning
// og Renovering til at beregne cashflow,
// egenkapital og gæld år for år
// ============================================

const Finansiering = require('./finansiering');
const Driftsbudget = require('./driftsbudget');
const Udlejning = require('./udlejning');
const Renovering = require('./renovering');

class Simulering {
    constructor(finansiering, driftsbudget, udlejning, renoveringer = [], antalAar = 30) {
        // finansiering er et Finansiering-objekt
        this.finansiering = finansiering;

        // driftsbudget er et Driftsbudget-objekt med løbende udgifter
        this.driftsbudget = driftsbudget;

        // udlejning er et Udlejning-objekt — kan være null hvis ejendommen ikke udlejes
        this.udlejning = udlejning;

        // renoveringer er et array af Renovering-objekter
        this.renoveringer = renoveringer;

        // antal år simuleringen skal køre over
        this.antalAar = antalAar;
    }

    // Beregner cashflow, gæld og egenkapital for hvert år
    // Returnerer et array med ét objekt per år
    beregnSimulering(ejendomspris) {
        const resultater = [];

        // Hvis der ingen finansiering er angivet sættes gæld og ydelse til 0
        // Dette håndterer tilfældet hvor en case oprettes uden låneoplysninger
        let gaeld = this.finansiering ? this.finansiering.laanebeloeb : 0;

        // Månedlig rente som decimaltal (fx 0.04 / 12)
        // 0 hvis ingen finansiering er angivet
        const r = this.finansiering ? this.finansiering.renteProcent / 12 : 0;

        // Månedlig ydelse fra Finansiering-klassen (annuitet efter afdragsfri periode)
        // 0 hvis ingen finansiering er angivet
        const maanedligYdelse = this.finansiering ? this.finansiering.maanedligYdelse() : 0;

        // Antal afdragsfri år — 0 hvis ingen finansiering er angivet
        const afdragsfriAar = this.finansiering ? this.finansiering.afdragsfriPeriodeAar || 0 : 0;

        for (let aar = 1; aar <= this.antalAar; aar++) {

            // --- BEREGN AFDRAG PÅ GÆLD FOR DETTE ÅR ---
            for (let maaned = 1; maaned <= 12; maaned++) {
                if (gaeld <= 0) break;

                const renteDel = gaeld * r;

                if (aar <= afdragsfriAar) {
                    // I afdragsfri periode betales kun renter — gælden falder ikke
                    // gaeld forbliver uændret
                } else {
                    // Efter afdragsfri periode trækkes afdrag fra gælden
                    const afdragDel = maanedligYdelse - renteDel;
                    gaeld = Math.max(0, gaeld - afdragDel);
                }
            }

            // --- BEREGN CASHFLOW FOR DETTE ÅR ---

            // Månedlig ydelse afhænger af om vi er i afdragsfri periode
            // I afdragsfri periode betales kun renter (gæld * månedlig rente * 12)
            const aarligYdelse = aar <= afdragsfriAar
                ? gaeld * r * 12
                : maanedligYdelse * 12;

            // Indtægter fra udlejning (0 hvis ikke udlejet)
            const lejeindtaegt = this.udlejning
                ? this.udlejning.aarligLejeindtaegt()
                : 0;

            // Løbende driftsudgifter
            const driftsudgifter = this.driftsbudget.samletAarlig();

            // Engangsudgifter til renovering dette år
            const renoveringsudgifter = this.renoveringer
                .filter(ren => ren.tidspunktAar === aar)
                .reduce((sum, ren) => sum + ren.hentUdgift(), 0);

            // Samlet cashflow = indtægter - udgifter - ydelse - renovering
            const cashflow = lejeindtaegt - driftsudgifter - aarligYdelse - renoveringsudgifter;

            // --- BEREGN EGENKAPITAL ---
            const egenkapital = ejendomspris - gaeld;

            resultater.push({
                aar,
                cashflow: Math.round(cashflow),
                gaeld: Math.round(gaeld),
                egenkapital: Math.round(egenkapital)
            });
        }

        return resultater;
    }
}

module.exports = Simulering;