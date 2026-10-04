# 🛕 DarshanEase - Temple Darshan Ticket Booking System

DarshanEase is a modern and user-friendly Temple Darshan Ticket Booking System built using the MERN Stack. It enables devotees to register, log in, browse temples, select darshan slots, book tickets online, view booking history, and manage their profiles through a responsive and intuitive interface.

---

## 🌐 Live Demo

### Frontend (Live Application)
https://my-mern-project-2-l413.onrender.com/

### GitHub Repository
https://github.com/YukthaSri-05/my-mern-project.git

---

## 📌 Features

### 👤 Devotee Features
- 🔐 User Registration & Login
- 🛕 Browse Available Temples
- 📍 View Temple Details
- ⏰ Select Darshan Slots
- 🎟️ Book Darshan Tickets
- 📋 View Booking History
- ⭐ Provide Feedback & Ratings
- 👤 Profile Management

### 🛕 Organizer Features
- 🔐 Organizer Login
- 📝 Manage Temple Information
- ⏰ Manage Darshan Slots
- 🎟️ Manage Bookings
- 🔔 Receive Booking Notifications

### 👨‍💼 Admin Features
- 👥 Manage Devotees
- 🛕 Manage Temples
- 👨‍💼 Manage Organizers
- 📊 View Reports & Analytics
- ⚙️ System Administration

---

## 🛠️ Tech Stack

### Frontend
- React.js
- JavaScript (ES6+)
- HTML5
- CSS3
- Bootstrap
- Axios
- React Router DOM
- Vite

### Backend
- Node.js
- Express.js

### Database
- MongoDB
- Mongoose

### Deployment
- Render

---

## 📂 Project Structure

```text
DarshanEase
│
├── client
│   ├── public
│   ├── src
│   │   ├── assets
│   │   ├── components
│   │   ├── pages
│   │   ├── services
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   ├── package.json
│   └── vite.config.js
│
├── server
│   ├── controllers
│   ├── models
│   ├── routes
│   ├── middleware
│   ├── config
│   ├── server.js
│   └── package.json
│
└── README.md
```

---

## ⚙️ Installation

### Clone the Repository

```bash
git clone https://github.com/your-github-username/darshanease.git
```

### Navigate to the Project Folder

```bash
cd darshanease
```

### Install Frontend Dependencies

```bash
cd client

npm install
```

### Install Backend Dependencies

```bash
cd ../server

npm install
```

---

## ▶️ Run the Application

### Start Backend Server

```bash
npm start
```

### Start Frontend

```bash
npm run dev
```

The application will run at:

```text
http://localhost:5173
```

---

## 🔗 API Configuration

Update the API URL in:

```text
src/services/api.js
```

Example:

```javascript
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

export default api;
```

---

## 📋 User Workflow

1. Register/Login
2. Browse Available Temples
3. Select a Temple
4. View Available Darshan Slots
5. Choose Preferred Slot
6. Book Darshan Ticket
7. Receive Booking Confirmation
8. View Booking History

---

## 🔐 Authentication & Security

- User Authentication
- Secure Login & Registration
- Protected Routes
- Session Management
- MongoDB Data Security

---

## 🚀 Future Enhancements

- 💳 Online Payment Gateway Integration
- 📱 Mobile Application
- 📧 Email Notifications
- 📲 SMS Alerts
- 🎫 QR Code Based Entry Pass
- 🌐 Multi-language Support
- 📊 Advanced Analytics Dashboard

---

## 📄 License

This project was developed for academic purposes as part of the MERN Stack Virtual Internship Program.

---



⭐ If you found this project useful, please consider giving it a star on GitHub.
