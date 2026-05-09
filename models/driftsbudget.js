// ============================================
// models/Driftsbudget.js
// Klasse der repræsenterer driftsbudget for en ejendomsinvestering
// ============================================

class Driftsbudget {
    constructor() {
        this.poster = [];
    }

    // Tilføjer en driftspost med navn og månedlig udgift
    tilfoejPost(navn, maanedligUdgift) {
        this.poster.push({ navn, maanedligUdgift });
    }

    // Beregner samlede månedlige driftsomkostninger
    samletMaanedlig() {
        return this.poster.reduce((sum, post) => sum + post.maanedligUdgift, 0);
    }

    // Beregner samlede årlige driftsomkostninger
    samletAarlig() {
        return this.samletMaanedlig() * 12;
    }

    // Returnerer alle poster
    hentPoster() {
        return this.poster;
    }
}

module.exports = Driftsbudget;