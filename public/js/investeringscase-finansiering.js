// bruges til at give mulighed for at 

const laanebeloebFelt = document.getElementById('laanebeloeb');
const ekstraFelter = document.getElementById('finansiering-ekstra');

laanebeloebFelt.addEventListener('input', () => {
    if (parseFloat(laanebeloebFelt.value) > 0) {
        ekstraFelter.style.display = 'block';
    } else {
        ekstraFelter.style.display = 'none';
    }
});