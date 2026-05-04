-- Ejendomsprofiler
-- adresse_id er sat til seed-værdier da disse ikke er rigtige DAWA-adresser
INSERT INTO Ejendomsprofil (adresse_id, adresse, ejendomstype, byggeaar, boligareal_m2, antal_vaerelser, grundareal_m2)
VALUES
    ('seed-0001', 'Østerbrogade 45, 2100 København Ø', 'Lejlighed', 1923, 87, 3, NULL),
    ('seed-0002', 'Villavej 12, 2800 Kongens Lyngby', 'Enfamiliehus', 1967, 142, 5, 650),
    ('seed-0003', 'Nørrebrogade 88, 2200 København N', 'Lejlighed', 1898, 64, 2, NULL),
    ('seed-0004', 'Strandvejen 201, 2900 Hellerup', 'Enfamiliehus', 1954, 198, 6, 820),
    ('seed-0005', 'Amagerbrogade 33, 2300 København S', 'Rækkehus', 2005, 110, 4, 180);

-- Investeringscases
-- Alle NOT NULL-felter er med — tal er eksempler og ikke realistiske beregninger
INSERT INTO Investeringscase (ejendomsprofil_id, navn, beskrivelse, ejendomspris, omkostninger_koeb, advokat, tinglysning, koeberraadgivning)
VALUES
    (1, 'Østerbro udlejning 2024', 'Udlejning til studerende nær universitetet', 3200000, 50000, 15000, 10000, 20000),
    (1, 'Østerbro korttidsudlejning', 'Airbnb-strategi i højsæson', 3200000, 50000, 15000, 10000, 20000),
    (2, 'Lyngby langsigtet investering', 'Køb og hold i 20 år', 4750000, 75000, 20000, 15000, 25000),
    (3, 'Nørrebro renovering og salg', 'Opkøb, renovering og videresalg', 2800000, 45000, 12000, 9000, 18000),
    (4, 'Hellerup premium udlejning', 'Langtidsudlejning til familier', 7500000, 120000, 30000, 25000, 40000),
    (5, 'Amager rækkehus udlejning', 'Udlejning til par eller småfamilie', 3900000, 60000, 16000, 12000, 22000);

-- Finansiering
-- rente_procent gemmes som decimaltal (0.0425 = 4,25%) — routes dividerer med 100 inden brug i modellen
INSERT INTO Finansiering (investeringscase_id, laanebeloeb, rente_procent, loebetid_aar, afdragsfri_periode_aar, laanetype)
VALUES
    (1, 2560000, 0.0425, 30, 0, 'Realkreditlån'),
    (2, 2560000, 0.0450, 25, 2, 'Realkreditlån'),
    (3, 3800000, 0.0400, 30, 5, 'Realkreditlån'),
    (4, 2240000, 0.0500, 20, 0, 'Banklån'),
    (5, 6000000, 0.0375, 30, 3, 'Realkreditlån'),
    (6, 3120000, 0.0425, 30, 0, 'Realkreditlån');

-- Driftsbudgetter
-- Én per investeringscase — maanedlig_total beregnes i applikationen, ikke her
INSERT INTO Driftsbudget (investeringscase_id, navn, maanedlig_total)
VALUES
    (1, 'Driftsbudget Østerbro udlejning', 4200),
    (2, 'Driftsbudget Østerbro korttid', 5500),
    (3, 'Driftsbudget Lyngby', 3800),
    (4, 'Driftsbudget Nørrebro', 3100),
    (5, 'Driftsbudget Hellerup', 6200),
    (6, 'Driftsbudget Amager', 3600);

-- Driftsomkostninger
-- Individuelle poster under hvert driftsbudget
INSERT INTO Driftsomkostning (driftsbudget_id, beskrivelse, maanedlig_beloeb, kategori)
VALUES
    (1, 'Ejendomsskat', 1200, 'Skat'),
    (1, 'Forsikring', 800, 'Forsikring'),
    (1, 'Vedligehold', 1500, 'Vedligehold'),
    (1, 'Fællesudgifter', 700, 'Fællesudgifter'),
    (2, 'Ejendomsskat', 1200, 'Skat'),
    (2, 'Rengøring', 2000, 'Service'),
    (2, 'Forsikring', 1000, 'Forsikring'),
    (3, 'Ejendomsskat', 1800, 'Skat'),
    (3, 'Vedligehold', 1200, 'Vedligehold'),
    (3, 'Forsikring', 800, 'Forsikring');