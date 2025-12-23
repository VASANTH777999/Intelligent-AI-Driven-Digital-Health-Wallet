# 🏥 Digital Health Wallet

A comprehensive health management system that allows users to securely store, manage, and share their medical reports and track health vitals over time.

![Health Wallet](https://img.shields.io/badge/Status-Production%20Ready-success)
![React](https://img.shields.io/badge/React-18.2.0-blue)
![Node.js](https://img.shields.io/badge/Node.js-Express-green)
![SQLite](https://img.shields.io/badge/Database-SQLite-lightgrey)

## ✨ Features

### 📋 Health Reports Management
- **Upload Reports**: Drag-and-drop interface for uploading medical reports (PDF, JPG, PNG)
- **Report Metadata**: Store report type, date, and associated vitals
- **Search & Filter**: Advanced filtering by date range, report type, and vitals
- **Download**: Securely download your reports anytime
- **Delete**: Remove outdated reports

### 📊 Vitals Tracking
- **Record Vitals**: Track blood pressure, heart rate, blood sugar, temperature, and more
- **Trend Visualization**: Interactive charts showing vitals trends over time
- **Historical Data**: View all past readings in an organized table
- **Statistics**: Automatic calculation of min, max, and average values

### 🔐 Access Control & Sharing
- **Selective Sharing**: Share specific reports with doctors, family, or friends
- **User Search**: Find users by email to grant access
- **Access Management**: View and revoke granted access anytime
- **Received Reports**: Access reports shared with you by others
- **Expiration Dates**: Set optional expiration dates for shared access

### 🎨 Modern UI/UX
- **Colorful Design**: Vibrant gradients and modern color schemes
- **3D Animations**: Smooth transitions and hover effects
- **Glassmorphism**: Beautiful frosted glass effects
- **Responsive**: Works perfectly on desktop, tablet, and mobile
- **Dark Theme**: Eye-friendly dark mode interface

## 🛠️ Technology Stack

### Frontend
- **React 18.2** - Modern UI library
- **React Router** - Client-side routing
- **Recharts** - Interactive data visualization
- **Framer Motion** - Smooth animations
- **Axios** - HTTP client
- **Vite** - Fast build tool

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **SQLite** - Embedded database
- **JWT** - Authentication tokens
- **Bcrypt** - Password hashing
- **Multer** - File upload handling

## 📦 Installation & Setup

### Prerequisites
- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **Python** (v3.7 or higher) - For the launcher script

### Quick Start (One Command)

1. **Clone or download the project**

2. **Run the launcher script:**
   ```bash
   python 2careai.py
   ```

That's it! The script will:
- ✓ Check Node.js installation
- ✓ Install all dependencies
- ✓ Build the React frontend
- ✓ Start the Express backend
- ✓ Open your browser automatically

3. **Access the application:**
   ```
   http://localhost:5000
   ```

### Manual Setup (Alternative)

If you prefer to run manually:

#### Backend Setup
```bash
cd backend
npm install
node server.js
```

#### Frontend Setup (Development)
```bash
cd frontend
npm install
npm run dev
```

#### Frontend Build (Production)
```bash
cd frontend
npm run build
# Copy dist/ folder to backend/public/
```

## 📖 Usage Guide

### 1. Create Account
- Navigate to the registration page
- Enter your full name, email, and password
- Click "Create Account"

### 2. Login
- Use your email and password to login
- You'll be redirected to the dashboard

### 3. Upload Health Report
- Click "Upload Report" from the dashboard or navigation
- Drag and drop your file or click to browse
- Fill in report details (type, date, notes)
- Optionally add associated vitals
- Click "Upload Report"

### 4. Track Vitals
- Go to "Vitals" page
- Click "Add Vital"
- Use quick select or enter custom vital type
- Enter value, unit, and date
- View trends in interactive charts

### 5. Share Reports
- Go to "Sharing" page
- Click "Share Report"
- Select the report to share
- Search for user by email
- Optionally set expiration date
- Click "Grant Access"

### 6. View Shared Reports
- Go to "Sharing" page
- Click "Shared With Me" tab
- View and download reports shared by others

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Client Layer                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Web Browser  │  │    Mobile    │  │   WhatsApp   │  │
│  │              │  │   Browser    │  │  (Future)    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│                   Frontend (React)                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │Dashboard │ │  Upload  │ │ Reports  │ │  Vitals  │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐               │
│  │ Sharing  │ │   Auth   │ │   API    │               │
│  └──────────┘ └──────────┘ └──────────┘               │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│              Backend (Node.js/Express)                   │
│  ┌──────────────────────────────────────────────────┐  │
│  │              REST API Endpoints                   │  │
│  │  /api/auth  /api/reports  /api/vitals  /api/sharing│
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │     JWT      │  │    Multer    │  │   Business   │ │
│  │ Middleware   │  │File Handler  │  │    Logic     │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│                   Storage Layer                          │
│  ┌──────────────────────┐  ┌──────────────────────┐    │
│  │   SQLite Database    │  │  File System         │    │
│  │  - users             │  │  - uploads/          │    │
│  │  - health_reports    │  │    (PDF/Images)      │    │
│  │  - vitals            │  │                      │    │
│  │  - report_vitals     │  │                      │    │
│  │  - shared_access     │  │                      │    │
│  └──────────────────────┘  └──────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

## 🗄️ Database Schema

### Tables

#### users
- `id` - Primary key
- `email` - Unique user email
- `password_hash` - Bcrypt hashed password
- `full_name` - User's full name
- `created_at` - Account creation timestamp
- `updated_at` - Last update timestamp

#### health_reports
- `id` - Primary key
- `user_id` - Foreign key to users
- `report_type` - Type of report (Blood Test, X-Ray, etc.)
- `file_path` - Path to uploaded file
- `file_name` - Original filename
- `report_date` - Date of the report
- `uploaded_at` - Upload timestamp
- `notes` - Optional notes

#### vitals
- `id` - Primary key
- `user_id` - Foreign key to users
- `vital_type` - Type of vital (Blood Pressure, Heart Rate, etc.)
- `value` - Numeric value
- `unit` - Unit of measurement
- `recorded_at` - When the vital was recorded
- `notes` - Optional notes

#### report_vitals
- `id` - Primary key
- `report_id` - Foreign key to health_reports
- `vital_type` - Type of vital
- `value` - Numeric value
- `unit` - Unit of measurement

#### shared_access
- `id` - Primary key
- `owner_id` - Foreign key to users (report owner)
- `shared_with_id` - Foreign key to users (recipient)
- `report_id` - Foreign key to health_reports
- `access_level` - Access level (default: 'read')
- `granted_at` - When access was granted
- `expires_at` - Optional expiration date

## 🔒 Security Features

### Authentication
- **JWT Tokens**: Secure token-based authentication
- **Password Hashing**: Bcrypt with salt rounds
- **Token Expiration**: 24-hour token validity
- **Protected Routes**: Frontend and backend route protection

### File Upload Security
- **File Type Validation**: Only PDF, JPG, PNG allowed
- **File Size Limits**: Maximum 10MB per file
- **Filename Sanitization**: Unique filenames to prevent conflicts
- **Path Validation**: Prevents directory traversal attacks

### Access Control
- **Owner Verification**: Users can only access their own data
- **Shared Access Validation**: Permissions checked before access
- **Read-Only Enforcement**: Shared users cannot modify/delete
- **Expiration Support**: Time-limited access grants

### Data Protection
- **SQL Injection Prevention**: Parameterized queries
- **CORS Configuration**: Controlled cross-origin requests
- **Input Validation**: All user inputs sanitized
- **Error Handling**: Generic error messages (no data leakage)

## 📡 API Documentation

### Authentication Endpoints

#### POST /api/auth/register
Register a new user
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "securepassword"
}
```

#### POST /api/auth/login
Login user
```json
{
  "email": "john@example.com",
  "password": "securepassword"
}
```

#### GET /api/auth/me
Get current user profile (requires auth token)

### Reports Endpoints

#### POST /api/reports/upload
Upload health report (multipart/form-data, requires auth)

#### GET /api/reports
Get all user reports (requires auth)

#### GET /api/reports/:id
Get specific report (requires auth)

#### GET /api/reports/:id/download
Download report file (requires auth)

#### DELETE /api/reports/:id
Delete report (requires auth)

#### GET /api/reports/search/filter
Search reports with filters (requires auth)
- Query params: `startDate`, `endDate`, `reportType`, `vitalType`

### Vitals Endpoints

#### POST /api/vitals
Add vital reading (requires auth)

#### GET /api/vitals
Get all vitals with optional filters (requires auth)
- Query params: `startDate`, `endDate`, `vitalType`

#### GET /api/vitals/trends
Get vitals trends for charts (requires auth)
- Query params: `vitalType`, `startDate`, `endDate`

#### GET /api/vitals/types
Get list of tracked vital types (requires auth)

#### GET /api/vitals/summary
Get vitals statistics summary (requires auth)

### Sharing Endpoints

#### POST /api/sharing/grant
Grant access to report (requires auth)

#### GET /api/sharing/granted
Get list of access grants made by user (requires auth)

#### GET /api/sharing/received
Get reports shared with user (requires auth)

#### DELETE /api/sharing/:id
Revoke access (requires auth)

#### GET /api/sharing/users/search
Search users by email (requires auth)
- Query param: `email`

#### GET /api/sharing/report/:reportId/download
Download shared report (requires auth)

## 🚀 Deployment

### Production Considerations

1. **Environment Variables**
   - Change `JWT_SECRET` to a strong random string
   - Set appropriate `PORT` if needed

2. **Database**
   - For production, consider migrating to PostgreSQL or MySQL
   - Implement regular backups

3. **File Storage**
   - Migrate to cloud storage (AWS S3, Azure Blob, Google Cloud Storage)
   - Implement CDN for faster file delivery

4. **Security**
   - Enable HTTPS
   - Implement rate limiting
   - Add CSRF protection
   - Configure proper CORS origins

5. **Monitoring**
   - Add logging (Winston, Morgan)
   - Implement error tracking (Sentry)
   - Set up performance monitoring

## 📝 Project Structure

```
2Care/
├── backend/
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── reports.js
│   │   ├── vitals.js
│   │   └── sharing.js
│   ├── uploads/           # Uploaded files
│   ├── database.js
│   ├── server.js
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Navbar.css
│   │   │   └── ProtectedRoute.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── UploadReport.jsx
│   │   │   ├── Reports.jsx
│   │   │   ├── Vitals.jsx
│   │   │   ├── Sharing.jsx
│   │   │   └── [corresponding .css files]
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── 2careai.py             # Launcher script
└── README.md
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the ISC License.

## 👨‍💻 Author

Created as part of a health technology initiative to make health data management accessible and secure.

## 🙏 Acknowledgments

- React team for the amazing framework
- Express.js community
- All open-source contributors

## 📞 Support

For issues or questions, please create an issue in the repository.

---

**Made with ❤️ for better health management**
