## Website Name : Hostel Management Server

- Description :
- This repository contains the server-side implementation of the Hostel Management System, built using Node.js, Express.js, MongoDB, and other technologies. The server provides robust features for user authentication, meal management, admin controls, and payment processing.

## Server Site Link :

-- https://b10-a12-server-side.vercel.app/

## Features

### User Authentication and Authorization:

- Secure JWT-based authentication with role-based access control.
- Cookie-based token management for secure and persistent sessions.

### Admin Controls:

- Manage users, including role updates and search functionality.
- Admin-only access to meal management and review controls.

### Meal Management:

- CRUD operations for meals, including adding, updating, viewing, and deleting meals.
- Dynamic sorting and filtering by categories and likes.

### Review System:

- Users can add, view, and manage reviews for meals.
- Admins can monitor and update review statuses.

### Request Meal Feature:

- Users can request meals, which are stored in a separate collection for admin review.
- Admins can approve or reject meal requests.

### Payment Integration:

- Stripe-based payment processing for secure transactions.
- Payment history and premium subscription management.

### Middleware for Security:

- Custom middleware for verifying tokens and admin roles.
- Prevention of unauthorized access to protected routes.

### Database Management:

- MongoDB collections for users, meals, reviews, payments, and requests.
- Optimized queries for efficient data retrieval.

### Search and Filter Functionality:

- Dynamic search options for users and meals based on various criteria.
- Case-insensitive and partial matching for enhanced user experience.

## Technologies Used

- Backend Framework: Express.js
- Database: MongoDB
- Authentication: JSON Web Token (JWT)
- Payment Integration: Stripe
- Environment Management: dotenv
- Middleware: Cookie-parser, CORS

## Installation and Setup

### Clone the repository

- git clone

### Install dependencies

- npm install

### Start the server

- nodemon index.js / npm run dev

## API Endpoints

### Authentication

- POST /jwt - Generate a JWT for user authentication.
- POST /logout - Logout a user by clearing the authentication cookie.

### User Management

- POST /users - Register a new user.
- GET /user/:email - Retrieve user details by email.
- PATCH /users/role/:id - Update user role.

### Meal Management

- POST /add-meals - Add a new meal (Admin only).
- GET /all-meals - Retrieve all published meals with filtering options.
- PATCH /update-like/:id - Increment likes for a meal.
- DELETE /delete/meal/:id - Delete a meal (Admin only).

### Payment

- POST /create-payment-intent - Generate a payment intent for Stripe.
- POST /payment-info - Save payment details after successful transactions.
- GET /payment/history/:email - Retrieve payment history for a user.

### Reviews

- POST /reviews - Add a review for a meal.
- GET /reviews/:id - Get reviews for a specific meal.
- PATCH /update-reviews/:id - Update review count for a meal.
