
<div align="center">
  <img src="assets/images/Jandrishti JD Logo.png" alt="JanDrishti Logo" width="150"/>
  <h1>JanDrishti</h1>
  <p><b>Public Issue Management System 🗳️</b></p>
  <p>
    A robust platform for citizens to report local issues and for authorities to manage and resolve them efficiently.
  </p>

  <!-- Badges -->
  <p>
    <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License: MIT">
    <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome">
    <img src="https://img.shields.io/github/stars/TusharKesarwani/Community_Issue_Tracker_Jandrishti_?style=social" alt="GitHub Stars">
    <img src="https://img.shields.io/github/forks/TusharKesarwani/Community_Issue_Tracker_Jandrishti_?style=social" alt="GitHub Forks">
  </p>
</div>

---

## 🌟 Project Overview

**JanDrishti** is a comprehensive Public Grievance Management System designed to bridge the communication gap between citizens and local authorities. The platform empowers users to report civic issues (e.g., potholes, garbage disposal, water leakage), upload supporting media, and track the status of their complaints in real-time. An intuitive admin dashboard allows authorities to view, categorize, and update the status of these issues, ensuring transparency and timely resolution.

---

## ✨ Key Features

| Feature                          | Description                                                                                                | Status      |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------- | ----------- |
| **👤 User Authentication**       | Secure registration and login for citizens.                                                                | ✅ Complete |
| **📝 Issue Reporting**           | Submit grievances with detailed descriptions, categories, and location data.                                 | ✅ Complete |
| **🖼️ Media Upload**              | Attach images or videos to provide clear evidence of the issue.                                            | ✅ Complete |
| **📊 Real-time Status Updates**   | Track the progress of reported issues from "Submitted" to "Resolved" via Socket.IO.                        | ✅ Complete |
| **👑 Admin Dashboard**           | A dedicated interface for authorities to manage, assign, and update the status of grievances.                | ✅ Complete |
| **📈 Issue Analytics**           | (Planned) Visual charts and statistics on issue types, resolution times, and department performance.       | ⏳ Planned  |
| **🔔 Notification System**       | (Planned) Email or in-app notifications for status changes.                                                | ⏳ Planned  |
| **✏️ Profile Management**         | Users can view their history of reported issues and manage their profile.                                  | ✅ Complete |

---

## 🛠️ Tech Stack

| Category | Technology |
|-------|-----------|
| **Frontend** | <img src="https://img.shields.io/badge/-React-61DAFB?logo=react&logoColor=white"> <img src="https://img.shields.io/badge/-Bootstrap%205-7952B3?logo=bootstrap&logoColor=white"> <img src="https://img.shields.io/badge/-Socket.io-010101?logo=socket.io&logoColor=white"> |
| **Backend** | <img src="https://img.shields.io/badge/-Node.js-339933?logo=node.js&logoColor=white"> <img src="https://img.shields.io/badge/-Express-000000?logo=express&logoColor=white"> |
| **Database** | <img src="https://img.shields.io/badge/-MongoDB-13aa52?style=for-the-badge&logo=mongodb&logoColor=white"> |
| **Authentication** | JWT (JSON Web Token) |
| **Deployment** | Azure (Planned) |                                                                                      |

---

## 🚀 Getting Started

Follow these instructions to set up the project locally.

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v14 or higher)
- [MySQL Server](https://dev.mysql.com/downloads/mysql/)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### ⚙️ Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/TusharKesarwani/Community_Issue_Tracker_Jandrishti_.git
    cd Community_Issue_Tracker_Jandrishti_
    ```

### 🖥️ Backend Setup

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Create a `.env` file** in the `jan-drishti/backend` directory and add the following environment variables.
    ```env
    # .env
    PORT=5000
    DB_HOST=your_database_host
    DB_USER=your_database_user
    DB_PASSWORD=your_database_password
    DB_NAME=your_database_name
    JWT_SECRET=a_strong_and_long_jwt_secret
    ```

4.  **Start the server:**
    ```bash
    npm start
    ```
    The backend server will be running at `http://localhost:5000`.

### 🌐 Frontend Setup (User & Admin)

The setup process is the same for both the `frontend-user` and `frontend-admin` applications.

1.  **Navigate to the frontend directory** (repeat for both `frontend-user` and `frontend-admin`):
    ```bash
    # For user frontend
    cd frontend-user
    # For admin frontend
    # cd frontend-admin
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Create a `.env` file** in the frontend directory and add the following:
    ```env
    # .env (for both frontend-user and frontend-admin)
    REACT_APP_API_BASE_URL=http://localhost:5000/api
    ```

4.  **Start the development server:**
    ```bash
npm start
Project Structure
├── frontend-admin/      # Admin dashboard interface
├── frontend-user/       # User interface for citizens
└── backend/        # Backend server

Default Admin Credentials
Username: admin

Password: admin123

License
This project is licensed under the MIT License.


