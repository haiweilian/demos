/*
 Navicat Premium Data Transfer

 Source Server         : nest
 Source Server Type    : MySQL
 Source Server Version : 80300 (8.3.0)
 Source Host           : localhost:3306
 Source Schema         : test_sqldeep

 Target Server Type    : MySQL
 Target Server Version : 80300 (8.3.0)
 File Encoding         : 65001

 Date: 11/10/2024 16:06:12
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for index_users
-- ----------------------------
DROP TABLE IF EXISTS `index_users`;
CREATE TABLE `index_users` (
  `user_id` int NOT NULL,
  `user_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_sex` char(1) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `register_time` datetime DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  KEY `unite_index` (`user_name`,`user_sex`,`password`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of index_users
-- ----------------------------
BEGIN;
INSERT INTO `index_users` (`user_id`, `user_name`, `user_sex`, `password`, `register_time`) VALUES (1, '熊猫', '女', '6666', '2022-08-14 15:22:01');
INSERT INTO `index_users` (`user_id`, `user_name`, `user_sex`, `password`, `register_time`) VALUES (2, '竹子', '男', '1234', '2022-09-14 16:17:44');
INSERT INTO `index_users` (`user_id`, `user_name`, `user_sex`, `password`, `register_time`) VALUES (3, '子竹', '男', '4321', '2022-09-16 07:42:21');
COMMIT;

-- ----------------------------
-- Table structure for zz_account
-- ----------------------------
DROP TABLE IF EXISTS `zz_account`;
CREATE TABLE `zz_account` (
  `user_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `balance` decimal(20,2) NOT NULL,
  PRIMARY KEY (`user_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of zz_account
-- ----------------------------
BEGIN;
INSERT INTO `zz_account` (`user_name`, `balance`) VALUES ('熊猫', 6666666.00);
INSERT INTO `zz_account` (`user_name`, `balance`) VALUES ('竹子', 8888888.00);
COMMIT;

-- ----------------------------
-- Table structure for zz_users
-- ----------------------------
DROP TABLE IF EXISTS `zz_users`;
CREATE TABLE `zz_users` (
  `user_id` int NOT NULL,
  `user_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_sex` char(2) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `register_time` datetime DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  KEY `unite_index` (`user_name`,`user_sex`,`password`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of zz_users
-- ----------------------------
BEGIN;
INSERT INTO `zz_users` (`user_id`, `user_name`, `user_sex`, `password`, `register_time`) VALUES (1, '熊猫1', '女', '6666', '2022-08-14 15:22:01');
INSERT INTO `zz_users` (`user_id`, `user_name`, `user_sex`, `password`, `register_time`) VALUES (2, '竹子', '男', '1234', '2022-09-14 16:17:44');
INSERT INTO `zz_users` (`user_id`, `user_name`, `user_sex`, `password`, `register_time`) VALUES (3, '子竹', '男', '4321', '2022-09-16 07:42:21');
INSERT INTO `zz_users` (`user_id`, `user_name`, `user_sex`, `password`, `register_time`) VALUES (4, '黑熊', '男', '8888', '2024-09-16 07:42:21');
INSERT INTO `zz_users` (`user_id`, `user_name`, `user_sex`, `password`, `register_time`) VALUES (8, '88', '男', '8888', '2024-09-16 07:42:21');
COMMIT;

-- ----------------------------
-- Table structure for zz_users_copy1
-- ----------------------------
DROP TABLE IF EXISTS `zz_users_copy1`;
CREATE TABLE `zz_users_copy1` (
  `user_id` int NOT NULL,
  `user_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_sex` char(2) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `register_time` datetime DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  KEY `unite_index` (`user_name`,`user_sex`,`password`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of zz_users_copy1
-- ----------------------------
BEGIN;
INSERT INTO `zz_users_copy1` (`user_id`, `user_name`, `user_sex`, `password`, `register_time`) VALUES (1, '熊猫', '女', '6666', '2022-08-14 15:22:01');
INSERT INTO `zz_users_copy1` (`user_id`, `user_name`, `user_sex`, `password`, `register_time`) VALUES (2, '竹子', '男', '1234', '2022-09-14 16:17:44');
INSERT INTO `zz_users_copy1` (`user_id`, `user_name`, `user_sex`, `password`, `register_time`) VALUES (3, '子竹', '男', '4321', '2022-09-16 07:42:21');
INSERT INTO `zz_users_copy1` (`user_id`, `user_name`, `user_sex`, `password`, `register_time`) VALUES (4, '1111', '男', '8888', '2024-09-16 07:42:21');
COMMIT;

SET FOREIGN_KEY_CHECKS = 1;
