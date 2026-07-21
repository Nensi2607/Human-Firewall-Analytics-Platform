# Authentication APIs

## Register

POST /api/auth/register

Body:

```json
{
  "firstName":"Nensi",
  "lastName":"Shingala",
  "email":"abc@gmail.com",
  "password":"123456",
  "role":"employee"
}
```

---

## Login

POST /api/auth/login

```json
{
  "email":"abc@gmail.com",
  "password":"123456"
}
```

---

## Get Current User

GET /api/auth/me

Authorization:

Bearer TOKEN

---

## Logout

POST /api/auth/logout

---

## Forgot Password

POST /api/auth/forgot-password

---

## Reset Password

POST /api/auth/reset-password