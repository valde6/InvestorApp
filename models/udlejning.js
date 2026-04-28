// ============================================
// models/Udlejning.js
// Klasse der repræsenterer udlejning af en
// ejendomsinvestering
// ============================================

class Udlejning {
    constructor(maanedligLeje, maanedligeUdgifter = 0) {
        this.maanedligLeje = maanedligLeje;
        this.maanedligeUdgifter = maanedligeUdgifter;
    }

    // Beregner månedligt netto cashflow fra udlejning
    maanedligNetto() {
        return this.maanedligLeje - this.maanedligeUdgifter;
    }

    // Beregner årligt netto cashflow fra udlejning
    aarligNetto() {
        return this.maanedligNetto() * 12;
    }

    // Beregner samlede årlige lejeindtægter
    aarligLejeindtaegt() {
        return this.maanedligLeje * 12;
    }

    // Beregner samlede årlige lejeudgifter
    aarligLejeudgift() {
        return this.maanedligeUdgifter * 12;
    }
}

module.exports = Udlejning;