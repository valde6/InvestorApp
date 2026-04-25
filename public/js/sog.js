// ============================================
// public/js/sog.js
// Client-side script: lytter på søgefeltet og 
// kalder vores API for at vise adresseforslag
// ============================================

// Trin 1: Find DOM-elementerne vi skal bruge
const inputFelt = document.getElementById('adresse-input');
const forslagListe = document.getElementById('forslag-liste');

// Trin 2: Lyt på når brugeren skriver i input-feltet
inputFelt.addEventListener('input', async () => {
    const q = inputFelt.value;

    // Hvis feltet er tomt, ryd listen og stop
    if (q.length < 2) {
        forslagListe.innerHTML = '';
        return;
    }

    // Trin 3: Kald vores eget API
    const response = await fetch(`/api/adresser/sog?q=${encodeURIComponent(q)}`);
    const forslag = await response.json();

    // Trin 4: Tegn forslagene som <li>-elementer
    visForslag(forslag);
});

// Hjælpefunktion: tegner forslagene i listen
function visForslag(forslag) {
    forslagListe.innerHTML = ''; // Ryd gamle forslag

    forslag.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item.tekst;

        // Lyt på klik for dette specifikke <li>
        li.addEventListener('click', () => {
            haandterValg(item);
        });

        forslagListe.appendChild(li);
    });
};

function haandterValg(valgtForslag) {
    // Hvis brugeren har valgt en fuldt valideret adresse,
    // er vi færdige med at validere også skal vi gå videre.
    if (valgtForslag.type === 'adresse') {
        const adresseId = valgtForslag.data.id;
        console.log('Valideret adresse valgt:', valgtForslag);
        console.log('Adresse-ID:', adresseId);

        // I næste skridt: naviger til /ejendom/:id
        window.location.href = `/ejendom/${adresseId}`;

        return;
    }

    // Ellers: put teksten i input-feltet og trigger ny søgning
    inputFelt.value = valgtForslag.forslagstekst + ' ';
    inputFelt.focus();
    inputFelt.dispatchEvent(new Event('input'));
}