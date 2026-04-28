// ============================================
// test-udlejning.js
// Unittests for Udlejning-klassen
// Kører med: node --test tests-model/test-udlejning.js
// ============================================

const { test } = require('node:test');
const assert = require('node:assert');
const Udlejning = require('../models/Udlejning');

// Test 1: Månedligt netto beregnes korrekt
test('maanedligNetto beregner korrekt netto', () => {
    const u = new Udlejning(10000, 2000);
    assert.strictEqual(u.maanedligNetto(), 8000);
});

// Test 2: Årligt netto er månedligt netto * 12
test('aarligNetto er maanedligNetto gange 12', () => {
    const u = new Udlejning(10000, 2000);
    assert.strictEqual(u.aarligNetto(), 96000);
});

// Test 3: Uden udgifter er netto lig med leje
test('maanedligNetto uden udgifter er lig maanedligLeje', () => {
    const u = new Udlejning(8000);
    assert.strictEqual(u.maanedligNetto(), 8000);
});