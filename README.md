# Human-Firewall-Analytics-Platform

## Progress

### ✅ Completed
- Backend setup
- MongoDB Atlas integration
- Department Model
- User Model

### 🚧 Next
- Authentication APIs
- JWT Authentication
- Department CRUD

# Human Firewall Analytics Platform (HFAP)

## Overview

Human Firewall Analytics Platform (HFAP) is a cybersecurity awareness platform that evaluates employee security behavior through phishing simulations, quizzes, training modules, AI-based risk prediction, and analytics.

---

## Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- React.js
- Python (AI/ML)
- Chart.js

---

## Modules

- Authentication
- User Management
- Department Management
- Quiz Management
- Training Management
- Phishing Simulation
- Risk Assessment
- AI Prediction
- Recommendation Engine
- Notifications
- Reports & Analytics

---

## Database Collections

- Users
- Departments
- Quiz
- Questions
- QuizResults
- Training
- TrainingProgress
- PhishingCampaigns
- PhishingAttempts
- RiskAssessments
- AIPredictions
- Recommendations
- Notifications
- Reports

---

## Relationships

- One Department has many Users.
- One User creates many Quizzes.
- One Quiz contains many Questions.
- One User has many Quiz Results.
- One Training has many Progress records.
- One Phishing Campaign has many Attempts.
- One User has many Risk Assessments.
- One User has many AI Predictions.
- One User has many Recommendations.
- One User receives many Notifications.
- One User generates many Reports.

---

## Features

- Secure JWT Authentication
- Employee Risk Assessment
- AI Risk Prediction
- Phishing Simulation
- Cybersecurity Awareness Training
- Online Quiz System
- Personalized Recommendations
- Analytics Dashboard
- Report Generation
- Notification System

---

## Common / Shared API Contracts

These endpoints are intended for cross-module use by dashboard, analytics, role-based UI, training, and phishing features.

### 1) Get current authenticated user

Method: GET
Path: /api/auth/me
Headers:
- Authorization: Bearer <token>

Expected body: none

Success response shape:
```json
{
  "success": true,
  "user": {
    "_id": "64a1b2c3d4e5f67890123456",
    "firstName": "Jane",
    "lastName": "Doe",
    "email": "jane@example.com",
    "role": "admin",
    "departmentId": "64a1b2c3d4e5f67890123456",
    "designation": "Security Analyst",
    "status": "active",
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z"
  }
}
```

Error response shape:
```json
{
  "success": false,
  "message": "Not authorized. Token missing."
}
```

### 2) Get current user profile from user collection

Method: GET
Path: /api/users/me
Headers:
- Authorization: Bearer <token>

Expected body: none

Success response shape:
```json
{
  "success": true,
  "data": {
    "_id": "64a1b2c3d4e5f67890123456",
    "firstName": "Jane",
    "lastName": "Doe",
    "email": "jane@example.com",
    "role": "admin",
    "departmentId": {
      "_id": "64a1b2c3d4e5f67890123456",
      "departmentName": "Security Operations"
    },
    "designation": "Security Analyst",
    "status": "active"
  }
}
```

### 3) List employees / all users

Method: GET
Path: /api/users
Headers:
- Authorization: Bearer <token>

Expected body: none

Success response shape:
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "64a1b2c3d4e5f67890123456",
      "firstName": "Jane",
      "lastName": "Doe",
      "email": "jane@example.com",
      "role": "admin",
      "departmentId": {
        "_id": "64a1b2c3d4e5f67890123456",
        "departmentName": "Security Operations"
      },
      "designation": "Security Analyst",
      "status": "active"
    },
    {
      "_id": "64a1b2c3d4e5f67890123457",
      "firstName": "John",
      "lastName": "Smith",
      "email": "john@example.com",
      "role": "employee",
      "departmentId": {
        "_id": "64a1b2c3d4e5f67890123458",
        "departmentName": "IT Infrastructure"
      },
      "designation": "System Administrator",
      "status": "active"
    }
  ]
}
```

### 4) List departments

Method: GET
Path: /api/departments
Headers:
- Authorization: Bearer <token>

Expected body: none

Success response shape:
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "64a1b2c3d4e5f67890123459",
      "departmentName": "Security Operations",
      "manager": {
        "_id": "64a1b2c3d4e5f67890123456",
        "firstName": "Jane",
        "lastName": "Doe",
        "email": "jane@example.com"
      },
      "description": "Monitor and manage cyber risk"
    }
  ]
}
```

> Notes:
> - Authenticated users can read shared data via these endpoints.
> - Mutating endpoints such as user updates or department creation remain admin-only.
> - All routes return standard success/error objects with a top-level success flag.

---

## Authentication Flow Diagram
Register
      │
      ▼
Password Hashing
      │
      ▼
Save User
      │
      ▼
Generate JWT
      │
      ▼
Return Token
      │
      ▼
Frontend Stores Token
      │
      ▼
Protected APIs