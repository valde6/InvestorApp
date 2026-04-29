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

        // Startgæld er lånebeløbet
        let gaeld = this.finansiering.laanebeloeb;

        // Månedlig ydelse fra Finansiering-klassen
        const maanedligYdelse = this.finansiering.maanedligYdelse();

        // Månedlig rente som decimaltal (fx 0.04 / 12)
        const r = this.finansiering.renteProcent / 12;

        for (let aar = 1; aar <= this.antalAar; aar++) {

            // --- BEREGN AFDRAG PÅ GÆLD FOR DETTE ÅR ---
            // Vi beregner måned for måned for at få præcis gæld
            for (let maaned = 1; maaned <= 12; maaned++) {
                if (gaeld <= 0) break; // lånet er betalt ud

                const renteDel = gaeld * r; // renteandel af ydelsen
                const afdragDel = maanedligYdelse - renteDel; // afdragsandel
                gaeld = Math.max(0, gaeld - afdragDel); // træk afdrag fra gælden
            }

            // --- BEREGN CASHFLOW FOR DETTE ÅR ---

            // Indtægter fra udlejning (0 hvis ikke udlejet)
            const lejeindtaegt = this.udlejning
                ? this.udlejning.aarligLejeindtaegt()
                : 0;

            // Løbende driftsudgifter
            const driftsudgifter = this.driftsbudget.samletAarlig();

            // Låneydelse for hele året
            const aarligYdelse = maanedligYdelse * 12;

            // Engangsudgifter til renovering dette år
            const renoveringsudgifter = this.renoveringer
                .filter(r => r.tidspunktAar === aar)
                .reduce((sum, r) => sum + r.hentUdgift(), 0);

            // Samlet cashflow = indtægter - udgifter - ydelse - renovering
            const cashflow = lejeindtaegt - driftsudgifter - aarligYdelse - renoveringsudgifter;

            // --- BEREGN EGENKAPITAL ---
            // Egenkapital = ejendomsværdi - restgæld
            // Vi antager her at ejendomsværdien er konstant (kan udvides med værdistigning)
            const egenkapital = ejendomspris - gaeld;

            // Gem resultatet for dette år
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