const tilfoejKnap = document.getElementById('tilfoej-renovering'); // findes i investeringscase-renovering linje 33
const renoveringerContainer = document.getElementById('renoveringer');

tilfoejKnap.addEventListener('click', () => {
    const nyRaekke = document.createElement('div');

    nyRaekke.innerHTML = `
        <input type="text" name="beskrivelse" placeholder="Beskrivelse (fx. Nyt køkken)" required>
        <input type="number" name="beloeb" placeholder="Beløb (kr.)" required>
        <input type="date" name="tidspunkt" required>
        <button type="button" class="slet-renovering">Fjern</button>
    `;

    renoveringerContainer.appendChild(nyRaekke);

    const sletKnap = nyRaekke.querySelector('.slet-renovering');
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