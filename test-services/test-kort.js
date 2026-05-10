// ============================================
// test-services/test-kort.js
// Manuelt test af kortService.
// Kører med: node test-kort.js
// Tjekker at byggeLuftfotoUrl returnerer en gyldig URL med de givne koordinater.
// ============================================

require('dotenv').config();

const { byggeLuftfotoUrl } = require('../services/kortService');

const url = byggeLuftfotoUrl(12.5396, 55.7138);
console.log('Luftfoto URL:');
console.log(url);