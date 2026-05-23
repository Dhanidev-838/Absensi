-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               5.7.33 - MySQL Community Server (GPL)
-- Server OS:                    Win64
-- HeidiSQL Version:             11.2.0.6213
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumping database structure for absensi_db
DROP DATABASE IF EXISTS `absensi_db`;
CREATE DATABASE IF NOT EXISTS `absensi_db` /*!40100 DEFAULT CHARACTER SET latin1 */;
USE `absensi_db`;

-- Dumping structure for table absensi_db.absen
DROP TABLE IF EXISTS `absen`;
CREATE TABLE IF NOT EXISTS `absen` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `tanggal` date NOT NULL,
  `status` enum('hadir','izin','sakit','alpha','dispen') NOT NULL,
  `keterangan` text,
  `acc_status` enum('pending','diterima','ditolak') DEFAULT 'pending',
  `approved_by` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `foto` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `approved_by` (`approved_by`),
  CONSTRAINT `absen_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `absen_ibfk_2` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=latin1;

-- Dumping data for table absensi_db.absen: ~1 rows (approximately)
/*!40000 ALTER TABLE `absen` DISABLE KEYS */;
INSERT INTO `absen` (`id`, `user_id`, `tanggal`, `status`, `keterangan`, `acc_status`, `approved_by`, `created_at`, `foto`) VALUES
	(9, 13, '2026-05-23', 'alpha', NULL, 'pending', NULL, '2026-05-23 11:16:41', NULL);
/*!40000 ALTER TABLE `absen` ENABLE KEYS */;

-- Dumping structure for table absensi_db.dispensasi
DROP TABLE IF EXISTS `dispensasi`;
CREATE TABLE IF NOT EXISTS `dispensasi` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `tanggal` date NOT NULL,
  `alasan` text NOT NULL,
  `acc_status` enum('pending','diterima','ditolak') DEFAULT 'pending',
  `approved_by` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `approved_by` (`approved_by`),
  CONSTRAINT `dispensasi_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `dispensasi_ibfk_2` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- Dumping data for table absensi_db.dispensasi: ~0 rows (approximately)
/*!40000 ALTER TABLE `dispensasi` DISABLE KEYS */;
/*!40000 ALTER TABLE `dispensasi` ENABLE KEYS */;

-- Dumping structure for table absensi_db.komentar_laporan
DROP TABLE IF EXISTS `komentar_laporan`;
CREATE TABLE IF NOT EXISTS `komentar_laporan` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `laporan_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `isi` text NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `laporan_id` (`laporan_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `komentar_laporan_ibfk_1` FOREIGN KEY (`laporan_id`) REFERENCES `laporan_masalah` (`id`),
  CONSTRAINT `komentar_laporan_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- Dumping data for table absensi_db.komentar_laporan: ~0 rows (approximately)
/*!40000 ALTER TABLE `komentar_laporan` DISABLE KEYS */;
/*!40000 ALTER TABLE `komentar_laporan` ENABLE KEYS */;

-- Dumping structure for table absensi_db.laporan_bk
DROP TABLE IF EXISTS `laporan_bk`;
CREATE TABLE IF NOT EXISTS `laporan_bk` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tipe` enum('absen','dispensasi','masalah') NOT NULL,
  `ref_id` int(11) NOT NULL,
  `diterima_oleh` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('pending','diterima','ditolak') DEFAULT 'pending',
  PRIMARY KEY (`id`),
  KEY `diterima_oleh` (`diterima_oleh`),
  CONSTRAINT `laporan_bk_ibfk_1` FOREIGN KEY (`diterima_oleh`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1;

-- Dumping data for table absensi_db.laporan_bk: ~1 rows (approximately)
/*!40000 ALTER TABLE `laporan_bk` DISABLE KEYS */;
INSERT INTO `laporan_bk` (`id`, `tipe`, `ref_id`, `diterima_oleh`, `created_at`, `status`) VALUES
	(4, 'absen', 7, 14, '2026-05-21 07:54:04', 'diterima');
/*!40000 ALTER TABLE `laporan_bk` ENABLE KEYS */;

-- Dumping structure for table absensi_db.laporan_masalah
DROP TABLE IF EXISTS `laporan_masalah`;
CREATE TABLE IF NOT EXISTS `laporan_masalah` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `judul` varchar(200) NOT NULL,
  `komentar` text NOT NULL,
  `status` enum('pending','diproses','ditolak') DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `laporan_masalah_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- Dumping data for table absensi_db.laporan_masalah: ~0 rows (approximately)
/*!40000 ALTER TABLE `laporan_masalah` DISABLE KEYS */;
/*!40000 ALTER TABLE `laporan_masalah` ENABLE KEYS */;

-- Dumping structure for table absensi_db.users
DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nama` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('siswa','guru','bk','admin') NOT NULL,
  `kelas` varchar(20) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=latin1;

-- Dumping data for table absensi_db.users: ~6 rows (approximately)
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` (`id`, `nama`, `email`, `password`, `role`, `kelas`, `created_at`) VALUES
	(9, 'Admin', 'admin@sekolah.com', '$2b$10$4L76wiDADw8z6z.UPePCle3MGBIpvg0jtiw2Xczw6xSKq4AMzDJB6', 'admin', NULL, '2026-05-12 17:37:21'),
	(13, 'Dhani', 'dhani@gmail.com', '$2b$10$yXp1QJ0TBfxn2wJk1RLLN.rAPFx/WswjsbackgEhuyKkV3X1sem26', 'siswa', '11 PPLG 2', '2026-05-19 12:50:19'),
	(14, 'dira', 'dira@gmail.com', '$2b$10$0YKf0nQi4JIOxlpYHexvrey8Kxwc80hzeUZAX2VfzX8O6Ge7qWfb2', 'guru', '11 PPLG 2', '2026-05-19 13:05:38'),
	(15, 'aa', 'aa@gmail.com', '$2b$10$HpTtK.5sOLnmdbI9TF8Qi.T9xl7QOFS04YuwhirBYhSZDMhs8XM/W', 'siswa', '10 DKV PLUS', '2026-05-19 13:21:43'),
	(16, 'Saputra', 'saputra@gmail.com', '$2b$10$u80shxM6Sq6.TbqG5B//R.5RfL6Hnz9qZtKwKBShaDoHG3aw/WhZO', 'bk', NULL, '2026-05-19 13:25:57'),
	(17, 'diana', 'diana@gmail.com', '$2b$10$N2/Gnz8ZVGdXLJlEh4yZW.peZ5gSh8FFS0lTQANBloUXl9vGGiQrG', 'siswa', '10 PEMASARAN 1', '2026-05-19 19:34:50');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
