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
    
    forslag.forEach(forslag => {
        const li = document.createElement('li');
        li.textContent = forslag.tekst;
        forslagListe.appendChild(li);
    });
}