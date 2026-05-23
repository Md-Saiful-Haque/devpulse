# DevPulse API

A collaborative platform for software teams to report bugs, suggest features, and coordinate issue resolution.

---

## Live URL

https://devpulse-ecru.vercel.app/

## GitHub Repository

https://github.com/Md-Saiful-Haque/devpulse.git

---

# Features

### Authentication & Authorization

- User Registration
- User Login
- JWT Authentication
- Password Hashing using bcrypt
- Role-Based Access Control
- Contributor & Maintainer Roles

### Issue Management

- Create Issue
- View All Issues
- View Single Issue
- Update Issue
- Delete Issue
- Issue Filtering
- Issue Sorting

### Security

- Protected Routes
- JWT Verification
- Password Encryption
- Role Validation

---

# Tech Stack

### Backend

- Node.js
- Express.js
- TypeScript

### Database

- PostgreSQL
- pg (Native PostgreSQL Driver)

### Authentication

- JSON Web Token (JWT)
- bcrypt

### Utilities

- dotenv
- cors
- http-status-codes

---

# Project Setup

## Clone Repository

```bash
git clone https://github.com/yourusername/devpulse-api.git
cd devpulse-api
```

## Install Dependencies

```bash
npm install
```

## Environment Variables

Create a `.env` file in the root directory.

```env
PORT=5000

DATABASE_URL=your_postgresql_database_url

JWT_SECRET=your_secret_key

BCRYPT_SALT_ROUNDS=10
```

## Run Development Server

```bash
npm run dev
```

## Build Project

```bash
npm run build
```

## Run Production Server

```bash
npm start
```

---

# API Endpoints

## Authentication

### Register User

```http
POST /api/auth/signup
```

### Login User

```http
POST /api/auth/login
```

---

## Issues

### Create Issue

```http
POST /api/issues
```

Authentication Required

### Get All Issues

```http
GET /api/issues
```

Query Parameters

| Parameter | Values |
| ---------- | ---------- |
| sort | newest, oldest |
| type | bug, feature_request |
| status | open, in_progress, resolved |

Example:

```http
GET /api/issues?sort=newest&type=bug&status=open
```

### Get Single Issue

```http
GET /api/issues/:id
```

### Update Issue

```http
PATCH /api/issues/:id
```

Authentication Required

### Delete Issue

```http
DELETE /api/issues/:id
```

Maintainer Only

---

# Database Schema Summary

## Users Table

| Field | Type |
|---------|---------|
| id | SERIAL PRIMARY KEY |
| name | VARCHAR(100) |
| email | VARCHAR(150) UNIQUE |
| password | TEXT |
| role | contributor / maintainer |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## Issues Table

| Field | Type |
|---------|---------|
| id | SERIAL PRIMARY KEY |
| title | VARCHAR(150) |
| description | TEXT |
| type | bug / feature_request |
| status | open / in_progress / resolved |
| reporter_id | INTEGER |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

# Role Permissions

## Contributor

- Register
- Login
- Create Issue
- View All Issues
- Update Own Open Issue

## Maintainer

- All Contributor Permissions
- Update Any Issue
- Delete Any Issue
- Change Issue Status
- Access Internal Metrics

---

# Project Structure

```txt
src
│
├── app
│   ├── modules
│   │   ├── auth
│   │   └── issues
│   │
│   ├── middleware
│   │
│   ├── utils
│   │
│   └── config
│
├── app.ts
└── server.ts
```

---

# Author

### Md Saiful Haque
