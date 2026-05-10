// ============================================
// public/js/investeringscase-driftsbudget.js
// Klient-side logik for trin 3.4 (Driftsbudget)
// Håndterer dynamisk tilføjelse og fjernelse af driftsomkostningslinjer
// ============================================

const tilfoejKnap = document.getElementById('tilfoej-omkostning');
const omkostningerContainer = document.getElementById('omkostninger');


// Når brugeren klikker "Tilføj omkostning" indsættes en ny række
// med felter til beskrivelse, månedligt beløb og kategori
tilfoejKnap.addEventListener('click', () => {
    const nyRaekke = document.createElement('div');

    nyRaekke.innerHTML = `
        <input type="text" name="beskrivelse" placeholder="Beskrivelse (fx Ejendomsskat)" required>
        <input type="number" name="maanedlig_beloeb" placeholder="Månedligt beløb (kr.)" required>
        <input type="text" name="kategori" placeholder="Kategori (fx Skat, Forsikring)">
        <button type="button" class="slet-omkostning">Fjern</button>
    `;

    omkostningerContainer.appendChild(nyRaekke);

    // Giv slet-knappen i den nye række en click-handler der fjerner hele rækken
    const sletKnap = nyRaekke.querySelector('.slet-omkostning');
    sletKnap.addEventListener('click', () => {
        nyRaekke.remove();
    });
});