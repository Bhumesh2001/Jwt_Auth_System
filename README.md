# JWT Authentication API

A secure Node.js authentication API using JWT, Express, and MongoDB.

## Features

- User registration
- User login with JWT
- Protected routes
- Password hashing
- Token refresh mechanism
- Rate limiting
- Security headers

## Setup

1. Clone the repo
2. Install dependencies: `npm install`
3. Create `.env` file (see `.env.example`)
4. Start server: `npm run dev`

## Env Crednetials

1. MONGODB_URI=mongodb://localhost:27017/jwt_auth
2. JWT_SECRET=your_jwt_secret_key_here
3. JWT_REFRESH_SECRET=your_refresh_token_secret_here
4. PORT=3000

## Token System

| Token Type    | Expiration | Storage Location | Purpose                  |
| ------------- | ---------- | ---------------- | ------------------------ |
| Access Token  | 15 minutes | Client memory    | API authorization        |
| Refresh Token | 7 days     | HTTP-only cookie | Obtain new access tokens |

## API Endpoints

### POST /api/register

Register a new user

**Request:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### POST /api/login

Login user

**Request:**

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### GET /api/profile

Get user profile (protected)

### Headers

Authorization: Bearer <token>

### POST /api/refresh-token

Get Refresh Token

**Request:**

```json
{
  "refreshToken": "your refresh token...."
}
```

### POST /api/logout

Logout user

### Headers

Authorization: Bearer <token>
