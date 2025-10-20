-- Create database
CREATE DATABASE IF NOT EXISTS store_rating_db;
USE store_rating_db;

-- Users table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(60) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    address VARCHAR(400),
    role ENUM('admin', 'user', 'store_owner') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Stores table
CREATE TABLE stores (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(60) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    address VARCHAR(400) NOT NULL,
    owner_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Ratings table
CREATE TABLE ratings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    store_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_store (user_id, store_id)
);

-- Insert initial admin user (password: Admin123!)
INSERT INTO users (name, email, password, address, role) VALUES 
('System Administrator', 'admin@storeRating.com', '$2a$12$LQv3c1yqBNWR2SBK2q4L.uL5T7L2j7Xp8k8J8Nc6n7pXbY5rL8aK', 'System Administration Address', 'admin');

-- Insert sample store owner (password: Owner123!)
INSERT INTO users (name, email, password, address, role) VALUES 
('Store Owner Example', 'owner@storeRating.com', '$2a$12$LQv3c1yqBNWR2SBK2q4L.uL5T7L2j7Xp8k8J8Nc6n7pXbY5rL8aK', 'Store Owner Address', 'store_owner');

-- Insert sample stores
INSERT INTO stores (name, email, address, owner_id) VALUES 
('SuperMart Central', 'supermart@example.com', '123 Main Street, Downtown City', 2),
('Tech Gadgets Hub', 'techhub@example.com', '456 Tech Avenue, Innovation District', 2),
('Fashion Outlet Store', 'fashion@example.com', '789 Style Boulevard, Fashion District', 2);

-- Insert sample ratings
INSERT INTO ratings (user_id, store_id, rating) VALUES 
(1, 1, 4),
(1, 2, 5),
(2, 3, 4);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_stores_name ON stores(name);
CREATE INDEX idx_stores_owner ON stores(owner_id);
CREATE INDEX idx_ratings_user ON ratings(user_id);
CREATE INDEX idx_ratings_store ON ratings(store_id);