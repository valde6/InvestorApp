// ============================================
// test-services/test-db.js
// Simpelt forbindelsestest til Azure SQL databasen.
// Kører med: node test-db.js
// Tjekker at pool.connect() lykkes og at en simpel query returnerer et resultat.
// ============================================

const { pool, poolConnect } = require('../services/db');

async function test() {
    await poolConnect;
    const result = await pool.request().query('SELECT 1 AS tal');
    console.log('Forbindelse virker! Resultat:', result.recordset);
    process.exit(0);
}

test().catch(err => {
    console.error('Fejl:', err);
    process.exit(1);
});