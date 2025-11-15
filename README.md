# 🎓 CampusVerse  
A modern full-stack campus portal with events, notices, clubs, complaints, and feedback management.  
Built with a Node.js + Express backend and a static HTML/CSS/JS frontend served directly from the backend.

---

## 🚀 Features

### 🖥 Frontend
- Beautiful, modern dashboard UI  
- Dynamic loading:
  - Events  
  - Overview  
  - Notices  
  - Clubs  
  - Complaints  
  - Feedback  
- Automatic image loading using `data-img`  
- Easy manual image replacement (upload any event image directly)

### 🔥 Backend
- Node.js + Express API  
- JWT Authentication (Signup + Login)  
- JSON-based data storage  
- Students:
  - Submit complaints  
  - Submit feedback  
- Admin:
  - View pending complaints  
  - Approve / Reject complaints  
- Image Upload Route:
  - `/api/events/upload`  
  - Saves uploaded images to `frontend/assets/`  
- Fully enables CORS  
- Serves frontend automatically from backend

---

## 📁 Folder Structure

CampusVerse/
│
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── data/
│   │   ├── events.json
│   │   ├── users.json
│   │   ├── complaints.json
│   │   ├── feedback.json
│   │   └── notices.json
│
├── frontend/
│   ├── index.html
│   ├── dashboard.html
│   ├── assets/          # Upload event images here
│   ├── css/
│   └── js/
│       ├── app.js
│       └── image-loader.js
│
└── README.md

---

## 🛠 Installation

### 1. Clone the Repository
git clone https://github.com/lazyaashish/CampusVerse.git
cd CampusVerse

### 2. Install Backend Dependencies
cd backend
npm install

### 3. Start the Backend Server
node server.js

You should see:
Server ready on port 4000

### 4. Open the Website
Visit:
http://localhost:4000

Do NOT double-click index.html.

---

## 📸 Adding Event Images

Place event images into:
frontend/assets/

Example filenames:
techfest.jpg  
hackathon.jpg  
workshop.jpg  

Reference filenames in:
backend/data/events.json

---

## 📤 Upload Images via API (Optional)

POST /api/events/upload

Example using cURL:
curl -X POST http://localhost:4000/api/events/upload -F "image=@techfest.jpg"

---

## 🧪 Check Backend
Visit:
http://localhost:4000/api/health

---

## 💬 Credits
Developed by **Aashish Raj**
