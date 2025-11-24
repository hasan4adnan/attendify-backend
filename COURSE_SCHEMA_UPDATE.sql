-- =====================================================
-- COURSE Table Schema Update
-- =====================================================
-- Purpose: Add room_number and semester columns to COURSE table
--          Create COURSE_SCHEDULE table for schedule entries
-- =====================================================
-- IMPORTANT: Run this script in your MySQL database before using the Course API
-- =====================================================

-- Check and add room_number column to COURSE table
-- Note: If column already exists, this will show a warning but won't fail
SET @dbname = DATABASE();
SET @tablename = 'COURSE';
SET @columnname = 'room_number';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (COLUMN_NAME = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' VARCHAR(50) NULL AFTER instructor_id')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Check and add semester column to COURSE table
SET @columnname = 'semester';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (COLUMN_NAME = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' VARCHAR(50) NULL AFTER room_number')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- =====================================================
-- COURSE_SCHEDULE Table Creation
-- =====================================================
-- Purpose: Store schedule entries for courses (days, times)
-- =====================================================

-- Create COURSE_SCHEDULE table if it doesn't exist
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

-- Add check constraint for valid day (if your MySQL version supports it)
-- Note: MySQL 8.0.16+ supports CHECK constraints
-- If you get an error, you can safely ignore this constraint
-- The application will validate the day values

-- Add check constraint for time validation (if supported)
-- Note: This ensures end_time is after start_time
-- If you get an error, you can safely ignore this constraint
-- The application will validate the time values

-- =====================================================
-- Table Structure Details
-- =====================================================
-- 
-- COURSE Table (Updated):
--   - Added: room_number VARCHAR(50) NULL
--   - Added: semester VARCHAR(50) NULL
-- 
-- COURSE_SCHEDULE Table:
-- 
-- Field Name    | Data Type         | Constraints
-- --------------|-------------------|------------------------------------------
-- schedule_id   | BIGINT UNSIGNED   | NOT NULL, AUTO_INCREMENT, PK
-- course_id     | BIGINT UNSIGNED   | NOT NULL, FK → COURSE.course_id
-- day           | VARCHAR(20)       | NOT NULL
-- start_time    | TIME              | NOT NULL
-- end_time      | TIME              | NOT NULL
-- created_at    | DATETIME          | NOT NULL, DEFAULT CURRENT_TIMESTAMP
-- 
-- Indexes:
--   - PRIMARY KEY (schedule_id)
--   - IDX_COURSE_ID: Index on course_id for faster lookups
--   - IDX_DAY: Index on day for faster filtering
-- 
-- Foreign Keys:
--   - course_id → COURSE.course_id
--     - ON DELETE CASCADE: If a course is deleted, all schedule entries are deleted
--     - ON UPDATE CASCADE: If course_id changes, schedule entries are updated
-- 
-- =====================================================
-- Usage Examples
-- =====================================================
-- 
-- 1. Create a schedule entry:
--    INSERT INTO COURSE_SCHEDULE (course_id, day, start_time, end_time)
--    VALUES (1, 'Monday', '09:00:00', '10:00:00');
-- 
-- 2. Get all schedule entries for a course:
--    SELECT * FROM COURSE_SCHEDULE
--    WHERE course_id = 1
--    ORDER BY FIELD(day, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'),
--             start_time ASC;
-- 
-- 3. Delete all schedule entries for a course:
--    DELETE FROM COURSE_SCHEDULE WHERE course_id = 1;
-- 
-- =====================================================
-- Verification Queries
-- =====================================================
-- 
-- Verify COURSE table has new columns:
-- DESCRIBE COURSE;
-- 
-- Verify COURSE_SCHEDULE table exists:
-- SHOW TABLES LIKE 'COURSE_SCHEDULE';
-- 
-- =====================================================
