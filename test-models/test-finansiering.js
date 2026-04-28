// ============================================
// test-finansiering.js
// Unittests for Finansiering-klassen
// Kører med: node --test test-finansiering.js
// ============================================

const { test } = require('node:test');
const assert = require('node:assert');
const Finansiering = require('../models/Finansiering');

// Test 1: Månedlig ydelse beregnes korrekt
test('maanedligYdelse beregner korrekt for kendt lån', () => {
    const f = new Finansiering(1000000, 0.04, 30);
    const ydelse = f.maanedligYdelse();
    // Forventet ca. 4774 kr — vi tjekker inden for 1 kr tolerance
    assert.ok(ydelse > 4773 && ydelse < 4775, `Forventede ~4774, fik ${ydelse.toFixed(2)}`);
});

// Test 2: Total renteomkostning er altid positiv
test('totalRenteomkostning er større end 0', () => {
    const f = new Finansiering(2000000, 0.05, 25);
    const rente = f.totalRenteomkostning();
    assert.ok(rente > 0, `Renteomkostning skal være positiv, fik ${rente}`);
});

// Test 3: Månedlig ydelse ved rente = 0 er lånebeløb delt med antal måneder
test('maanedligYdelse ved rente 0 er laanebeloeb / antal maaneder', () => {
    const f = new Finansiering(1200000, 0, 10);
    const ydelse = f.maanedligYdelse();
    const forventet = 1200000 / (10 * 12); // = 10.000
    assert.strictEqual(Math.round(ydelse), Math.round(forventet));
});