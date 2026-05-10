// ============================================
// public/js/investeringscase-koeb.js
// Klient-side logik for trin 3.1 (Køb og renoveringsudgifter)
// ============================================

// Find de elementer på siden vi skal arbejde med
const tilføjKnap = document.getElementById('tilfoej-udgift');
const ekstraUdgifterContainer = document.getElementById('ekstra-udgifter');

// Hver gang brugeren klikker på "Tilføj udgift"-knappen,
// indsættes der en ny række med to input-felter og en slet-knap
tilføjKnap.addEventListener('click', () => {

    // Lav et nyt div-element der skal indeholde den nye række
    const nyRække = document.createElement('div');

    // Sæt indholdet af div'en - to input-felter og en slet-knap
    nyRække.innerHTML = `
        <input type="text" name="ekstra_beskrivelse" placeholder="Beskrivelse" required>
        <input type="number" name="ekstra_beloeb" placeholder="Beløb (kr.)" required>
        <button type="button" class="slet-udgift">Fjern</button>
    `;

    // Tilføj den nye række nederst i container'en
    ekstraUdgifterContainer.appendChild(nyRække);

    // Find slet-knappen i den nye række og giv den en click-handler
    const sletKnap = nyRække.querySelector('.slet-udgift');
    sletKnap.addEventListener('click', () => {
        nyRække.remove();
    });
});