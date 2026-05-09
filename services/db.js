//========================================
// services/db.js
// Forbindelse til Azure SQL database
//=========================================

const sql = require('mssql');
require('dotenv').config();

const config = {
    server: process.env.DB_SERVER, // gør sådan her i stedet for at skrive værdierne, hvilket er hele meningen med .env-filen. Hvis PW f.eks. ændres, sker der intet herinde.
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    options: {
        encrypt: true, //uden denne linje vil Azure afvise vores forbindelse
        trustServerCertificate: false
    }
};

const pool = new sql.ConnectionPool(config); // connectionpool er en måde at der ikke skal oprettes en NY connection HVER eneste gang, der skal sendes 
// noget fra vores API til database, men i stedet "opretholder" en forbindelse mellem de to, som andre forespørgelser kan anvende.
const poolConnect = pool.connect(); // pool.connect starter forbindelsen

poolConnect.catch(err => {
    console.error('Kunne ikke forbinde til databasen:', err);
});

module.exports = { pool, poolConnect, sql };

//eksporterer 3 ting: 
// selve pool'en -> til queries
// poolConnect  -> til at vente på at forbindelsen er klar
// sql -> til at bygge vores queries med