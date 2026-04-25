-- Forespørgsel 1: Vis alle ejendomsprofiler med adresse og oprettelsesdato, nyeste først
SELECT ejendomsprofil_id, adresse, oprettet_dato
FROM Ejendomsprofil
ORDER BY oprettet_dato DESC;

-- Forespørgsel 2: Vis alle investeringscases med tilhørende ejendomsadresse
SELECT ep.adresse, ic.navn, ic.ejendomspris
FROM Ejendomsprofil ep
INNER JOIN Investeringscase ic ON ep.ejendomsprofil_id = ic.ejendomsprofil_id;

-- Forespørgsel 3: Vis alle ejendomsprofiler og hvor mange investeringscases de har
SELECT ep.ejendomsprofil_id, ep.adresse, COUNT(*) AS antal_cases
FROM Ejendomsprofil ep
LEFT JOIN Investeringscase ic ON ep.ejendomsprofil_id = ic.ejendomsprofil_id
GROUP BY ep.ejendomsprofil_id, ep.adresse;

-- Forespørgsel 4 (UI-handling): Vis alle investeringscases for en specifik ejendomsprofil
SELECT ic.investeringscase_id, ic.navn, ic.beskrivelse, ic.ejendomspris
FROM Investeringscase ic
WHERE ic.ejendomsprofil_id = 1;

-- Forespørgsel 5: Find ejendomsprofiler som endnu ikke har nogen investeringscases
SELECT ep.ejendomsprofil_id, ep.adresse
FROM Ejendomsprofil ep
LEFT JOIN Investeringscase ic ON ep.ejendomsprofil_id = ic.ejendomsprofil_id
WHERE ic.investeringscase_id IS NULL;

-- Forespørgsel 6: Find eventuelle dubletter i investeringscase-navne
SELECT navn, COUNT(*) AS antal
FROM Investeringscase
GROUP BY navn
HAVING COUNT(*) > 1;

-- Forespørgsel 7: For hver ejendomsprofil, find navn på den senest oprettede investeringscase
SELECT ep.adresse, ic.navn, ic.oprettet_dato
FROM Ejendomsprofil ep
INNER JOIN Investeringscase ic ON ep.ejendomsprofil_id = ic.ejendomsprofil_id
WHERE ic.oprettet_dato = (
    SELECT MAX(ic2.oprettet_dato)
    FROM Investeringscase ic2
    WHERE ic2.ejendomsprofil_id = ep.ejendomsprofil_id
);