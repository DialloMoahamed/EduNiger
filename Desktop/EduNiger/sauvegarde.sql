-- MySQL dump 10.13  Distrib 9.6.0, for macos14.8 (x86_64)
--
-- Host: localhost    Database: gestion_scolaire
-- ------------------------------------------------------
-- Server version	9.6.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `bulletins`
--

DROP TABLE IF EXISTS `bulletins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bulletins` (
  `id` int NOT NULL AUTO_INCREMENT,
  `eleve_id` int NOT NULL,
  `classe_id` int NOT NULL,
  `periode` varchar(20) NOT NULL,
  `moyenne_generale` decimal(5,2) DEFAULT NULL,
  `rang` int DEFAULT NULL,
  `effectif` int DEFAULT NULL,
  `appreciation` text,
  `fichier_pdf` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_bulletin` (`eleve_id`,`periode`),
  KEY `classe_id` (`classe_id`),
  CONSTRAINT `bulletins_ibfk_1` FOREIGN KEY (`eleve_id`) REFERENCES `eleves` (`id`) ON DELETE CASCADE,
  CONSTRAINT `bulletins_ibfk_2` FOREIGN KEY (`classe_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bulletins`
--

LOCK TABLES `bulletins` WRITE;
/*!40000 ALTER TABLE `bulletins` DISABLE KEYS */;
/*!40000 ALTER TABLE `bulletins` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `classes`
--

DROP TABLE IF EXISTS `classes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `classes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nom` varchar(50) NOT NULL,
  `niveau` varchar(50) NOT NULL,
  `annee_scolaire` varchar(20) NOT NULL,
  `enseignant_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `enseignant_id` (`enseignant_id`),
  CONSTRAINT `classes_ibfk_1` FOREIGN KEY (`enseignant_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `classes`
--

LOCK TABLES `classes` WRITE;
/*!40000 ALTER TABLE `classes` DISABLE KEYS */;
INSERT INTO `classes` VALUES (1,'6ème A','Collège','2025-2026',2,'2026-05-25 09:26:23','2026-05-25 09:26:23'),(2,'6ème B','Collège','2025-2026',3,'2026-05-25 09:26:23','2026-05-25 09:26:23'),(3,'CM2 A','Primaire','2025-2026',2,'2026-05-25 09:26:23','2026-05-25 09:26:23'),(4,'5ème A','Collège','2025-2026',3,'2026-05-25 09:26:23','2026-05-25 09:26:23'),(5,'3ème A','Collège','2025-2026',2,'2026-05-25 09:26:23','2026-05-25 09:26:23'),(6,'CP A','Primaire','2025-2026',3,'2026-05-25 09:26:23','2026-05-25 09:26:23');
/*!40000 ALTER TABLE `classes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ecole`
--

DROP TABLE IF EXISTS `ecole`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ecole` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nom` varchar(200) NOT NULL DEFAULT 'Mon École',
  `type_ecole` varchar(100) DEFAULT 'Collège d''Enseignement Général',
  `region` varchar(100) DEFAULT 'Niamey',
  `departement` varchar(100) DEFAULT 'Niamey',
  `inspection` varchar(200) DEFAULT 'Inspection de l''Enseignement Secondaire',
  `adresse` varchar(255) DEFAULT NULL,
  `telephone` varchar(50) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `boite_postale` varchar(50) DEFAULT NULL,
  `devise` varchar(255) DEFAULT 'L''Excellence au service de la Nation',
  `annee_scolaire` varchar(20) DEFAULT '2025-2026',
  `couleur_primaire` varchar(10) DEFAULT '#0A5C36',
  `logo_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ecole`
--

LOCK TABLES `ecole` WRITE;
/*!40000 ALTER TABLE `ecole` DISABLE KEYS */;
INSERT INTO `ecole` VALUES (1,'Etablissement d\'Enseignement Général de Niamey','Lycée d\'Enseignement Général','Niamey','Commune 5','Inspection de l\'Enseignement Secondaire Cycle 1','Karadjè','+227 20 73 XX XX','contact@ceg-niamey.ne',NULL,'L\'Excellence au service de la Nation','2025-2026','#6B3A2A',NULL,'2026-05-25 09:26:23','2026-05-26 08:30:25');
/*!40000 ALTER TABLE `ecole` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `eleves`
--

DROP TABLE IF EXISTS `eleves`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `eleves` (
  `id` int NOT NULL AUTO_INCREMENT,
  `matricule` varchar(20) NOT NULL,
  `nom` varchar(100) NOT NULL,
  `prenom` varchar(100) NOT NULL,
  `date_naissance` date NOT NULL,
  `lieu_naissance` varchar(100) DEFAULT NULL,
  `sexe` enum('M','F') NOT NULL,
  `classe_id` int DEFAULT NULL,
  `nom_parent` varchar(100) DEFAULT NULL,
  `telephone_parent` varchar(20) DEFAULT NULL,
  `adresse` text,
  `photo` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `matricule` (`matricule`),
  KEY `idx_eleves_classe` (`classe_id`),
  KEY `idx_eleves_sexe` (`sexe`),
  CONSTRAINT `eleves_ibfk_1` FOREIGN KEY (`classe_id`) REFERENCES `classes` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `eleves`
--

LOCK TABLES `eleves` WRITE;
/*!40000 ALTER TABLE `eleves` DISABLE KEYS */;
INSERT INTO `eleves` VALUES (1,'2025001','DIALLO','Aissata','2012-05-15','Niamey','F',1,'DIALLO Ibrahim','+227 90 12 34 56','Quartier Lazaret',NULL,'2026-05-25 09:26:23','2026-05-25 09:26:23'),(2,'2025002','SANI','Abdoul','2012-08-22','Maradi','M',1,'SANI Mariama','+227 91 23 45 67','Quartier Yantala',NULL,'2026-05-25 09:26:23','2026-05-25 09:26:23'),(3,'2025003','OUMAROU','Hadiza','2012-03-10','Niamey','F',1,'OUMAROU Ali','+227 92 34 56 78','Quartier Plateau',NULL,'2026-05-25 09:26:23','2026-05-25 09:26:23'),(4,'2025004','MOUSSA','Ousmane','2012-11-05','Dosso','M',1,'MOUSSA Zara','+227 93 45 67 89','Quartier Talladjé',NULL,'2026-05-25 09:26:23','2026-05-25 09:26:23'),(5,'2025005','IBRAHIM','Balkissa','2012-06-18','Niamey','F',2,'IBRAHIM Hamza','+227 94 56 78 90','Quartier Liberté',NULL,'2026-05-25 09:26:23','2026-05-25 09:26:23'),(6,'2025006','ADAMOU','Issoufou','2013-09-12','Zinder','M',2,'ADAMOU Amina','+227 95 67 89 01','Quartier Gamkalley',NULL,'2026-05-25 09:26:23','2026-05-25 09:26:23'),(7,'2025007','GARBA','Ramata','2013-04-25','Niamey','F',2,'GARBA Soumana','+227 96 78 90 12','Quartier Kouara Kano',NULL,'2026-05-25 09:26:23','2026-05-25 09:26:23'),(8,'2025008','MAHAMANE','Ali','2013-07-30','Niamey','M',3,'MAHAMANE Fati','+227 97 89 01 23','Quartier Boukoki',NULL,'2026-05-25 09:26:23','2026-05-25 09:26:23'),(9,'2025009','HASSANE','Mariama','2013-02-14','Agadez','F',3,'HASSANE Boukar','+227 98 90 12 34','Quartier Pays Bas',NULL,'2026-05-25 09:26:23','2026-05-25 09:26:23'),(10,'2025010','YAHAYA','Souleymane','2011-12-01','Tahoua','M',4,'YAHAYA Haoua','+227 90 01 23 45','Quartier Koira Kano',NULL,'2026-05-25 09:26:23','2026-05-25 09:26:23'),(11,'2025011','DAOUDA','Fatouma','2011-08-17','Niamey','F',4,'DAOUDA Issa','+227 91 12 34 56','Quartier Récasement',NULL,'2026-05-25 09:26:23','2026-05-25 09:26:23'),(12,'2025012','ALI','Moustapha','2011-05-09','Maradi','M',4,'ALI Saratou','+227 92 23 45 67','Quartier Saga',NULL,'2026-05-25 09:26:23','2026-05-25 09:26:23'),(13,'2025013','BOUBACAR','Hawa','2009-10-20','Niamey','F',5,'BOUBACAR Seyni','+227 93 34 56 78','Quartier Niamey 2000',NULL,'2026-05-25 09:26:23','2026-05-25 09:26:23'),(14,'2025014','MAMANE','Idrissa','2009-03-11','Dosso','M',5,'MAMANE Binta','+227 94 45 67 89','Quartier Rive Droite',NULL,'2026-05-25 09:26:23','2026-05-25 09:26:23'),(15,'2025015','SAIDOU','Ramatou','2009-07-28','Niamey','F',5,'SAIDOU Hamani','+227 95 56 78 90','Quartier Kalley',NULL,'2026-05-25 09:26:23','2026-05-25 09:26:23'),(16,'2025016','ABDOU','Hamidou','2017-01-15','Niamey','M',6,'ABDOU Rakia','+227 96 67 89 01','Quartier Dar Es Salam',NULL,'2026-05-25 09:26:23','2026-05-25 09:26:23'),(17,'2025017','SOUNNA','Aminatou','2017-06-22','Niamey','F',6,'SOUNNA Lawal','+227 97 78 90 12','Quartier Bandabari',NULL,'2026-05-25 09:26:23','2026-05-25 09:26:23'),(18,'2025018','ISSA','Zakaria','2017-09-05','Zinder','M',6,'ISSA Nana','+227 98 89 01 23','Quartier Goudel',NULL,'2026-05-25 09:26:23','2026-05-25 09:26:23'),(19,'2025019','WADATA','Halimatou','2012-04-18','Niamey','F',1,'WADATA Sabo','+227 90 90 12 34','Quartier Aéroport',NULL,'2026-05-25 09:26:23','2026-05-25 09:26:23'),(20,'2025020','CHAIBOU','Seydou','2012-11-30','Tillabéri','M',1,'CHAIBOU Adama','+227 91 01 23 45','Quartier Château 1',NULL,'2026-05-25 09:26:23','2026-05-25 09:26:23');
/*!40000 ALTER TABLE `eleves` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `matieres`
--

DROP TABLE IF EXISTS `matieres`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `matieres` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) NOT NULL,
  `code` varchar(20) NOT NULL,
  `coefficient` int DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `matieres`
--

LOCK TABLES `matieres` WRITE;
/*!40000 ALTER TABLE `matieres` DISABLE KEYS */;
INSERT INTO `matieres` VALUES (1,'Mathématiques','MATH',4,'2026-05-25 09:26:23'),(2,'Français','FR',3,'2026-05-25 09:26:23'),(3,'Sciences Physiques','PC',3,'2026-05-25 09:26:23'),(4,'SVT','SVT',2,'2026-05-25 09:26:23'),(5,'Histoire-Géographie','HG',2,'2026-05-25 09:26:23'),(6,'Anglais','ANG',2,'2026-05-25 09:26:23'),(7,'EPS','EPS',1,'2026-05-25 09:26:23'),(8,'Arts Plastiques','ART',1,'2026-05-25 09:26:23');
/*!40000 ALTER TABLE `matieres` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notes`
--

DROP TABLE IF EXISTS `notes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `eleve_id` int NOT NULL,
  `matiere_id` int NOT NULL,
  `classe_id` int NOT NULL,
  `type_evaluation` enum('devoir','composition','interrogation') NOT NULL,
  `note` decimal(5,2) NOT NULL,
  `note_sur` decimal(5,2) DEFAULT '20.00',
  `periode` varchar(20) NOT NULL,
  `date_evaluation` date DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `matiere_id` (`matiere_id`),
  KEY `created_by` (`created_by`),
  KEY `idx_notes_eleve` (`eleve_id`),
  KEY `idx_notes_periode` (`periode`),
  KEY `idx_notes_classe` (`classe_id`),
  CONSTRAINT `notes_ibfk_1` FOREIGN KEY (`eleve_id`) REFERENCES `eleves` (`id`) ON DELETE CASCADE,
  CONSTRAINT `notes_ibfk_2` FOREIGN KEY (`matiere_id`) REFERENCES `matieres` (`id`) ON DELETE CASCADE,
  CONSTRAINT `notes_ibfk_3` FOREIGN KEY (`classe_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `notes_ibfk_4` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `notes_chk_1` CHECK (((`note` >= 0) and (`note` <= `note_sur`)))
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notes`
--

LOCK TABLES `notes` WRITE;
/*!40000 ALTER TABLE `notes` DISABLE KEYS */;
INSERT INTO `notes` VALUES (1,1,1,1,'devoir',15.50,20.00,'Trimestre 1','2026-01-15',2,'2026-05-25 09:26:23','2026-05-25 09:26:23'),(2,1,2,1,'devoir',14.00,20.00,'Trimestre 1','2026-01-16',2,'2026-05-25 09:26:23','2026-05-25 09:26:23'),(3,1,3,1,'composition',13.50,20.00,'Trimestre 1','2026-01-20',2,'2026-05-25 09:26:23','2026-05-25 09:26:23'),(4,2,1,1,'devoir',12.50,20.00,'Trimestre 1','2026-01-15',2,'2026-05-25 09:26:23','2026-05-25 09:26:23'),(5,2,2,1,'devoir',16.00,20.00,'Trimestre 1','2026-01-16',2,'2026-05-25 09:26:23','2026-05-25 09:26:23'),(6,2,3,1,'composition',11.00,20.00,'Trimestre 1','2026-01-20',2,'2026-05-25 09:26:23','2026-05-25 09:26:23'),(7,3,1,1,'devoir',13.00,20.00,'Trimestre 1','2026-01-15',2,'2026-05-25 09:26:23','2026-05-25 09:26:23'),(8,3,2,1,'devoir',17.50,20.00,'Trimestre 1','2026-01-16',2,'2026-05-25 09:26:23','2026-05-25 09:26:23'),(9,4,1,1,'devoir',9.00,20.00,'Trimestre 1','2026-01-15',2,'2026-05-25 09:26:23','2026-05-25 09:26:23'),(10,4,2,1,'devoir',11.00,20.00,'Trimestre 1','2026-01-16',2,'2026-05-25 09:26:23','2026-05-25 09:26:23'),(11,19,1,1,'devoir',14.00,20.00,'Trimestre 1','2026-01-15',2,'2026-05-25 09:26:23','2026-05-25 09:26:23'),(12,20,1,1,'devoir',10.50,20.00,'Trimestre 1','2026-01-15',2,'2026-05-25 09:26:23','2026-05-25 09:26:23'),(13,5,1,2,'devoir',18.00,20.00,'Trimestre 1','2026-01-15',3,'2026-05-25 09:26:23','2026-05-25 09:26:23'),(14,5,2,2,'devoir',15.00,20.00,'Trimestre 1','2026-01-16',3,'2026-05-25 09:26:23','2026-05-25 09:26:23'),(15,6,1,2,'devoir',8.50,20.00,'Trimestre 1','2026-01-15',3,'2026-05-25 09:26:23','2026-05-25 09:26:23'),(16,7,1,2,'devoir',13.00,20.00,'Trimestre 1','2026-01-15',3,'2026-05-25 09:26:23','2026-05-25 09:26:23'),(32,12,1,4,'composition',17.00,20.00,'Trimestre 1','2026-05-26',1,'2026-05-26 07:58:26','2026-05-26 07:58:26'),(33,13,1,5,'composition',12.00,20.00,'Trimestre 1','2026-05-26',1,'2026-05-26 08:06:12','2026-05-26 08:06:12'),(34,13,2,5,'composition',13.00,20.00,'Trimestre 1','2026-05-26',1,'2026-05-26 08:21:30','2026-05-26 08:21:30'),(35,13,3,5,'composition',10.00,20.00,'Trimestre 1','2026-05-26',1,'2026-05-26 08:21:49','2026-05-26 08:21:49'),(36,13,4,5,'composition',18.00,20.00,'Trimestre 1','2026-05-26',1,'2026-05-26 08:22:22','2026-05-26 08:22:22'),(37,13,5,5,'composition',16.00,20.00,'Trimestre 1','2026-05-26',1,'2026-05-26 08:22:45','2026-05-26 08:22:45'),(38,13,6,5,'composition',12.00,20.00,'Trimestre 1','2026-05-26',1,'2026-05-26 08:23:30','2026-05-26 08:23:30'),(39,13,7,5,'composition',11.00,20.00,'Trimestre 1','2026-05-26',1,'2026-05-26 08:25:53','2026-05-26 08:25:53');
/*!40000 ALTER TABLE `notes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `telephone` varchar(20) NOT NULL,
  `message` text NOT NULL,
  `type` varchar(50) DEFAULT NULL,
  `statut` enum('en_attente','envoye','echec') DEFAULT 'en_attente',
  `eleve_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `sent_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `eleve_id` (`eleve_id`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`eleve_id`) REFERENCES `eleves` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,'+227 94 45 67 89','Absence de Idrissa MAMANE le 2026-05-25','absence','en_attente',14,'2026-05-25 09:52:51',NULL),(2,'+227 97 89 01 23','Absence de Ali MAHAMANE le 2026-05-25','absence','en_attente',8,'2026-05-25 09:53:47',NULL),(3,'+227 94 45 67 89','Absence de Idrissa MAMANE le 2026-05-26','absence','en_attente',14,'2026-05-26 09:05:40',NULL);
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `presences`
--

DROP TABLE IF EXISTS `presences`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `presences` (
  `id` int NOT NULL AUTO_INCREMENT,
  `eleve_id` int NOT NULL,
  `classe_id` int NOT NULL,
  `date` date NOT NULL,
  `statut` enum('present','absent','retard','absent_justifie') NOT NULL DEFAULT 'present',
  `motif` text,
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_presence` (`eleve_id`,`date`),
  KEY `created_by` (`created_by`),
  KEY `idx_presences_date` (`date`),
  KEY `idx_presences_eleve` (`eleve_id`),
  KEY `idx_presences_classe` (`classe_id`),
  CONSTRAINT `presences_ibfk_1` FOREIGN KEY (`eleve_id`) REFERENCES `eleves` (`id`) ON DELETE CASCADE,
  CONSTRAINT `presences_ibfk_2` FOREIGN KEY (`classe_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `presences_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `presences`
--

LOCK TABLES `presences` WRITE;
/*!40000 ALTER TABLE `presences` DISABLE KEYS */;
INSERT INTO `presences` VALUES (1,1,1,'2026-05-20','present',NULL,2,'2026-05-25 09:26:23'),(2,2,1,'2026-05-20','present',NULL,2,'2026-05-25 09:26:23'),(3,3,1,'2026-05-20','absent',NULL,2,'2026-05-25 09:26:23'),(4,4,1,'2026-05-20','present',NULL,2,'2026-05-25 09:26:23'),(5,19,1,'2026-05-20','retard',NULL,2,'2026-05-25 09:26:23'),(6,20,1,'2026-05-20','present',NULL,2,'2026-05-25 09:26:23'),(7,5,2,'2026-05-20','present',NULL,3,'2026-05-25 09:26:23'),(8,6,2,'2026-05-20','absent_justifie',NULL,3,'2026-05-25 09:26:23'),(9,7,2,'2026-05-20','present',NULL,3,'2026-05-25 09:26:23'),(10,1,1,'2026-05-21','present',NULL,2,'2026-05-25 09:26:23'),(11,2,1,'2026-05-21','present',NULL,2,'2026-05-25 09:26:23'),(12,3,1,'2026-05-21','present',NULL,2,'2026-05-25 09:26:23'),(13,4,1,'2026-05-21','absent',NULL,2,'2026-05-25 09:26:23'),(14,19,1,'2026-05-21','present',NULL,2,'2026-05-25 09:26:23'),(15,20,1,'2026-05-21','present',NULL,2,'2026-05-25 09:26:23'),(16,13,5,'2026-05-25','present',NULL,2,'2026-05-25 09:52:51'),(17,14,5,'2026-05-25','absent',NULL,2,'2026-05-25 09:52:51'),(18,15,5,'2026-05-25','retard',NULL,2,'2026-05-25 09:52:51'),(19,10,4,'2026-05-25','present',NULL,2,'2026-05-25 09:53:04'),(20,11,4,'2026-05-25','present',NULL,2,'2026-05-25 09:53:04'),(21,12,4,'2026-05-25','present',NULL,2,'2026-05-25 09:53:04'),(22,1,1,'2026-05-25','retard',NULL,2,'2026-05-25 09:53:26'),(23,2,1,'2026-05-25','retard',NULL,2,'2026-05-25 09:53:26'),(24,3,1,'2026-05-25','retard',NULL,2,'2026-05-25 09:53:26'),(25,4,1,'2026-05-25','retard',NULL,2,'2026-05-25 09:53:26'),(26,19,1,'2026-05-25','retard',NULL,2,'2026-05-25 09:53:26'),(27,20,1,'2026-05-25','retard',NULL,2,'2026-05-25 09:53:26'),(28,5,2,'2026-05-25','absent_justifie',NULL,2,'2026-05-25 09:53:35'),(29,6,2,'2026-05-25','absent_justifie',NULL,2,'2026-05-25 09:53:35'),(30,7,2,'2026-05-25','absent_justifie',NULL,2,'2026-05-25 09:53:35'),(31,8,3,'2026-05-25','absent',NULL,2,'2026-05-25 09:53:47'),(32,9,3,'2026-05-25','present',NULL,2,'2026-05-25 09:53:47'),(33,16,6,'2026-05-25','present',NULL,2,'2026-05-25 09:54:00'),(34,17,6,'2026-05-25','present',NULL,2,'2026-05-25 09:54:00'),(35,18,6,'2026-05-25','present',NULL,2,'2026-05-25 09:54:00'),(36,13,5,'2026-05-26','present',NULL,1,'2026-05-26 09:05:40'),(37,14,5,'2026-05-26','absent',NULL,1,'2026-05-26 09:05:40'),(38,15,5,'2026-05-26','retard',NULL,1,'2026-05-26 09:05:40');
/*!40000 ALTER TABLE `presences` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) NOT NULL,
  `prenom` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','enseignant') NOT NULL DEFAULT 'enseignant',
  `telephone` varchar(20) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'ADMIN','Système','admin@ecole.com','$2a$10$dOS3vkMcWpOZ1W7SUWN0cut9u0ScVs.joWs7g0EX8afca19YGFV2.','admin','+227 90 00 00 00','2026-05-25 09:26:23','2026-05-25 09:26:23'),(2,'MOUSSA','Amadou','prof@ecole.com','$2a$10$83JsmZqZv9.dixaWMCoKZeaAxmPck7xnL8Z0hMxnWaaQKDq2VHMQ.','enseignant','+227 90 11 11 11','2026-05-25 09:26:23','2026-05-25 09:26:23'),(3,'KANE','Fatima','fatima@ecole.com','$2a$10$83JsmZqZv9.dixaWMCoKZeaAxmPck7xnL8Z0hMxnWaaQKDq2VHMQ.','enseignant','+227 90 22 22 22','2026-05-25 09:26:23','2026-05-25 09:26:23');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-01  9:20:18
