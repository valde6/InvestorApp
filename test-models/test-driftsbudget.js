// ============================================
// test-driftsbudget.js
// Unittests for Driftsbudget-klassen
// Kører med: node --test test-driftsbudget.js
// ============================================

const { test } = require('node:test');
const assert = require('node:assert');
const Driftsbudget = require('../models/Driftsbudget');

// Test 1: Månedlig total beregnes korrekt
test('samletMaanedlig beregner korrekt sum', () => {
    const d = new Driftsbudget();
    d.tilfoejPost('Ejendomsskat', 2000);
    d.tilfoejPost('Forsikring', 500);
    d.tilfoejPost('Vedligehold', 1000);
    assert.strictEqual(d.samletMaanedlig(), 3500);
});

// Test 2: Årlig total er månedlig * 12
test('samletAarlig er samletMaanedlig gange 12', () => {
    const d = new Driftsbudget();
    d.tilfoejPost('Fællesudgifter', 1000);
    assert.strictEqual(d.samletAarlig(), 12000);
});

// Test 3: Tomt driftsbudget giver 0
test('tomt driftsbudget giver samletMaanedlig 0', () => {
    const d = new Driftsbudget();
    assert.strictEqual(d.samletMaanedlig(), 0);
});