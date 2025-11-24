-- =====================================================
-- STUDENT_COURSE Table Creation Script
-- =====================================================
-- Purpose: Junction table for many-to-many relationship
--          between STUDENT and COURSE tables
-- =====================================================

-- Create STUDENT_COURSE table
CREATE TABLE IF NOT EXISTS `STUDENT_COURSE` (
  `student_id` BIGINT UNSIGNED NOT NULL,
  `course_id` BIGINT UNSIGNED NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`student_id`, `course_id`),
  KEY `IDX_COURSE_ID` (`course_id`),
  KEY `IDX_STUDENT_ID` (`student_id`),
  CONSTRAINT `FK_STUDENT_COURSE_STUDENT`
    FOREIGN KEY (`student_id`)
    REFERENCES `STUDENT`(`student_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `FK_STUDENT_COURSE_COURSE`
    FOREIGN KEY (`course_id`)
    REFERENCES `COURSE`(`course_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- =====================================================
-- Table Structure Details
-- =====================================================
-- 
-- Field Name    | Data Type         | Constraints
-- --------------|-------------------|------------------------------------------
-- student_id    | BIGINT UNSIGNED   | NOT NULL, FK → STUDENT.student_id
-- course_id     | BIGINT UNSIGNED   | NOT NULL, FK → COURSE.course_id
-- created_at    | DATETIME          | NOT NULL, DEFAULT CURRENT_TIMESTAMP
-- 
-- Primary Key: Composite (student_id, course_id)
--   - Ensures a student can only be enrolled in a course once
--   - Prevents duplicate enrollments
-- 
-- Foreign Keys:
--   1. student_id → STUDENT.student_id
--      - ON DELETE CASCADE: If a student is deleted, all their course 
--        enrollments are automatically deleted
--      - ON UPDATE CASCADE: If student_id changes, enrollments are updated
-- 
--   2. course_id → COURSE.course_id
--      - ON DELETE CASCADE: If a course is deleted, all student enrollments 
--        for that course are automatically deleted
--      - ON UPDATE CASCADE: If course_id changes, enrollments are updated
-- 
-- Indexes:
--   - PRIMARY KEY (student_id, course_id): Composite primary key
--   - IDX_COURSE_ID: Index on course_id for faster lookups
--   - IDX_STUDENT_ID: Index on student_id for faster lookups
-- 
-- =====================================================
-- Relationships
-- =====================================================
-- 
-- STUDENT (1) ←→ (Many) STUDENT_COURSE (Many) ←→ (1) COURSE
-- 
-- This is a many-to-many relationship:
--   - One student can be enrolled in many courses
--   - One course can have many students enrolled
-- 
-- Example:
--   Student ID 1 enrolled in Course IDs: [1, 2, 3]
--   Course ID 1 has Student IDs: [1, 5, 10]
-- 
-- =====================================================
-- Usage Examples
-- =====================================================
-- 
-- 1. Get all courses for a student:
--    SELECT c.* FROM COURSE c
--    INNER JOIN STUDENT_COURSE sc ON c.course_id = sc.course_id
--    WHERE sc.student_id = 1;
-- 
-- 2. Get all students in a course:
--    SELECT s.* FROM STUDENT s
--    INNER JOIN STUDENT_COURSE sc ON s.student_id = sc.student_id
--    WHERE sc.course_id = 1;
-- 
-- 3. Add a student to a course:
--    INSERT INTO STUDENT_COURSE (student_id, course_id)
--    VALUES (1, 1);
-- 
-- 4. Remove a student from a course:
--    DELETE FROM STUDENT_COURSE
--    WHERE student_id = 1 AND course_id = 1;
-- 
-- =====================================================

