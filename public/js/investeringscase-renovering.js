// ============================================
// Klient-side logik for trin 3.3 (Renovering)
// Håndterer dynamisk tilføjelse og fjernelse af renoveringslinjer
// ============================================

const tilfoejKnap = document.getElementById('tilfoej-renovering'); // findes i investeringscase-renovering linje 33
const renoveringerContainer = document.getElementById('renoveringer');

// Når brugeren klikker "Tilføj renovering" indsættes en ny række
// med felter til beskrivelse, beløb og tidspunkt
tilfoejKnap.addEventListener('click', () => {
    const nyRaekke = document.createElement('div');

    nyRaekke.innerHTML = `
        <input type="text" name="beskrivelse" placeholder="Beskrivelse (fx. Nyt køkken)" required>
        <input type="number" name="beloeb" placeholder="Beløb (kr.)" required>
        <input type="date" name="tidspunkt" required>
        <button type="button" class="slet-renovering">Fjern</button>
    `;

    renoveringerContainer.appendChild(nyRaekke);

    // Giv slet-knappen i den nye række en click-handler der fjerner hele rækken
    const sletKnap = nyRaekke.querySelector('.slet-renovering');
    sletKnap.addEventListener('click', () => {
        nyRaekke.remove();
    });
});
