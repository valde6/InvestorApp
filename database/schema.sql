-- Slet tabeller hvis de eksisterer (til genkørsel)
-- Rækkefølgen er vigtig — child-tabeller skal droppes før parent-tabeller
DROP TABLE IF EXISTS Udlejning;
DROP TABLE IF EXISTS Koebsomkostning;
DROP TABLE IF EXISTS Renovering;
DROP TABLE IF EXISTS Driftsomkostning;
DROP TABLE IF EXISTS Driftsbudget;
DROP TABLE IF EXISTS Finansiering;
DROP TABLE IF EXISTS Investeringscase;
DROP TABLE IF EXISTS Ejendomsprofil;

-- Ejendomsprofil
-- adresse_id er DAWA's unikke ID for adressen — bruges til BBR-opslag og duplikat-tjek
CREATE TABLE Ejendomsprofil (
    ejendomsprofil_id   INT           PRIMARY KEY IDENTITY(1,1),
    adresse_id          VARCHAR(50)   NOT NULL UNIQUE,
    adresse             VARCHAR(255)  NOT NULL,
    ejendomstype        VARCHAR(100)  NOT NULL,
    byggeaar            INT,
    boligareal_m2       INT,
    antal_vaerelser     INT,
    grundareal_m2       INT,
    oprettet_dato       DATETIME      NOT NULL DEFAULT GETDATE(),
    sidst_opdateret     DATETIME      NOT NULL DEFAULT GETDATE()
);

-- Investeringscase
-- oprettet_dato bruges på forsiden til at sortere og vise metadata
-- ON DELETE CASCADE sletter automatisk alle tilknyttede data når profilen slettes
CREATE TABLE Investeringscase (
    investeringscase_id  INT            PRIMARY KEY IDENTITY(1,1),
    ejendomsprofil_id    INT            NOT NULL,
    navn                 VARCHAR(255)   NOT NULL,
    beskrivelse          VARCHAR(1000),
    ejendomspris         DECIMAL(15,2)  NOT NULL,
    omkostninger_koeb    DECIMAL(15,2)  NOT NULL DEFAULT 0,
    advokat              DECIMAL(15,2)  NOT NULL DEFAULT 0,
    tinglysning          DECIMAL(15,2)  NOT NULL DEFAULT 0,
    koeberraadgivning    DECIMAL(15,2)  NOT NULL DEFAULT 0,
    oprettet_dato        DATETIME       NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (ejendomsprofil_id) REFERENCES Ejendomsprofil(ejendomsprofil_id) ON DELETE CASCADE
);

-- Koebsomkostning
-- Variable ekstraomkostninger brugeren selv tilføjer i trin 3.1
CREATE TABLE Koebsomkostning (
    koebsomkostning_id   INT           PRIMARY KEY IDENTITY(1,1),
    investeringscase_id  INT           NOT NULL,
    beskrivelse          VARCHAR(255)  NOT NULL,
    beloeb               DECIMAL(15,2) NOT NULL,
    FOREIGN KEY (investeringscase_id) REFERENCES Investeringscase(investeringscase_id) ON DELETE CASCADE
);

-- Renovering
-- Engangsudgifter på et bestemt tidspunkt — bruges i simuleringsmodellen
CREATE TABLE Renovering (
    renovering_id        INT           PRIMARY KEY IDENTITY(1,1),
    investeringscase_id  INT           NOT NULL,
    beskrivelse          VARCHAR(255)  NOT NULL,
    beloeb               DECIMAL(15,2) NOT NULL,
    tidspunkt            DATE          NOT NULL,
    FOREIGN KEY (investeringscase_id) REFERENCES Investeringscase(investeringscase_id) ON DELETE CASCADE
);

-- Finansiering
-- Et lån per investeringscase — bruges til annuitetsberegning i Finansiering-klassen
CREATE TABLE Finansiering (
    finansiering_id        INT           PRIMARY KEY IDENTITY(1,1),
    investeringscase_id    INT           NOT NULL,
    laanebeloeb            DECIMAL(15,2) NOT NULL,
    rente_procent          DECIMAL(8,4)  NOT NULL,
    loebetid_aar           INT           NOT NULL,
    afdragsfri_periode_aar INT           NOT NULL DEFAULT 0,
    laanetype              VARCHAR(100),
    FOREIGN KEY (investeringscase_id) REFERENCES Investeringscase(investeringscase_id) ON DELETE CASCADE
);

-- Driftsbudget
-- Container for driftsomkostninger — én per investeringscase
CREATE TABLE Driftsbudget (
    driftsbudget_id      INT           PRIMARY KEY IDENTITY(1,1),
    investeringscase_id  INT           NOT NULL,
    navn                 VARCHAR(255),
    maanedlig_total      DECIMAL(15,2),
    FOREIGN KEY (investeringscase_id) REFERENCES Investeringscase(investeringscase_id) ON DELETE CASCADE
);

-- Driftsomkostning
-- Individuelle udgiftsposter under et driftsbudget
CREATE TABLE Driftsomkostning (
    driftsomkostning_id  INT           PRIMARY KEY IDENTITY(1,1),
    driftsbudget_id      INT           NOT NULL,
    beskrivelse          VARCHAR(255),
    maanedlig_beloeb     DECIMAL(15,2) NOT NULL,
    kategori             VARCHAR(100),
    FOREIGN KEY (driftsbudget_id) REFERENCES Driftsbudget(driftsbudget_id) ON DELETE CASCADE
);

-- Udlejning
-- Lejeindtægter og -udgifter per investeringscase
CREATE TABLE Udlejning (
    udlejning_id         INT           PRIMARY KEY IDENTITY(1,1),
    investeringscase_id  INT           NOT NULL,
    maanedlig_leje       DECIMAL(15,2) NOT NULL,
    udlejningsomkostning DECIMAL(15,2) NOT NULL DEFAULT 0,
    beskrivelse          VARCHAR(255),
    FOREIGN KEY (investeringscase_id) REFERENCES Investeringscase(investeringscase_id) ON DELETE CASCADE
);