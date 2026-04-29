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