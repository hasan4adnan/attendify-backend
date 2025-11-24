-- =====================================================
-- QUICK FIX: Add missing columns to COURSE table
-- =====================================================
-- Run this if the above script doesn't work
-- =====================================================

-- Add room_number column (if it doesn't exist)
ALTER TABLE `COURSE` 
ADD COLUMN `room_number` VARCHAR(50) NULL AFTER `instructor_id`;

-- Add semester column (if it doesn't exist)
ALTER TABLE `COURSE` 
ADD COLUMN `semester` VARCHAR(50) NULL AFTER `room_number`;

-- Create COURSE_SCHEDULE table
CREATE TABLE IF NOT EXISTS `COURSE_SCHEDULE` (
  `schedule_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `course_id` BIGINT UNSIGNED NOT NULL,
  `day` VARCHAR(20) NOT NULL,
  `start_time` TIME NOT NULL,
  `end_time` TIME NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`schedule_id`),
  KEY `IDX_COURSE_ID` (`course_id`),
  KEY `IDX_DAY` (`day`),
  CONSTRAINT `FK_COURSE_SCHEDULE_COURSE`
    FOREIGN KEY (`course_id`)
    REFERENCES `COURSE`(`course_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

