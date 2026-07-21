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