/*
 Navicat Premium Data Transfer

 Source Server         : nest
 Source Server Type    : MySQL
 Source Server Version : 80300 (8.3.0)
 Source Host           : localhost:3306
 Source Schema         : test_datascope

 Target Server Type    : MySQL
 Target Server Version : 80300 (8.3.0)
 File Encoding         : 65001

 Date: 01/09/2024 15:37:25
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for dept
-- ----------------------------
DROP TABLE IF EXISTS `dept`;
CREATE TABLE `dept` (
  `dept_id` bigint NOT NULL AUTO_INCREMENT COMMENT '部门ID',
  `parent_id` bigint NOT NULL DEFAULT '0' COMMENT '父部门ID',
  `ancestors` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '0' COMMENT '祖级列表',
  `dept_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '部门名称',
  PRIMARY KEY (`dept_id`)
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of dept
-- ----------------------------
BEGIN;
INSERT INTO `dept` (`dept_id`, `parent_id`, `ancestors`, `dept_name`) VALUES (1, 0, '0', '总公司');
INSERT INTO `dept` (`dept_id`, `parent_id`, `ancestors`, `dept_name`) VALUES (2, 1, '0,1', '北京分公司');
INSERT INTO `dept` (`dept_id`, `parent_id`, `ancestors`, `dept_name`) VALUES (3, 1, '0,1', '上海分公司');
INSERT INTO `dept` (`dept_id`, `parent_id`, `ancestors`, `dept_name`) VALUES (20, 2, '0,1,2', '人事部门');
INSERT INTO `dept` (`dept_id`, `parent_id`, `ancestors`, `dept_name`) VALUES (21, 2, '0,1,2', '财务部门');
INSERT INTO `dept` (`dept_id`, `parent_id`, `ancestors`, `dept_name`) VALUES (30, 3, '0,1,3', '人事部门');
INSERT INTO `dept` (`dept_id`, `parent_id`, `ancestors`, `dept_name`) VALUES (31, 3, '0,1,3', '财务部门');
COMMIT;

-- ----------------------------
-- Table structure for role
-- ----------------------------
DROP TABLE IF EXISTS `role`;
CREATE TABLE `role` (
  `role_id` bigint NOT NULL AUTO_INCREMENT COMMENT '角色ID',
  `role_code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '角色编码',
  `data_scope` char(1) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '1' COMMENT '数据范围',
  PRIMARY KEY (`role_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of role
-- ----------------------------
BEGIN;
INSERT INTO `role` (`role_id`, `role_code`, `data_scope`) VALUES (1, 'admin', '1');
INSERT INTO `role` (`role_id`, `role_code`, `data_scope`) VALUES (2, 'manager', '2');
INSERT INTO `role` (`role_id`, `role_code`, `data_scope`) VALUES (3, 'common', '5');
COMMIT;

-- ----------------------------
-- Table structure for role_dept
-- ----------------------------
DROP TABLE IF EXISTS `role_dept`;
CREATE TABLE `role_dept` (
  `role_id` bigint NOT NULL COMMENT '用户ID',
  `dept_id` bigint NOT NULL COMMENT '部门ID',
  PRIMARY KEY (`role_id`,`dept_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of role_dept
-- ----------------------------
BEGIN;
INSERT INTO `role_dept` (`role_id`, `dept_id`) VALUES (2, 20);
INSERT INTO `role_dept` (`role_id`, `dept_id`) VALUES (2, 30);
COMMIT;

-- ----------------------------
-- Table structure for user
-- ----------------------------
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `user_id` bigint NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `dept_id` bigint DEFAULT NULL COMMENT '部门ID',
  `user_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '用户账号',
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `IDX_9d0ba62d30b6362c5651c6c261` (`user_name`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of user
-- ----------------------------
BEGIN;
INSERT INTO `user` (`user_id`, `dept_id`, `user_name`) VALUES (1, 0, '管理员');
INSERT INTO `user` (`user_id`, `dept_id`, `user_name`) VALUES (2, 2, '经理');
INSERT INTO `user` (`user_id`, `dept_id`, `user_name`) VALUES (3, 20, '员工1');
INSERT INTO `user` (`user_id`, `dept_id`, `user_name`) VALUES (4, 30, '员工2');
COMMIT;

-- ----------------------------
-- Table structure for user_role
-- ----------------------------
DROP TABLE IF EXISTS `user_role`;
CREATE TABLE `user_role` (
  `user_id` bigint NOT NULL COMMENT '用户ID',
  `role_id` bigint NOT NULL COMMENT '角色ID',
  PRIMARY KEY (`user_id`,`role_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of user_role
-- ----------------------------
BEGIN;
INSERT INTO `user_role` (`user_id`, `role_id`) VALUES (1, 1);
INSERT INTO `user_role` (`user_id`, `role_id`) VALUES (2, 2);
INSERT INTO `user_role` (`user_id`, `role_id`) VALUES (3, 3);
INSERT INTO `user_role` (`user_id`, `role_id`) VALUES (4, 3);
COMMIT;

SET FOREIGN_KEY_CHECKS = 1;
