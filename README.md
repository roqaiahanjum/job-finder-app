# JobFinder Full-Stack 🚀

[Repository](https://github.com/roqaiahanjum/job-finder-app)

A professional, full-stack remote job search application. This version replaces client-side localStorage with a secure MongoDB database and adds user authentication.

---

## 🌟 Overview

**JobFinder Full-Stack** is a complete web application built with a Node.js/Express backend and a Vanilla JS frontend. It utilizes the [Remotive API](https://remotive.com/api/remote-jobs) to fetch real-time job data while providing secure user accounts for persistent job tracking.

### Key Features
- **User Authentication**: Secure Signup/Login using **JWT (JSON Web Tokens)** and **bcryptjs** password hashing.
- **Persistent Database**: All saved jobs are stored in **MongoDB**, tied to specific user accounts.
- **RESTful API**: Custom backend endpoints for searching, saving, and deleting jobs.
- **API Proxy Pattern**: The backend acts as a proxy for the Remotive API, eliminating CORS issues and keeping third-party calls off the frontend.
- **Responsive UI**: Intuitive, mobile-friendly interface with glassmorphism and modern typography.

## 🎯 Why This Project?

Upgrading from a frontend-only app to this full-stack version demonstrates mastery of:
- **Server-Side Development**: Building a structured Express.js server with Middleware and Controllers.
- **Database Management**: Designing schemas and handling CRUD operations with Mongoose.
- **Security**: Implementing stateless authentication and hashing sensitive data.
- **Environment Management**: Using `.env` files to protect sensitive credentials.

## 🛠️ Tech Stack

- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+).
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB & Mongoose.
- **Authentication**: JWT (JSON Web Tokens). The token is stored in localStorage for simplicity in this learning project; a production app would typically use an httpOnly cookie instead to reduce XSS exposure.
- **External API**: Remotive API (Proxied via backend).

## ⚙️ How It Works Internally

### 1. API Proxy Strategy
Instead of the browser calling Remotive directly, it calls our `/api/jobs/search` endpoint. Our Node.js server then fetches the data from Remotive and sends it back to the browser. This is a standard pattern that solves CORS restrictions and allows for server-side processing.

### 2. JWT Authentication Flow
When a user logs in, the server generates a token signed with a `JWT_SECRET`. The frontend stores this token and includes it in the `Authorization: Bearer <token>` header for all "Saved Job" requests.

### 3. MongoDB Persistence
Jobs are saved to the `SavedJob` collection in MongoDB, which contains a reference to the `User` who saved it. This allows multiple users to save the same job without data collisions.

## 📡 API Endpoints

### Auth Routes
- `POST /api/auth/signup` — Creates a new user account.
- `POST /api/auth/login` — Authenticates a user and returns a JWT token.

### Job Routes
- `GET /api/jobs/search` — Proxies a search request to the Remotive API (public).
- `GET /api/jobs/saved` — Returns all saved jobs for the logged-in user (protected).
- `POST /api/jobs/saved` — Saves a specific job for the logged-in user (protected).
- `DELETE /api/jobs/saved/:id` — Removes a saved job by its jobId (protected).

## 🚀 Local Setup

### Prerequisites
- [Node.js](https://nodejs.org/) installed.
- [MongoDB](https://www.mongodb.com/try/download/community) installed and running locally, or a **MongoDB Atlas** connection string.

### 1. Installation
Clone the repository and install dependencies:
```bash
npm install
```

### 2. Environment Variables
Create a `.env` file in the root directory (based on `.env.example`):
```text
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
NODE_ENV=development
```

### 3. Run the App
Start the server in development mode (using nodemon):
```bash
npm run dev
```
The app will be available at `http://localhost:5000`.

---
*Created with ❤️ for freeCodeCamp.*
