# STUDENT_COURSE Table - Relationships and Data Types

## 📋 Table Overview

The `STUDENT_COURSE` table is a **junction table** (also called a **join table** or **bridge table**) that creates a many-to-many relationship between `STUDENT` and `COURSE` tables.

---

## 🗂️ Table Structure

| Field Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| `student_id` | `BIGINT UNSIGNED` | NOT NULL, FK → `STUDENT.student_id` | Foreign key to STUDENT table |
| `course_id` | `BIGINT UNSIGNED` | NOT NULL, FK → `COURSE.course_id` | Foreign key to COURSE table |
| `created_at` | `DATETIME` | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Timestamp when enrollment was created |

**Primary Key:** Composite `(student_id, course_id)`
- Ensures a student can only be enrolled in a course once
- Prevents duplicate enrollments

---

## 🔗 Relationships

### Relationship Diagram

```
STUDENT (1) ←→ (Many) STUDENT_COURSE (Many) ←→ (1) COURSE
```

### Detailed Relationships

#### 1. STUDENT ↔ STUDENT_COURSE
- **Type:** One-to-Many
- **Cardinality:** One student can have many course enrollments
- **Foreign Key:** `student_id` → `STUDENT.student_id`
- **Cascade Rules:**
  - `ON DELETE CASCADE`: If a student is deleted, all their course enrollments are automatically deleted
  - `ON UPDATE CASCADE`: If `student_id` changes, enrollments are automatically updated

#### 2. COURSE ↔ STUDENT_COURSE
- **Type:** One-to-Many
- **Cardinality:** One course can have many student enrollments
- **Foreign Key:** `course_id` → `COURSE.course_id`
- **Cascade Rules:**
  - `ON DELETE CASCADE`: If a course is deleted, all student enrollments for that course are automatically deleted
  - `ON UPDATE CASCADE`: If `course_id` changes, enrollments are automatically updated

---

## 📊 Data Types Explanation

### `student_id` - BIGINT UNSIGNED
- **Type:** Big Integer (unsigned, 64-bit)
- **Purpose:** References the primary key of the STUDENT table
- **Range:** 0 to 18,446,744,073,709,551,615 (unsigned)
- **Usage:** Identifies which student is enrolled
- **Note:** Supports much larger ID values than INT, suitable for systems with millions of students

### `course_id` - BIGINT UNSIGNED
- **Type:** Big Integer (unsigned, 64-bit)
- **Purpose:** References the primary key of the COURSE table
- **Range:** 0 to 18,446,744,073,709,551,615 (unsigned)
- **Usage:** Identifies which course the student is enrolled in
- **Note:** Supports much larger ID values than INT, suitable for systems with millions of courses

### `created_at` - DATETIME
- **Type:** Date and time
- **Format:** 'YYYY-MM-DD HH:MM:SS'
- **Default:** CURRENT_TIMESTAMP (automatically set when record is created)
- **Purpose:** Tracks when the enrollment was created
- **Example:** '2024-01-15 10:30:00'

---

## 🔑 Indexes

1. **Primary Key Index:** `(student_id, course_id)`
   - Automatically created
   - Ensures uniqueness and fast lookups

2. **Index on `course_id`:** `idx_course_id`
   - Speeds up queries like "Get all students in course X"

3. **Index on `student_id`:** `idx_student_id`
   - Speeds up queries like "Get all courses for student X"

---

## 💡 Why This Table Exists

### Problem Without This Table:
- **Option 1:** Store course IDs in STUDENT table
  - ❌ Limited to one course per student (or complex comma-separated values)
  - ❌ Hard to query and maintain

- **Option 2:** Store student IDs in COURSE table
  - ❌ Limited to one student per course (or complex comma-separated values)
  - ❌ Hard to query and maintain

### Solution With STUDENT_COURSE:
- ✅ One student can be enrolled in **many courses**
- ✅ One course can have **many students**
- ✅ Easy to query and maintain
- ✅ Normalized database design (follows database best practices)

---

## 📝 Example Data

### Sample Records

| student_id | course_id | created_at           |
|------------|-----------|---------------------|
| 1          | 1         | 2024-01-15 10:00:00 |
| 1          | 2         | 2024-01-15 10:00:00 |
| 1          | 3         | 2024-01-15 10:00:00 |
| 2          | 1         | 2024-01-16 09:30:00 |
| 2          | 3         | 2024-01-16 09:30:00 |
| 3          | 2         | 2024-01-17 14:20:00 |

**Interpretation:**
- Student 1 is enrolled in courses 1, 2, and 3
- Student 2 is enrolled in courses 1 and 3
- Student 3 is enrolled in course 2
- Course 1 has students 1 and 2
- Course 2 has students 1 and 3
- Course 3 has students 1 and 2

---

## 🔍 Common Queries

### 1. Get all courses for a student
```sql
SELECT c.course_id, c.course_name, c.course_code, sc.created_at
FROM COURSE c
INNER JOIN STUDENT_COURSE sc ON c.course_id = sc.course_id
WHERE sc.student_id = 1;
```

### 2. Get all students in a course
```sql
SELECT s.student_id, s.name, s.surname, s.student_number, sc.created_at
FROM STUDENT s
INNER JOIN STUDENT_COURSE sc ON s.student_id = sc.student_id
WHERE sc.course_id = 1;
```

### 3. Count students per course
```sql
SELECT c.course_id, c.course_name, COUNT(sc.student_id) as student_count
FROM COURSE c
LEFT JOIN STUDENT_COURSE sc ON c.course_id = sc.course_id
GROUP BY c.course_id, c.course_name;
```

### 4. Count courses per student
```sql
SELECT s.student_id, s.name, s.surname, COUNT(sc.course_id) as course_count
FROM STUDENT s
LEFT JOIN STUDENT_COURSE sc ON s.student_id = sc.student_id
GROUP BY s.student_id, s.name, s.surname;
```

---

## ⚠️ Important Notes

1. **Composite Primary Key:** The combination of `(student_id, course_id)` must be unique. You cannot enroll the same student in the same course twice.

2. **Cascade Deletes:** 
   - Deleting a student will automatically delete all their course enrollments
   - Deleting a course will automatically delete all student enrollments for that course

3. **Data Integrity:** Foreign key constraints ensure that:
   - You cannot enroll a student in a course that doesn't exist
   - You cannot enroll a non-existent student in a course

4. **Performance:** The indexes ensure fast lookups even with thousands of enrollments.

---

## 🚀 How to Use in Your Application

The codebase uses this table through these functions in `src/models/student.model.js`:

- `addStudentToCourses(studentId, courseIds)` - Adds courses to a student (skips existing)
- `removeStudentFromCourses(studentId, courseIds)` - Removes courses from a student
- `replaceStudentCourses(studentId, courseIds)` - Replaces all courses with new list
- `getStudentCourses(studentId)` - Gets all courses for a student

These functions handle the add/remove pattern efficiently, only modifying what's necessary.

