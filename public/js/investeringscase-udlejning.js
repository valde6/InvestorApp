const checkbox = document.getElementById('udlejes-checkbox');
const udlejningFelter = document.getElementById('udlejning-felter');
const tilfoejKnap = document.getElementById('tilfoej-udlejning');
const udlejningerContainer = document.getElementById('udlejninger');

// Vis/skjul udlejningsfelter baseret på checkbox
checkbox.addEventListener('change', () => {
    udlejningFelter.style.display = checkbox.checked ? 'block' : 'none';
});

// Tilføj ny udlejningslinje
tilfoejKnap.addEventListener('click', () => {
    const nyRaekke = document.createElement('div');

    nyRaekke.innerHTML = `
        <input type="number" name="maanedlig_leje" placeholder="Månedlig leje (kr.)" required>
        <input type="number" name="udlejningsomkostning" placeholder="Månedlig udgift (kr.)">
        <input type="text" name="beskrivelse" placeholder="Beskrivelse (fx Lejeindtægt 1. sal)">
        <button type="button" class="slet-udlejning">Fjern</button>
    `;

    udlejningerContainer.appendChild(nyRaekke);

    const sletKnap = nyRaekke.querySelector('.slet-udlejning');
    sletKnap.addEventListener('click', () => {
        nyRaekke.remove();
    });
});

// forhindrer, at bruger kan tjekke "Ejendommen skal udlejes" af uden at tilføje en udlejning
document.querySelector('form').addEventListener('submit', (event) => {
    const checked = document.getElementById('udlejes-checkbox').checked;
    const linjer = document.querySelectorAll('#udlejninger div');

    if (checked && linjer.length === 0) {
        event.preventDefault();
        alert('Du har valgt udlejning - tilføj mindst én udlejningslinje.');
    }
});

//forhindrer bug, der gjorde at man kan skrive bogstavet e (pga videnskab 2e9)
document.addEventListener('keydown', (event) => { 
    if (event.key === 'e' || event.key === 'E' || event.key === '+' || event.key === '-') {
        if (event.target.type === 'number') {
            event.preventDefault();
        }
    }
});