# Learning-Management-System
Full-stack Learning Management System with Node.js, MySQL, and vanilla JavaScript

# 🎓 LMS - Learning Management System

A full-stack Learning Management System built with Node.js, MySQL, and vanilla JavaScript.

## ✨ Features

- 🔐 User Authentication (Register/Login with JWT)
- 📚 Course Management (Create, View, Enroll)
- 📊 Progress Tracking (Mark lessons as complete)
- 🏆 Certificate Generation (Auto-generated on 100% completion)
- 📈 Dashboard with Statistics
- 👤 Multi-user Support

## 🛠️ Tech Stack

### Backend
- Node.js + Express.js
- MySQL Database
- JWT Authentication
- bcrypt for password hashing

### Frontend
- HTML5
- CSS3 (with animations)
- Vanilla JavaScript (ES6+)

## 📁 Project Structure
```
LMS-project/
├── backend/
│   ├── server.js          # Express server & API routes
│   ├── package.json       # Backend dependencies
│   └── node_modules/
├── frontend/
│   ├── index.html         # Main HTML page
│   ├── app.js             # Frontend JavaScript
│   └── styles.css         # Styling
└── README.md
```

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MySQL (v8 or higher)
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/LMS-Learning-Management-System.git
cd LMS-Learning-Management-System
```

### 2. Database Setup

**Create MySQL Database:**
```sql
CREATE DATABASE IF NOT EXISTS lms_database;
USE lms_database;

-- Run the schema.sql file to create tables
-- (Include your table creation SQL here)
```

### 3. Backend Setup
```bash
cd backend
npm install
```

**Update MySQL credentials in `server.js`:**
```javascript
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'YOUR_PASSWORD', // Change this
    database: 'lms_database',
    // ...
});
```

**Start backend server:**
```bash
npm run dev
# or
node server.js
```

Server runs on: `http://localhost:5000`

### 4. Frontend Setup
```bash
cd ../frontend
python -m http.server 8000
# or use Live Server in VS Code
```

Frontend runs on: `http://localhost:8000`

## 🎯 Usage

1. **Register** a new account
2. **Login** with your credentials
3. **Browse** available courses
4. **Enroll** in courses you're interested in
5. **Complete lessons** by clicking on them
6. **Earn certificates** when you complete all lessons
7. **Create courses** (if you want to teach)

## 🗄️ Database Schema

### Tables:
- **users** - User accounts
- **courses** - Course information
- **lessons** - Course lessons
- **enrollments** - User course enrollments
- **lesson_progress** - Lesson completion tracking
- **certificates** - Generated certificates

## 📸 Screenshots

(Add screenshots here later)

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token authentication
- Protected API routes
- SQL injection prevention with parameterized queries

## 🚧 Future Enhancements

- [ ] File uploads (profile pictures, course materials)
- [ ] Quiz system
- [ ] Discussion forums
- [ ] Email notifications
- [ ] Course ratings & reviews
- [ ] Search & filter functionality
- [ ] Responsive design improvements

## 👨‍💻 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/JJ1210-spec)

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Inspired by modern LMS platforms like Coursera and Udemy
