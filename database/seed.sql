-- ============================================
-- database/seed.sql
-- Eksempeldata til lokal udvikling og test
-- Kør efter schema.sql
-- ============================================

-- Ejendomsprofiler
-- adresse_id er det rigtige DAWA UUID, bruges til BBR-opslag og kortvisning
-- grundareal_m2 er NULL for lejligheder (de har ikke en selvstændig grund)
INSERT INTO Ejendomsprofil (adresse_id, adresse, ejendomstype, byggeaar, boligareal_m2, antal_vaerelser, grundareal_m2)
VALUES
    ('0a3f50a1-dc7e-32b8-e044-0003ba298018', 'Østerbrogade 45, 2. tv, 2100 København Ø', 'Lejlighed',    1923,  87, 3, NULL),
    ('0a3f50a3-c3df-32b8-e044-0003ba298018', 'Gudrunsvej 5, 2920 Charlottenlund',         'Enfamiliehus', 1954, 162, 5,  720),
    ('5b0f2cea-585f-488c-b9d7-65ca0180d092', 'Nørrebrogade 88, st., 2200 København N',    'Lejlighed',    1898,  64, 2, NULL),
    ('0a3f50a4-1a0d-32b8-e044-0003ba298018', 'Tornagervej 11, 2920 Charlottenlund',       'Enfamiliehus', 1967, 198, 6,  890);

-- Investeringscases
-- Profil 1 har 2 cases (god til at demonstrere sammenligning), resten har 1
INSERT INTO Investeringscase (ejendomsprofil_id, navn, beskrivelse, ejendomspris, omkostninger_koeb, advokat, tinglysning, koeberraadgivning)
VALUES
    (1, 'Østerbro udlejning 2024',       'Langtidsudlejning til studerende nær universitetet', 3200000,  50000, 15000, 10000, 20000),
    (1, 'Østerbro korttidsudlejning',    'Airbnb-strategi i højsæson',                         3200000,  50000, 15000, 10000, 20000),
    (2, 'Gudrunsvej langsigtet',         'Køb og hold — rolig villavej i Charlottenlund',      5200000,  80000, 22000, 16000, 28000),
    (3, 'Nørrebro renovering og salg',   'Opkøb, totalrenovering og videresalg',               2800000,  45000, 12000,  9000, 18000),
    (4, 'Tornagervej udlejning familie', 'Langtidsudlejning til familie i Charlottenlund',     6100000, 100000, 26000, 20000, 35000);

-- Finansiering
-- rente_procent gemmes som procenttal (4.25 = 4,25%) — routes dividerer med 100 inden brug i beregningsmodellen
INSERT INTO Finansiering (investeringscase_id, laanebeloeb, rente_procent, loebetid_aar, afdragsfri_periode_aar, laanetype)
VALUES
    (1, 2560000, 4.25, 30, 0, 'Realkreditlån'),
    (2, 2560000, 4.50, 25, 2, 'Realkreditlån'),
    (3, 4160000, 4.00, 30, 5, 'Realkreditlån'),
    (4, 2240000, 5.00, 20, 0, 'Banklån'),
    (5, 4880000, 3.90, 30, 3, 'Realkreditlån');

-- Koebsomkostninger
-- Variable ekstraomkostninger brugeren tilføjer i trin 3.1
INSERT INTO Koebsomkostning (investeringscase_id, beskrivelse, beloeb)
VALUES
    (1, 'Tilstandsrapport',       4500),
    (1, 'Elinstallationsrapport', 3500),
    (3, 'Tilstandsrapport',       4500),
    (3, 'Byggesagkyndig',         8000),
    (5, 'Tilstandsrapport',       4500),
    (5, 'Elinstallationsrapport', 3500);

-- Renoveringer
-- Engangsudgifter på et bestemt tidspunkt — bruges i simuleringsmodellen
INSERT INTO Renovering (investeringscase_id, beskrivelse, beloeb, tidspunkt)
VALUES
    (1, 'Køkken og badeværelse',    95000, '2025-06-01'),
    (2, 'Maling og gulve',          40000, '2025-03-01'),
    (3, 'Tilbygning og isolering', 350000, '2026-01-01'),
    (4, 'Total renovering',        450000, '2025-09-01'),
    (5, 'Køkken, bad og facade',   280000, '2025-07-01');

-- Driftsbudgetter
-- Én per investeringscase
INSERT INTO Driftsbudget (investeringscase_id, navn, maanedlig_total)
VALUES
    (1, 'Driftsbudget Østerbro udlejning', 4200),
    (2, 'Driftsbudget Østerbro korttid',   5500),
    (3, 'Driftsbudget Gudrunsvej',         4800),
    (4, 'Driftsbudget Nørrebro',           3100),
    (5, 'Driftsbudget Tornagervej',        5900);

-- Driftsomkostninger
-- Individuelle poster under hvert driftsbudget
INSERT INTO Driftsomkostning (driftsbudget_id, beskrivelse, maanedlig_beloeb, kategori)
VALUES
    (1, 'Ejendomsskat',    1200, 'Skat'),
    (1, 'Forsikring',       800, 'Forsikring'),
    (1, 'Vedligehold',     1500, 'Vedligehold'),
    (1, 'Fællesudgifter',   700, 'Fællesudgifter'),
    (2, 'Ejendomsskat',    1200, 'Skat'),
    (2, 'Rengøring',       2000, 'Service'),
    (2, 'Forsikring',      1000, 'Forsikring'),
    (3, 'Ejendomsskat',    2200, 'Skat'),
    (3, 'Forsikring',      1200, 'Forsikring'),
    (3, 'Vedligehold',     1400, 'Vedligehold'),
    (4, 'Ejendomsskat',     900, 'Skat'),
    (4, 'Forsikring',       700, 'Forsikring'),
    (4, 'Fællesudgifter',   600, 'Fællesudgifter'),
    (5, 'Ejendomsskat',    2800, 'Skat'),
    (5, 'Forsikring',      1600, 'Forsikring'),
    (5, 'Vedligehold',     1800, 'Vedligehold');

-- Udlejning
-- Én post per investeringscase
INSERT INTO Udlejning (investeringscase_id, maanedlig_leje, udlejningsomkostning, beskrivelse)
VALUES
    (1, 12500,  500, 'Langtidsudlejning til studerende'),
    (2, 18000, 2000, 'Korttidsudlejning via Airbnb'),
    (3, 22000,  800, 'Familieudlejning langsigtet'),
    (4, 11000,  500, 'Udlejning under renovering'),
    (5, 26000, 1000, 'Langtidsudlejning til familie');