require('dotenv').config();

const { byggeLuftfotoUrl } = require('./services/kortService');

const url = byggeLuftfotoUrl(12.5396, 55.7138);
console.log('Luftfoto URL:');
console.log(url);