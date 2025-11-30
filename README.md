# Employee Attendance System

---

## 🚀 LIVE DEMO

<h2>🌐 <a href="https://employee-attendance-system-1-mhl2.onrender.com/">👉 CLICK HERE TO ACCESS THE APPLICATION 👈</a></h2>

### 🔗 Preview URL: https://employee-attendance-system-1-mhl2.onrender.com/

### 📝 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| **Manager** | `admin@company.com` | `admin123` |
| **Employee** | Register a new account | - |

> **⚠️ Note:** The application is hosted on Render's free tier. The server may take 30-60 seconds to wake up on first access.

---

A full-stack Employee Attendance Management System built with React, Node.js, Express, and PostgreSQL.

## 📋 Features

### Employee Features
- **Dashboard**: View today's attendance status, check-in/check-out, and attendance statistics
- **Check-in/Check-out**: One-click attendance marking with real-time status updates
- **Attendance History**: Calendar view with color-coded attendance (Present/Absent/Late/Half-day)
- **Profile**: View personal profile information

### Manager Features
- **Dashboard**: Team overview with charts showing attendance trends and work hours
- **All Employees**: View all employee attendance with filters (date range, employee search, status)
- **Team Calendar**: Visual calendar grid showing entire team's attendance at a glance
- **Reports**: Generate reports with date range selection and CSV export functionality
- **Profile**: View manager profile information

## 🛠 Tech Stack

### Frontend
- React 18 with TypeScript
- Vite (Build tool)
- Redux Toolkit (State management)
- React Router v6 (Routing)
- Chart.js & react-chartjs-2 (Charts)
- Axios (HTTP client)
- Moment.js (Date handling)
- FileSaver.js (CSV export)

### Backend
- Node.js with Express
- TypeScript
- Sequelize ORM
- PostgreSQL
- JWT Authentication
- bcryptjs (Password hashing)

## 📁 Project Structure

```
Employee Attendance System/
├── FrontEnd/
│   ├── src/
│   │   ├── components/       # Reusable components (Navbar, Layout)
│   │   ├── pages/           # Page components
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── EmployeeDashboard.tsx
│   │   │   ├── AttendanceHistory.tsx
│   │   │   ├── ProfilePage.tsx
│   │   │   ├── ManagerDashboard.tsx
│   │   │   ├── ManagerAllEmployees.tsx
│   │   │   ├── ManagerTeamCalendar.tsx
│   │   │   └── ManagerReports.tsx
│   │   ├── redux/           # Redux store and slices
│   │   ├── services/        # API services
│   │   └── styles/          # CSS styles
│   └── package.json
│
└── BackEnd/
    ├── src/
    │   ├── auth/            # Authentication module
    │   ├── Employee/        # Employee attendance module
    │   ├── Manager/         # Manager attendance module
    │   ├── DashBoard/       # Dashboard module
    │   ├── middleware/      # Auth middleware
    │   ├── models/          # Sequelize models
    │   └── index.ts         # App entry point
    └── package.json
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL database
- npm or yarn

### Backend Setup

1. Navigate to the BackEnd directory:
```bash
cd BackEnd
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with your database configuration:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=attendance_db
DB_USER=your_username
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret
PORT=5000
```

4. Start the development server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to the FrontEnd directory:
```bash
cd FrontEnd
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```env
VITE_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm run dev
```

5. Open http://localhost:3000 in your browser

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |

### Attendance (Employee)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/attendance/checkin` | Check in |
| POST | `/api/attendance/checkout` | Check out |
| GET | `/api/attendance/my-history` | Get attendance history |
| GET | `/api/attendance/my-summary` | Get attendance summary |
| GET | `/api/attendance/today` | Get today's status |

### Attendance (Manager)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/attendance/all` | Get all attendances |
| GET | `/api/attendance/employee/:id` | Get specific employee attendance |
| GET | `/api/attendance/summary` | Get team summary |
| GET | `/api/attendance/export` | Export to CSV |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/employee` | Get employee dashboard data |
| GET | `/api/dashboard/manager` | Get manager dashboard data |

## 🎨 Color Coding

The calendar uses color coding for attendance status:
- 🟢 **Green** - Present (on time)
- 🔴 **Red** - Absent
- 🟡 **Yellow** - Late (after 9:00 AM)
- 🟠 **Orange** - Half Day (less than 4 hours worked)

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (< 768px)

## 👥 User Roles

### Employee
- Can check-in and check-out
- View own attendance history
- View attendance statistics
- Access profile page

### Manager
- All employee capabilities
- View all employees' attendance
- Access team calendar view
- Generate and export reports
- View team statistics and charts

## 📊 Charts & Visualizations

- **Doughnut Chart**: Attendance distribution (Present/Late/Absent)
- **Line Chart**: Attendance trends over time
- **Bar Chart**: Employee work hours comparison

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Protected routes based on user roles
- Token expiration and validation

## 📄 License

MIT License - feel free to use this project for learning or commercial purposes.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request
