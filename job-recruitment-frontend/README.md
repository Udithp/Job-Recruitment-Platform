
# 💼 Job Recruitment Platform — Frontend

A modern, responsive frontend built with **React**, **Vite**, **Cloudinary**, and **JWT Authentication** for a full Job Recruitment System.  
It supports two user roles — **Employer** and **Jobseeker** — and connects seamlessly to the backend API for job postings, applications, resumes, and company logo uploads.

---

## 🚀 Features

### 👤 Authentication
- Login / Register with JWT
- Role-based UI (Employer / Jobseeker)
- Protected routes & auto-redirects

### 💼 Job Management (Employer)
- Create job postings
- Edit or delete jobs
- Upload company logos
- View and manage job applications
- Accept / Reject applicants

### 📑 Job Application System (Jobseeker)
- Browse all jobs
- Search & filter jobs
- View detailed job information
- Upload resume and apply
- Track applied jobs

### 🖼 UI & Assets
- Modern, clean UI using React + CSS
- All company logos stored in `/public/assets`
- Reusable components (Navbar, JobCard, ProtectedRoute, etc.)

### 📡 API Integration
- Axios API layer (`/src/api/api.js`)
- Fully connected with backend JWT routes
- Automatic token injection

---

## 📂 Project Structure

```

job-recruitment-frontend/
│
├── public/
│   └── assets/
│       ├── Accenture.png
│       ├── Amazon.png
│       ├── Blackrock.png
│       ├── Cognizant.png
│       ├── Flipkart.png
│       ├── Google.png
│       ├── HCL.png
│       ├── HP.png
│       ├── IBM.png
│       ├── Infosys.png
│       ├── JP.Morgan.png
│       ├── Meesho.png
│       ├── Meta.png
│       ├── Microsoft.png
│       ├── NVIDIA.png
│       ├── Oracle.png
│       ├── Tata Consultancy.png
│       ├── TechMahindra.png
│       └── Wipro.png
│
├── src/
│   ├── api/
│   │   └── api.js
│   │
│   ├── components/
│   │   ├── ApplicationsList.jsx
│   │   ├── AuthBackground.jsx
│   │   ├── CertificateUpload.jsx
│   │   ├── JobCard.jsx
│   │   ├── MarksForm.jsx
│   │   ├── Navbar.jsx
│   │   ├── ProfileImageUpload.jsx
│   │   └── ProtectedRoute.jsx
│   │
│   ├── context/
│   │   └── AuthContext.jsx
│   │
│   ├── pages/
│   │   ├── Apply.jsx
│   │   ├── ApplyJob.jsx
│   │   ├── EditJob.jsx
│   │   ├── EmployerDashboard.jsx
│   │   ├── Home.jsx
│   │   ├── JobApplications.jsx
│   │   ├── JobDetails.jsx
│   │   ├── Jobs.jsx
│   │   ├── JobseekerDashboard.jsx
│   │   ├── Login.jsx
│   │   ├── PostJob.jsx
│   │   ├── Profile.jsx
│   │   └── Register.jsx
│   │
│   ├── utils/
│   │   └── filterJobs.js
│   │
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   ├── main.jsx
│   └── .env
│
├── index.html
├── package.json
├── vite.config.js
└── README.md

````

---

## 🛠️ Technologies Used

- **React 18**
- **Vite**
- **React Router**
- **Axios**
- **Cloudinary uploads (images & resumes)**
- **JWT authentication**
- **Native CSS**
- **Context API for global state management**

---

## 🔧 Setup & Installation

### 1️⃣ Clone the repository
```bash
git clone https://github.com/your-username/job-recruitment-frontend.git
cd job-recruitment-frontend
````

### 2️⃣ Install dependencies

```bash
npm install
```

### 3️⃣ Create `.env` file in the root

```
VITE_API_URL=http://localhost:5000/api
```

> Change to your deployed backend URL in production

### 4️⃣ Run the development server

```bash
npm run dev
```

### 5️⃣ Build for production

```bash
npm run build
```

---

## 🔐 Authentication Logic

* Token stored in `localStorage`
* `AuthContext.jsx` manages:

  * user data
  * token
  * login/logout state
* `ProtectedRoute.jsx` prevents unauthenticated users from accessing pages
* Token automatically attached in every request in `api.js`

---

## 📤 File Uploads

### Resume Upload

* Jobseekers upload PDF resumes through Cloudinary

### Company Logo Upload

* Employers upload logos (PNG/JPG)
* Stored in Cloudinary & served via secure CDN

---

## 📡 Connecting Frontend to Backend

All API requests use:

```
/src/api/api.js
```

Example:

```js
api.post("/jobs", formData, {
  headers: { Authorization: `Bearer ${token}` }
});
```

---

## 🖼 UI Pages Overview

### ⭐ Public Pages

* Home
* Jobs
* Job Details
* Login
* Register

### 👤 Jobseeker Pages

* Apply Job
* My Applications
* Profile
* Dashboard

### 🏢 Employer Pages

* Post Job
* Edit Job
* Employer Dashboard
* Application Review Page

---

## 🧪 Testing Checklist

### ✔ UI Tests

* Navbar routing
* Protected routes redirect correctly
* Assets load correctly
* Form validations

### ✔ API Tests

* Login/Register works
* Job posting works
* Resume upload works
* Logo upload works
* Application accept/reject works

---

## 📦 Production Deployment

You can deploy this frontend to:

* **Vercel**
* **Netlify**
* **Render**
* **Cloudflare Pages**
* **AWS Amplify**

Just ensure `VITE_API_URL` points to your backend URL.

---

## 👨‍💻 Author

**Udith P**
Frontend of the Job Recruitment Platform
Crafted with React, Vite

---

## 📝 License

This project is fully open-source and available for personal & academic use.
