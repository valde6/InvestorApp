const tilfoejKnap = document.getElementById('tilfoej-omkostning');
const omkostningerContainer = document.getElementById('omkostninger');

tilfoejKnap.addEventListener('click', () => {
    const nyRaekke = document.createElement('div');

    nyRaekke.innerHTML = `
        <input type="text" name="beskrivelse" placeholder="Beskrivelse (fx Ejendomsskat)" required>
        <input type="number" name="maanedlig_beloeb" placeholder="Månedligt beløb (kr.)" required>
        <input type="text" name="kategori" placeholder="Kategori (fx Skat, Forsikring)">
        <button type="button" class="slet-omkostning">Fjern</button>
    `;

    omkostningerContainer.appendChild(nyRaekke);

    const sletKnap = nyRaekke.querySelector('.slet-omkostning');
    sletKnap.addEventListener('click', () => {
        nyRaekke.remove();
    });
});

//forhindrer bug, der gjorde at man kan skrive bogstavet e (pga videnskab 2e9)
document.addEventListener('keydown', (event) => { 
    if (event.key === 'e' || event.key === 'E' || event.key === '+' || event.key === '-') {
        if (event.target.type === 'number') {
            event.preventDefault();
        }
    }
});