# Store_Rating_App
Store_Rating_App
A full-stack web application that allows users to submit ratings for stores registered on the platform. Built with React.js frontend, Express.js backend, and MySQL database.

# Frontend
React.js - Component-based UI library
React Router - Client-side routing
Axios - HTTP client for API calls
Bootstrap Icons - Professional icon library
CSS3 - Custom styling and responsive design

# Backend
Express.js - Web application framework
MySQL - Relational database management
JWT - JSON Web Tokens for authentication
bcryptjs - Password hashing
Express Validator - Input validation and sanitization

Database
MySQL - Primary database

Tables:
users - User accounts and profiles
stores - Store information and ownership
ratings - User ratings and reviews

# Installation & Setup

1. Clone the Repository
   git clone <repository-url>
   cd store-rating-app
   
2. Backend Setup
   cd backend
   npm install    // Install Dependencies
   cp .env.example .env

3. Database Setup
   mysql -u root -p   // Access Database
   CREATE DATABASE store_rating_db;
   USE store_rating_db;
   SOURCE database/schema.sql;

4. Frontend Setup
   cd ../frontend
   npm install  // Install Dependencies

# Run Command
Start Backend Server  - cd backend & npm run dev
Start Frontend - cd frontend & npm run dev





