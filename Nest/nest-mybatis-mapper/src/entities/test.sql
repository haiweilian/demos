/*
 Navicat Premium Data Transfer

 Source Server         : 127.0.0.1
 Source Server Type    : MySQL
 Source Server Version : 80027
 Source Host           : localhost:3306
 Source Schema         : test

 Target Server Type    : MySQL
 Target Server Version : 80027
 File Encoding         : 65001

 Date: 21/12/2023 13:22:51
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for score
-- ----------------------------
DROP TABLE IF EXISTS `score`;
CREATE TABLE `score` (
  `id` int NOT NULL AUTO_INCREMENT,
  `studentId` int NOT NULL,
  `subjectId` int NOT NULL,
  `score` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of score
-- ----------------------------
BEGIN;
INSERT INTO `score` VALUES (1, 1, 1, 78);
INSERT INTO `score` VALUES (2, 1, 2, 97);
INSERT INTO `score` VALUES (3, 1, 3, 68);
INSERT INTO `score` VALUES (4, 2, 1, 92);
INSERT INTO `score` VALUES (5, 2, 2, 81);
INSERT INTO `score` VALUES (6, 2, 3, 72);
INSERT INTO `score` VALUES (7, 3, 1, 85);
INSERT INTO `score` VALUES (8, 3, 2, 79);
INSERT INTO `score` VALUES (9, 3, 3, 96);
COMMIT;

-- ----------------------------
-- Table structure for student
-- ----------------------------
DROP TABLE IF EXISTS `student`;
CREATE TABLE `student` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of student
-- ----------------------------
BEGIN;
INSERT INTO `student` VALUES (1, '小红');
INSERT INTO `student` VALUES (2, '小黄');
INSERT INTO `student` VALUES (3, '小绿');
COMMIT;

-- ----------------------------
-- Table structure for subject
-- ----------------------------
DROP TABLE IF EXISTS `subject`;
CREATE TABLE `subject` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of subject
-- ----------------------------
BEGIN;
INSERT INTO `subject` VALUES (1, '语文');
INSERT INTO `subject` VALUES (2, '数学');
INSERT INTO `subject` VALUES (3, '英语');
COMMIT;

SET FOREIGN_KEY_CHECKS = 1;
