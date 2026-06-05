-- ============================================================
-- EduNiger -- Schema de base de donnees
-- Version 2.0 | Compatible MySQL 8.0+
-- Import : mysql -u root -p --default-character-set=utf8mb4 < schema.sql
-- ============================================================

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET character_set_client = utf8mb4;
SET character_set_results = utf8mb4;
SET character_set_connection = utf8mb4;

CREATE DATABASE IF NOT EXISTS gestion_scolaire
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE gestion_scolaire;

-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
  id          INT PRIMARY KEY AUTO_INCREMENT,
  nom         VARCHAR(100) NOT NULL,
  prenom      VARCHAR(100) NOT NULL,
  email       VARCHAR(150) UNIQUE NOT NULL,
  password    VARCHAR(255) NOT NULL,
  role        ENUM('admin','enseignant') NOT NULL DEFAULT 'enseignant',
  telephone   VARCHAR(20),
  photo       MEDIUMTEXT,
  bio         TEXT,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS classes (
  id             INT PRIMARY KEY AUTO_INCREMENT,
  nom            VARCHAR(50)  NOT NULL,
  niveau         VARCHAR(50)  NOT NULL,
  annee_scolaire VARCHAR(20)  NOT NULL,
  enseignant_id  INT,
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (enseignant_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS eleves (
  id                INT PRIMARY KEY AUTO_INCREMENT,
  matricule         VARCHAR(20) UNIQUE NOT NULL,
  nom               VARCHAR(100) NOT NULL,
  prenom            VARCHAR(100) NOT NULL,
  date_naissance    DATE NOT NULL,
  lieu_naissance    VARCHAR(100),
  sexe              ENUM('M','F') NOT NULL,
  classe_id         INT,
  nom_parent        VARCHAR(100),
  telephone_parent  VARCHAR(20),
  adresse           TEXT,
  photo             VARCHAR(255),
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (classe_id) REFERENCES classes(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS matieres (
  id          INT PRIMARY KEY AUTO_INCREMENT,
  nom         VARCHAR(100) NOT NULL,
  code        VARCHAR(20)  UNIQUE NOT NULL,
  coefficient INT DEFAULT 1,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS presences (
  id          INT PRIMARY KEY AUTO_INCREMENT,
  eleve_id    INT NOT NULL,
  classe_id   INT NOT NULL,
  date        DATE NOT NULL,
  statut      ENUM('present','absent','retard','absent_justifie') NOT NULL DEFAULT 'present',
  motif       TEXT,
  created_by  INT,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (eleve_id)   REFERENCES eleves(id)  ON DELETE CASCADE,
  FOREIGN KEY (classe_id)  REFERENCES classes(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id)   ON DELETE SET NULL,
  UNIQUE KEY unique_presence (eleve_id, date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS notes (
  id               INT PRIMARY KEY AUTO_INCREMENT,
  eleve_id         INT NOT NULL,
  matiere_id       INT NOT NULL,
  classe_id        INT NOT NULL,
  type_evaluation  ENUM('devoir','composition','interrogation') NOT NULL,
  note             DECIMAL(5,2) NOT NULL,
  note_sur         DECIMAL(5,2) DEFAULT 20.00,
  periode          VARCHAR(20)  NOT NULL,
  date_evaluation  DATE,
  created_by       INT,
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (eleve_id)   REFERENCES eleves(id)   ON DELETE CASCADE,
  FOREIGN KEY (matiere_id) REFERENCES matieres(id) ON DELETE CASCADE,
  FOREIGN KEY (classe_id)  REFERENCES classes(id)  ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id)    ON DELETE SET NULL,
  CHECK (note >= 0 AND note <= note_sur)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS notifications (
  id         INT PRIMARY KEY AUTO_INCREMENT,
  telephone  VARCHAR(20) NOT NULL,
  message    TEXT NOT NULL,
  type       VARCHAR(50),
  statut     ENUM('en_attente','envoye','echec') DEFAULT 'en_attente',
  eleve_id   INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  sent_at    TIMESTAMP NULL,
  FOREIGN KEY (eleve_id) REFERENCES eleves(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS bulletins (
  id                INT PRIMARY KEY AUTO_INCREMENT,
  eleve_id          INT NOT NULL,
  classe_id         INT NOT NULL,
  periode           VARCHAR(20) NOT NULL,
  moyenne_generale  DECIMAL(5,2),
  rang              INT,
  effectif          INT,
  appreciation      TEXT,
  fichier_pdf       VARCHAR(255),
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (eleve_id)  REFERENCES eleves(id)  ON DELETE CASCADE,
  FOREIGN KEY (classe_id) REFERENCES classes(id) ON DELETE CASCADE,
  UNIQUE KEY unique_bulletin (eleve_id, periode)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS reset_password_tokens (
  id         INT PRIMARY KEY AUTO_INCREMENT,
  user_id    INT NOT NULL,
  token      VARCHAR(64) UNIQUE NOT NULL,
  expires_at DATETIME NOT NULL,
  used       TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ecole (
  id               INT PRIMARY KEY AUTO_INCREMENT,
  nom              VARCHAR(200) NOT NULL DEFAULT 'Mon Ecole',
  type_ecole       VARCHAR(100) DEFAULT 'College d Enseignement General',
  region           VARCHAR(100) DEFAULT 'Niamey',
  departement      VARCHAR(100) DEFAULT 'Niamey',
  inspection       VARCHAR(200) DEFAULT 'Inspection de l Enseignement Secondaire',
  adresse          VARCHAR(255),
  telephone        VARCHAR(50),
  email            VARCHAR(150),
  boite_postale    VARCHAR(50),
  devise           VARCHAR(255) DEFAULT 'L Excellence au service de la Nation',
  annee_scolaire   VARCHAR(20)  DEFAULT '2025-2026',
  couleur_primaire VARCHAR(10)  DEFAULT '#0A5C36',
  logo_url         VARCHAR(255),
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- INDEX DE PERFORMANCE
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_eleves_classe    ON eleves(classe_id);
CREATE INDEX IF NOT EXISTS idx_eleves_sexe      ON eleves(sexe);
CREATE INDEX IF NOT EXISTS idx_presences_date   ON presences(date);
CREATE INDEX IF NOT EXISTS idx_presences_eleve  ON presences(eleve_id);
CREATE INDEX IF NOT EXISTS idx_presences_classe ON presences(classe_id);
CREATE INDEX IF NOT EXISTS idx_notes_eleve      ON notes(eleve_id);
CREATE INDEX IF NOT EXISTS idx_notes_periode    ON notes(periode);
CREATE INDEX IF NOT EXISTS idx_notes_classe     ON notes(classe_id);
CREATE INDEX IF NOT EXISTS idx_reset_token      ON reset_password_tokens(token);

-- ============================================================
-- DONNEES DE DEMONSTRATION
-- ============================================================

-- Utilisateurs (Admin123! et Prof123!)
INSERT IGNORE INTO users (nom, prenom, email, password, role, telephone) VALUES
('ADMIN',  'Systeme', 'admin@ecole.com', '$2a$10$dOS3vkMcWpOZ1W7SUWN0cut9u0ScVs.joWs7g0EX8afca19YGFV2.', 'admin',      '+227 90 00 00 00'),
('MOUSSA', 'Amadou',  'prof@ecole.com',  '$2a$10$83JsmZqZv9.dixaWMCoKZeaAxmPck7xnL8Z0hMxnWaaQKDq2VHMQ.', 'enseignant', '+227 90 11 11 11'),
('KANE',   'Fatima',  'fatima@ecole.com','$2a$10$83JsmZqZv9.dixaWMCoKZeaAxmPck7xnL8Z0hMxnWaaQKDq2VHMQ.', 'enseignant', '+227 90 22 22 22');

-- Classes
INSERT IGNORE INTO classes (nom, niveau, annee_scolaire, enseignant_id) VALUES
('6eme A',  'College',  '2025-2026', 2),
('6eme B',  'College',  '2025-2026', 3),
('CM2 A',   'Primaire', '2025-2026', 2),
('5eme A',  'College',  '2025-2026', 3),
('3eme A',  'College',  '2025-2026', 2),
('CP A',    'Primaire', '2025-2026', 3);

-- Matieres
INSERT IGNORE INTO matieres (nom, code, coefficient) VALUES
('Mathematiques',      'MATH', 4),
('Francais',           'FR',   3),
('Sciences Physiques', 'PC',   3),
('SVT',                'SVT',  2),
('Histoire-Geographie','HG',   2),
('Anglais',            'ANG',  2),
('EPS',                'EPS',  1),
('Arts Plastiques',    'ART',  1);

-- Eleves
INSERT IGNORE INTO eleves (matricule, nom, prenom, date_naissance, lieu_naissance, sexe, classe_id, nom_parent, telephone_parent, adresse) VALUES
('2025001','DIALLO',   'Aissata',   '2012-05-15','Niamey',    'F',1,'DIALLO Ibrahim',  '+227 90 12 34 56','Quartier Lazaret'),
('2025002','SANI',     'Abdoul',    '2012-08-22','Maradi',    'M',1,'SANI Mariama',    '+227 91 23 45 67','Quartier Yantala'),
('2025003','OUMAROU',  'Hadiza',    '2012-03-10','Niamey',    'F',1,'OUMAROU Ali',     '+227 92 34 56 78','Quartier Plateau'),
('2025004','MOUSSA',   'Ousmane',   '2012-11-05','Dosso',     'M',1,'MOUSSA Zara',     '+227 93 45 67 89','Quartier Tallaje'),
('2025005','IBRAHIM',  'Balkissa',  '2012-06-18','Niamey',    'F',2,'IBRAHIM Hamza',   '+227 94 56 78 90','Quartier Liberte'),
('2025006','ADAMOU',   'Issoufou',  '2013-09-12','Zinder',    'M',2,'ADAMOU Amina',    '+227 95 67 89 01','Quartier Gamkalley'),
('2025007','GARBA',    'Ramata',    '2013-04-25','Niamey',    'F',2,'GARBA Soumana',   '+227 96 78 90 12','Quartier Kouara Kano'),
('2025008','MAHAMANE', 'Ali',       '2013-07-30','Niamey',    'M',3,'MAHAMANE Fati',   '+227 97 89 01 23','Quartier Boukoki'),
('2025009','HASSANE',  'Mariama',   '2013-02-14','Agadez',    'F',3,'HASSANE Boukar',  '+227 98 90 12 34','Quartier Pays Bas'),
('2025010','YAHAYA',   'Souleymane','2011-12-01','Tahoua',    'M',4,'YAHAYA Haoua',    '+227 90 01 23 45','Quartier Koira Kano'),
('2025011','DAOUDA',   'Fatouma',   '2011-08-17','Niamey',    'F',4,'DAOUDA Issa',     '+227 91 12 34 56','Quartier Recasement'),
('2025012','ALI',      'Moustapha', '2011-05-09','Maradi',    'M',4,'ALI Saratou',     '+227 92 23 45 67','Quartier Saga'),
('2025013','BOUBACAR', 'Hawa',      '2009-10-20','Niamey',    'F',5,'BOUBACAR Seyni',  '+227 93 34 56 78','Quartier Niamey 2000'),
('2025014','MAMANE',   'Idrissa',   '2009-03-11','Dosso',     'M',5,'MAMANE Binta',    '+227 94 45 67 89','Quartier Rive Droite'),
('2025015','SAIDOU',   'Ramatou',   '2009-07-28','Niamey',    'F',5,'SAIDOU Hamani',   '+227 95 56 78 90','Quartier Kalley'),
('2025016','ABDOU',    'Hamidou',   '2017-01-15','Niamey',    'M',6,'ABDOU Rakia',     '+227 96 67 89 01','Quartier Dar Es Salam'),
('2025017','SOUNNA',   'Aminatou',  '2017-06-22','Niamey',    'F',6,'SOUNNA Lawal',    '+227 97 78 90 12','Quartier Bandabari'),
('2025018','ISSA',     'Zakaria',   '2017-09-05','Zinder',    'M',6,'ISSA Nana',       '+227 98 89 01 23','Quartier Goudel'),
('2025019','WADATA',   'Halimatou', '2012-04-18','Niamey',    'F',1,'WADATA Sabo',     '+227 90 90 12 34','Quartier Aeroport'),
('2025020','CHAIBOU',  'Seydou',    '2012-11-30','Tillaberi', 'M',1,'CHAIBOU Adama',   '+227 91 01 23 45','Quartier Chateau 1');

-- Presences
INSERT IGNORE INTO presences (eleve_id, classe_id, date, statut, created_by) VALUES
(1,1,'2026-05-20','present',2),(2,1,'2026-05-20','present',2),(3,1,'2026-05-20','absent',2),
(4,1,'2026-05-20','present',2),(19,1,'2026-05-20','retard',2),(20,1,'2026-05-20','present',2),
(5,2,'2026-05-20','present',3),(6,2,'2026-05-20','absent_justifie',3),(7,2,'2026-05-20','present',3),
(1,1,'2026-05-21','present',2),(2,1,'2026-05-21','present',2),(3,1,'2026-05-21','present',2),
(4,1,'2026-05-21','absent',2),(19,1,'2026-05-21','present',2),(20,1,'2026-05-21','present',2);

-- Notes Trimestre 1
INSERT IGNORE INTO notes (eleve_id, matiere_id, classe_id, type_evaluation, note, note_sur, periode, date_evaluation, created_by) VALUES
(1,1,1,'devoir',15.50,20,'Trimestre 1','2026-01-15',2),
(1,2,1,'devoir',14.00,20,'Trimestre 1','2026-01-16',2),
(1,3,1,'composition',13.50,20,'Trimestre 1','2026-01-20',2),
(2,1,1,'devoir',12.50,20,'Trimestre 1','2026-01-15',2),
(2,2,1,'devoir',16.00,20,'Trimestre 1','2026-01-16',2),
(3,1,1,'devoir',13.00,20,'Trimestre 1','2026-01-15',2),
(3,2,1,'devoir',17.50,20,'Trimestre 1','2026-01-16',2),
(4,1,1,'devoir',9.00,20,'Trimestre 1','2026-01-15',2),
(5,1,2,'devoir',18.00,20,'Trimestre 1','2026-01-15',3),
(5,2,2,'devoir',15.00,20,'Trimestre 1','2026-01-16',3),
(6,1,2,'devoir',8.50,20,'Trimestre 1','2026-01-15',3),
(7,1,2,'devoir',13.00,20,'Trimestre 1','2026-01-15',3);

-- Profil ecole par defaut
INSERT IGNORE INTO ecole (nom, type_ecole, region, departement, inspection, telephone, email, devise, annee_scolaire)
VALUES (
  'College d Enseignement General de Niamey',
  'College d Enseignement General',
  'Niamey', 'Niamey',
  'Inspection de l Enseignement Secondaire Cycle 1',
  '+227 20 73 00 00',
  'contact@ceg-niamey.ne',
  'L Excellence au service de la Nation',
  '2025-2026'
);