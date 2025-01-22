## Website Name : Hostel Management System

- Description :
- This repository contains the server-side implementation of the Hostel Management System, built using Node.js, Express.js, MongoDB, and other technologies. The server provides robust features for user authentication, meal management, admin controls, and payment processing.

## Server Site Link :

-- https://b10-a12-server-side.vercel.app/

## Features

1.User Authentication and Authorization:

- Secure JWT-based authentication with role-based access control.
- Cookie-based token management for secure and persistent sessions.

  2.Admin Controls:

- Manage users, including role updates and search functionality.
- Admin-only access to meal management and review controls.

  3.Meal Management:

- CRUD operations for meals, including adding, updating, viewing, and deleting meals.
- Dynamic sorting and filtering by categories and likes.

  4.Review System:

- Users can add, view, and manage reviews for meals.
- Admins can monitor and update review statuses.

  5.Request Meal Feature:

- Users can request meals, which are stored in a separate collection for admin review.
- Admins can approve or reject meal requests.

  6.Payment Integration:

- Stripe-based payment processing for secure transactions.
- Payment history and premium subscription management.

  7.Middleware for Security:

- Custom middleware for verifying tokens and admin roles.
- Prevention of unauthorized access to protected routes.

  8.Database Management:

- MongoDB collections for users, meals, reviews, payments, and requests.
- Optimized queries for efficient data retrieval.

  9.Search and Filter Functionality:

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

1.Clone the repository

- git clone

  2.Install dependencies

- npm install

  3.Start the server

- nodemon index.js / npm run dev

## API Endpoints

1.Authentication

- POST /jwt - Generate a JWT for user authentication.
- POST /logout - Logout a user by clearing the authentication cookie.

  2.User Management

- POST /users - Register a new user.
- GET /user/:email - Retrieve user details by email.
- PATCH /users/role/:id - Update user role.

  3.Meal Management

- POST /add-meals - Add a new meal (Admin only).
- GET /all-meals - Retrieve all published meals with filtering options.
- PATCH /update-like/:id - Increment likes for a meal.
- DELETE /delete/meal/:id - Delete a meal (Admin only).

  3.Payment

- POST /create-payment-intent - Generate a payment intent for Stripe.
- POST /payment-info - Save payment details after successful transactions.
- GET /payment/history/:email - Retrieve payment history for a user.

  3.Reviews

- POST /reviews - Add a review for a meal.
- GET /reviews/:id - Get reviews for a specific meal.
- PATCH /update-reviews/:id - Update review count for a meal.
