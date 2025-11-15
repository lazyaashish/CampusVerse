
CampusHub Backend - Updated for CampusVerse frontend
Generated: 2025-10-28T09:52:31.208338Z

Quick start:
1. unzip and cd into this folder
2. npm install
3. set environment variable JWT_SECRET (optional) and PORT (optional)
   e.g. export JWT_SECRET="supersecret" && export PORT=4000
4. npm start
5. The API will run on http://localhost:4000 by default

Available endpoints:
POST /api/auth/signup      -> {"username","password","name","role"}   (returns token)
POST /api/auth/login       -> {"username","password"}                (returns token)
GET  /api/events
GET  /api/notices
GET  /api/clubs
POST /api/complaints       -> requires Authorization: Bearer <token>
POST /api/feedback         -> requires Authorization
GET  /api/admin/pending    -> requires admin token
POST /api/admin/approve/:id-> requires admin token
POST /api/admin/reject/:id -> requires admin token
GET  /api/health           -> health check

Notes:
- Data is stored in JSON files under /data for simplicity. You can replace with a real DB later.
- A sample admin user exists: username: admin  password: password
  (The password 'password' is hashed; change in production)
- To integrate with the frontend, set API_BASE in the frontend to your backend base URL.
