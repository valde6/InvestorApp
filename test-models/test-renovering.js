// ============================================
// test-renovering.js
// Unittests for Renovering-klassen
// Kører med: node --test test-renovering.js
// ============================================

const { test } = require('node:test');
const assert = require('node:assert');
const Renovering = require('../models/Renovering');

// Test 1: Udgift gemmes og returneres korrekt
test('hentUdgift returnerer korrekt udgift', () => {
    const r = new Renovering('Nyt tag', 150000, 5);
    assert.strictEqual(r.hentUdgift(), 150000);
});

// Test 2: Tidspunkt gemmes og returneres korrekt
test('hentTidspunkt returnerer korrekt år', () => {
    const r = new Renovering('Nyt køkken', 80000, 3);
    assert.strictEqual(r.hentTidspunkt(), 3);
});

// Test 3: Udgift på 0 håndteres korrekt
test('hentUdgift håndterer udgift på 0', () => {
    const r = new Renovering('Ingen udgift', 0, 2);
    assert.strictEqual(r.hentUdgift(), 0);
});