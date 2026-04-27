-- Slet tabeller hvis de eksisterer (til genkørsel)
DROP TABLE IF EXISTS Koebsomkostning;
DROP TABLE IF EXISTS Driftsomkostning;
DROP TABLE IF EXISTS Driftsbudget;
DROP TABLE IF EXISTS Finansiering;
DROP TABLE IF EXISTS Investeringscase;
DROP TABLE IF EXISTS Ejendomsprofil;

-- Ejendomsprofil
CREATE TABLE Ejendomsprofil (
    ejendomsprofil_id   INT           PRIMARY KEY IDENTITY(1,1),
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
CREATE TABLE Investeringscase (
    investeringscase_id  INT            PRIMARY KEY IDENTITY(1,1),
    ejendomsprofil_id    INT            NOT NULL,
    navn                 VARCHAR(255)   NOT NULL UNIQUE,
    beskrivelse          VARCHAR(1000),
    ejendomspris          DECIMAL(15,2)  NOT NULL,
    omkostninger_koeb     DECIMAL(15,2)  NOT NULL,
    advokat               DECIMAL(15,2)  NOT NULL,
    tinglysning           DECIMAL(15,2)  NOT NULL,
    koeberraadgivning     DECIMAL(15,2)  NOT NULL,
    oprettet_dato        DATETIME       NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (ejendomsprofil_id) REFERENCES Ejendomsprofil(ejendomsprofil_id)
);

-- Ekstra udgifterne til investeringscase (3.1)
CREATE TABLE Koebsomkostning (
    koebsomkostning_id   INT           PRIMARY KEY IDENTITY(1,1),
    investeringscase_id  INT           NOT NULL,
    beskrivelse          VARCHAR(255)  NOT NULL,
    beloeb               DECIMAL(15,2) NOT NULL,
    FOREIGN KEY (investeringscase_id) REFERENCES Investeringscase(investeringscase_id)
);

-- Finansiering
CREATE TABLE Finansiering (
    finansiering_id       INT           PRIMARY KEY IDENTITY(1,1),
    investeringscase_id   INT           NOT NULL,
    laanebeloeb           DECIMAL(15,2) NOT NULL,
    rente_procent         DECIMAL(5,4)  NOT NULL,
    loebetid_aar          INT           NOT NULL,
    afdragsfri_periode_aar INT          NOT NULL DEFAULT 0,
    laanetype             VARCHAR(100),
    FOREIGN KEY (investeringscase_id) REFERENCES Investeringscase(investeringscase_id)
);

-- Driftsbudget
CREATE TABLE Driftsbudget (
    driftsbudget_id      INT           PRIMARY KEY IDENTITY(1,1),
    investeringscase_id  INT           NOT NULL,
    navn                 VARCHAR(255),
    maanedlig_total      DECIMAL(15,2),
    FOREIGN KEY (investeringscase_id) REFERENCES Investeringscase(investeringscase_id)
);

-- Driftsomkostning
CREATE TABLE Driftsomkostning (
    driftsomkostning_id  INT           PRIMARY KEY IDENTITY(1,1),
    driftsbudget_id      INT           NOT NULL,
    beskrivelse          VARCHAR(255),
    maanedlig_beloeb     DECIMAL(15,2) NOT NULL,
    kategori             VARCHAR(100),
    FOREIGN KEY (driftsbudget_id) REFERENCES Driftsbudget(driftsbudget_id)
);