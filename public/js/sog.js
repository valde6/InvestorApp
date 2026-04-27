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
    console.log('DEBUG valgtForslag:', valgtForslag);
    if (valgtForslag.type === 'adresse') {
        const adresseId = valgtForslag.data.id;
        console.log('Valideret adresse valgt:', valgtForslag);
        console.log('Adresse-ID:', adresseId);

        // I næste skridt: naviger til /ejendom/:id Window.location.href =, gør at man navigerer automatisk til siden
        window.location.href = `/ejendomme/${adresseId}`;

        return; //Hopper ud af funktionen så resten ikke bliver kørt
    }

    // Ellers: put teksten i input-feltet og trigger ny søgning (Dette er f.eks. hvis brugeren bare har indtastet solbjerg plads -> ikke valid adresse)
    inputFelt.value = valgtForslag.tekst;
    inputFelt.focus(); //Flytter cursor tilbage i inputfeltet, så bruger nemmere kan indskrive bolig
    inputFelt.dispatchEvent(new Event('input')); //Kører eventlisteneren igen, så brugeren får den nye liste, ud fra den valgte boligadresse
}

//Kommentar f.eks. vinkelvej virker ikke ??