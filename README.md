# StaffSync — Employee Management (MERN)

A compact employee CRUD project built with MongoDB, Express, React, and Node.js.

## Requirements
- Node.js and npm
- MongoDB Community Server running locally, or a MongoDB Atlas connection string
- VS Code (recommended)

## 1. Configure MongoDB
In `server`, copy `.env.example` to `.env` and keep the local URI for a local MongoDB service:

`MONGO_URI=mongodb://127.0.0.1:27017/staffsync`

If your `server.js` or environment file is changed, keep the variable name `MONGO_URI`.

## 2. Run the backend
Open a VS Code terminal in the project root:

```bash
cd server
npm install
npm start
```

Backend runs at `http://localhost:5000`.

## 3. Run the frontend
Open a SECOND terminal in VS Code:

```bash
cd client
npm install
npm run dev
```

Open the URL printed by Vite, usually `http://localhost:5173`.

## Features
- Add employees
- List employees
- Search by name
- Edit employee details
- Delete employees

Employee fields: name, email, department, role, salary.

## API routes
- `GET /api/employees` — list employees; optional `?search=name`
- `POST /api/employees` — create employee
- `PUT /api/employees/:id` — update employee
- `DELETE /api/employees/:id` — delete employee

## Note
This is the compact CRUD version. It does not yet implement authentication, role-based dashboards, attendance, leave management, announcements, or training modules.
