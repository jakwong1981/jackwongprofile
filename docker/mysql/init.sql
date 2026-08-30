-- MySQL initialization script for SIT environment
-- Creates the database and sets up initial permissions

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS jackwong_profile CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create application user if it doesn't exist
CREATE USER IF NOT EXISTS 'profile'@'%' IDENTIFIED BY 'sit_profile_pass';

-- Grant privileges to application user
GRANT ALL PRIVILEGES ON jackwong_profile.* TO 'profile'@'%';

-- Apply changes
FLUSH PRIVILEGES;