-- database_schema.sql
-- Run this file to set up the LMS database

CREATE DATABASE IF NOT EXISTS lms_database;
USE lms_database;

-- Users Table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    user_password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Courses Table
CREATE TABLE courses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    course_description TEXT NOT NULL,
    instructor VARCHAR(255) NOT NULL,
    duration INT NOT NULL,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Lessons Table
CREATE TABLE lessons (
    id INT PRIMARY KEY AUTO_INCREMENT,
    course_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    lesson_order INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Enrollments Table
CREATE TABLE enrollments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    course_id INT NOT NULL,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_enrollment(user_id, course_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Lesson Progress Table
CREATE TABLE lesson_progress (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    lesson_id INT NOT NULL,
    course_id INT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP NULL,
    UNIQUE KEY unique_progress(user_id, lesson_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Certificates Table
CREATE TABLE certificates (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    course_id INT NOT NULL,
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_certificate(user_id, course_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Insert Sample Courses
INSERT INTO courses (title, course_description, instructor, duration) VALUES
('WEB-TECH Basics', 'Learn basics of HTML, CSS, JS', 'Stan R Lee', 40),
('DATABASE MANAGEMENT', 'Understand the storage of data', 'Brock D Ray', 90),
('Data Science Essentials', 'Introduction to data analysis, visualization, and ML', 'Dr. Emily Chen', 60);

-- Insert Lessons for Course 1
INSERT INTO lessons (course_id, title, lesson_order) VALUES
(1, 'Introduction to HTML', 1),
(1, 'CSS Styling Basics', 2),
(1, 'JavaScript Fundamentals', 3),
(1, 'Responsive Design', 4),
(1, 'Final Project', 5);

-- Insert Lessons for Course 2
INSERT INTO lessons (course_id, title, lesson_order) VALUES
(2, 'Introduction to DB Lifecycle', 1),
(2, 'ER Diagrams + SQL', 2),
(2, 'Normalization', 3),
(2, 'Transaction', 4),
(2, 'No-SQL', 5);

-- Insert Lessons for Course 3
INSERT INTO lessons (course_id, title, lesson_order) VALUES
(3, 'Data Analysis with Pandas', 1),
(3, 'Data Visualization', 2),
(3, 'Statistical Analysis', 3),
(3, 'Machine Learning Basics', 4),
(3, 'Capstone Project', 5);
