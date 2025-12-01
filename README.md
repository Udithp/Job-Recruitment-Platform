
# Project Title

# 🌐 Job Recruitment Platform  
### Full-Stack Application (Frontend + Backend)

A complete end-to-end **Job Recruitment System** built using modern web technologies. The platform supports two primary user roles — **Employer** and **Jobseeker** — and provides a professional environment for posting jobs, applying to jobs, managing applications, and handling resume/logo uploads via Cloudinary.

This repository contains **both backend and frontend documentation** in one unified, professional README.

---

# 🚀 Features Overview

## 👥 User Roles
### Employer
- Post, edit, and delete jobs  
- Upload company logos  
- View job applications  
- Accept or reject candidates  
- Manage employer dashboard  

### Jobseeker
- Browse and search jobs  
- View detailed job information  
- Apply to jobs with resume upload  
- Track application status  
- Manage jobseeker dashboard  

---

# 🛠️ Technology Stack

## 🖥️ Frontend
- React (Vite)
- React Router
- Context API (Auth)
- Axios API Layer
- Cloudinary file uploads
- Responsive UI with components

## ⚙️ Backend
- Node.js + Express
- MongoDB Atlas (Native Driver)
- JWT Authentication
- Cloudinary Storage (Resumes & Logos)
- Multer (Memory storage)
- Role-based authorization

---

# 📁 Full-Stack Project Structure

```

job-recruitment-platform/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── public/uploads/
│   ├── server.js
│   ├── package.json
│   └── .env
│
└── frontend/
├── public/assets/
├── src/
│   ├── api/
│   ├── components/
│   ├── context/
│   ├── pages/
│   ├── utils/
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
└── .env

````

---

# ⚙️ Backend — Setup & Configuration

## 1️⃣ Install Dependencies
```bash
cd backend
npm install
````

## 2️⃣ Create `.env` File

```
PORT=5000
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_secret_key

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## 3️⃣ Run Server

```bash
npm run dev
```

---

# 🔗 Backend API Documentation

## 🔑 Authentication

| Method | Endpoint              | Description                 |
| ------ | --------------------- | --------------------------- |
| POST   | `/api/users/register` | Register employer/jobseeker |
| POST   | `/api/users/login`    | Login and receive JWT token |

## 💼 Jobs

| Method | Endpoint                | Description                |
| ------ | ----------------------- | -------------------------- |
| POST   | `/api/jobs`             | Create job (Employer only) |
| POST   | `/api/jobs/logo/:jobId` | Upload company logo        |
| GET    | `/api/jobs`             | List all jobs              |
| GET    | `/api/jobs/:id`         | Get job by ID              |
| GET    | `/api/jobs/search`      | Search jobs                |
| PATCH  | `/api/jobs/:id`         | Update job                 |
| DELETE | `/api/jobs/:id`         | Delete job                 |

## 📑 Applications

| Method | Endpoint                         | Description                  |
| ------ | -------------------------------- | ---------------------------- |
| POST   | `/api/applications/:jobId`       | Apply to job (resume upload) |
| GET    | `/api/applications/job/:jobId`   | Employer views applications  |
| GET    | `/api/applications/user/:userId` | Jobseeker views applied jobs |
| PATCH  | `/api/applications/:id/accept`   | Accept application           |
| PATCH  | `/api/applications/:id/reject`   | Reject application           |

---

# 🖥️ Frontend — Setup & Configuration

## 1️⃣ Install Dependencies

```bash
cd frontend
npm install
```

## 2️⃣ Create `.env`

```
VITE_API_URL=http://localhost:5000/api
```

## 3️⃣ Start Development Server

```bash
npm run dev
```

---

# 🧭 Frontend Structure

### 🔌 API Layer

`src/api/api.js`

* Central Axios instance
* Automatically attaches JWT token

### 🧩 Reusable Components

* Navbar
* JobCard
* ApplicationsList
* ProtectedRoute
* ProfileImageUpload
* CertificateUpload

### 📄 Pages (Complete UI)

* Login / Register
* Home
* Jobs / Job Details
* Apply Job
* Employer Dashboard
* Jobseeker Dashboard
* Post Job / Edit Job
* Applications View
* Profile

---

# 🔐 Authentication Flow

1. User registers → backend returns JWT
2. JWT is stored in `localStorage`
3. Axios sends token with all requests
4. Backend verifies token and role
5. React Router protects pages based on role
6. Unauthorized users are redirected

---

# 📤 File Upload Workflow

### Company Logo (Employer)

```
POST /api/jobs/logo/:jobId
```

**FormData:**

```
logo → file (.png/.jpg)
```

### Resume Upload (Jobseeker)

```
POST /api/applications/:jobId
```

**FormData:**

```
resume → file (.pdf)
```

Both uploads are processed via Cloudinary and stored as secure URLs.

---

# 🧪 Testing Checklist

## Backend

✔ Register / Login
✔ Create Job
✔ Upload Logo
✔ Apply Job (Resume)
✔ Accept / Reject Applicant
✔ Get All Jobs

## Frontend

✔ Routing
✔ Protected Routes
✔ File Uploads
✔ Dashboards (Employer & Jobseeker)
✔ Form Validation
✔ API Connectivity

---

# 🚀 Deployment

## Backend Deployment Options

* Render
* Railway
* DigitalOcean
* AWS EC2

## Frontend Deployment Options

* Vercel
* Netlify
* Cloudflare Pages

Ensure to set environment variables for production.

---

# 👨‍💻 Author

**Udith P**
Full-Stack Developer
Job Recruitment Platform — Production Ready

---

# 📜 License

This project is licensed for educational and personal portfolio use.


