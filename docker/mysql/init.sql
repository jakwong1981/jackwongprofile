-- MySQL initialization script for Jack Wong Profile System
-- This script runs when the MySQL container starts for the first time

-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS jackwong_profile;
USE jackwong_profile;

-- Create application user with proper privileges
CREATE USER IF NOT EXISTS 'profile'@'%' IDENTIFIED BY 'ProfilePass123!';
GRANT ALL PRIVILEGES ON jackwong_profile.* TO 'profile'@'%';
GRANT CREATE USER ON *.* TO 'profile'@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES;

-- Create additional user for compatibility (if different username is used)
CREATE USER IF NOT EXISTS 'profile_user'@'%' IDENTIFIED BY 'ProfilePass123!';
GRANT ALL PRIVILEGES ON jackwong_profile.* TO 'profile_user'@'%';
FLUSH PRIVILEGES;

-- Show users for verification
SELECT user, host FROM mysql.user WHERE user LIKE 'profile%';