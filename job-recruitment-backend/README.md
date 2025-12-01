# 🧩 Job Recruitment Backend — Complete API

A complete backend system for a modern **Job Recruitment Platform**, built using:

- **Node.js + Express**
- **MongoDB Atlas (Native Driver)**
- **JWT Authentication**
- **Cloudinary Uploads (Company Logo + Resume)**
- **Role-based Access (Employer / Jobseeker)**

This backend enables employers to post jobs, upload company logos, manage job applications, and accept/reject candidates.  
Jobseekers can browse jobs, upload resumes, apply to jobs, and track their applications.

---

## 🚀 Key Features

### 🔐 Authentication
- Register/Login using JWT
- Role-based access (Employer / Jobseeker)

### 💼 Job Management (Employer)
- Post new jobs
- Upload company logos
- Edit or delete jobs
- View job details
- Search jobs

### 📑 Applications
- Apply for jobs with resume upload (Cloudinary)
- Employer views all applications for their job
- Accept/Reject job applications
- Jobseeker views all jobs they applied to

### ☁️ Cloudinary Integration
- Secure company logo uploads
- Secure resume uploads (PDF)

### 🛡 Middleware
- JWT authentication
- Role-based authorization
- File upload middleware (memory storage)

### 📦 Database
- MongoDB Atlas using the Native Driver (No Mongoose)

---

## 📂 Folder Structure

```

job-recruitment-backend/
│
├── config/
│   ├── cloudinary.js
│   └── db.js
│
├── controllers/
│   ├── userController.js
│   ├── jobController.js
│   └── applicationController.js
│
├── middleware/
│   ├── authMiddleware.js
│   └── upload.js
│
├── routes/
│   ├── userRoutes.js
│   ├── jobRoutes.js
│   └── applicationRoutes.js
│
├── public/uploads/
│
├── server.js
├── package.json
├── .env
└── README.md

````

---

## ⚙️ Installation & Setup

### 1️⃣ Clone Repository
```bash
git clone https://github.com/your-username/job-recruitment-backend.git
cd job-recruitment-backend
````

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Configure Environment Variables

Create a `.env` file:

```
PORT=5000
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret_key

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### 4️⃣ Run Server

Development:

```bash
npm run dev
```

Production:

```bash
npm start
```

---

## 📬 API Endpoints

### 🔑 Authentication

| Method | Endpoint              | Description                 |
| ------ | --------------------- | --------------------------- |
| POST   | `/api/users/register` | Register Employer/Jobseeker |
| POST   | `/api/users/login`    | Login and get JWT           |

---

## 💼 Job Endpoints

| Method | Endpoint                | Description                |
| ------ | ----------------------- | -------------------------- |
| POST   | `/api/jobs`             | Create job (Employer only) |
| POST   | `/api/jobs/logo/:jobId` | Upload company logo        |
| GET    | `/api/jobs`             | Get all jobs               |
| GET    | `/api/jobs/:id`         | Get job by ID              |
| GET    | `/api/jobs/search`      | Search jobs                |
| PATCH  | `/api/jobs/:id`         | Update job                 |
| DELETE | `/api/jobs/:id`         | Delete job                 |

---

## 📑 Application Endpoints

| Method | Endpoint                         | Description                  |
| ------ | -------------------------------- | ---------------------------- |
| POST   | `/api/applications/:jobId`       | Apply to job (Resume upload) |
| GET    | `/api/applications/job/:jobId`   | Employer: view applications  |
| GET    | `/api/applications/user/:userId` | Jobseeker: view applied jobs |
| PATCH  | `/api/applications/:id/accept`   | Accept application           |
| PATCH  | `/api/applications/:id/reject`   | Reject application           |

---

## 🔐 Authentication Flow

1. Register as `jobseeker` or `employer`
2. Login and receive JWT token
3. Add token in Postman/Frontend:

   * **Authorization → Bearer Token**
4. Access protected routes

---

## 📤 File Uploads (Cloudinary)

### Company Logo Upload

```
POST /api/jobs/logo/:jobId
```

Form-data:

```
logo → file (png/jpg)
```

### Resume Upload

```
POST /api/applications/:jobId
```

Form-data:

```
resume → file (pdf)
```

---

## 📦 Dependencies

### Main

```
express
mongodb
bcryptjs
jsonwebtoken
dotenv
cloudinary
multer
cors
streamifier
```

### Dev

```
nodemon
```

---

## 🧪 Postman Checklist

✔ Register
✔ Login
✔ Create Job
✔ Upload Company Logo
✔ Search Jobs
✔ Apply to Job (resume)
✔ Employer View Applications
✔ Accept/Reject Application
✔ Jobseeker View Own Applications

---

## 👨‍💻 Author

**Udith P**
Job Recruitment Platform — Backend API
Built with ❤️ for production-ready performance.
