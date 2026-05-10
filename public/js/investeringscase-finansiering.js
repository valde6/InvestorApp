// ============================================
// public/js/investeringscase-finansiering.js
// Klient-side logik for trin 3.2 (Finansiering)
// Skjuler/viser ekstra finansieringsfelter baseret på om lånebeløbet er større end 0
// ============================================

const laanebeloebFelt = document.getElementById('laanebeloeb');
const ekstraFelter = document.getElementById('finansiering-ekstra');

// Lyt på ændringer i lånebeløb-feltet
// Hvis beløbet er større end 0 vises de ekstra felter (rente, løbetid osv.)
// Hvis feltet er 0 eller tomt skjules de - det giver ikke mening at udfylde dem uden et lån
laanebeloebFelt.addEventListener('input', () => {
    if (parseFloat(laanebeloebFelt.value) > 0) {
        ekstraFelter.style.display = 'block';
    } else {
        ekstraFelter.style.display = 'none';
    }
});

// parseFloat konverterer strengen fra formularen til et decimaltal
// Alt der kommer fra en HTML-formular er tekst - også tal.
// Uden parseFloat ville "500000" > 0 returnere false da man ikke kan
// sammenligne en streng med et tal på denne måde