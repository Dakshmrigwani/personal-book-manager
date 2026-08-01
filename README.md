# Personal Book Manager (Bookleaf)

A full-stack personal book management web application to catalog books, track reading status (`want-to-read`, `reading`, `completed`, `dnf`), assign custom tags, rate books, and manage reading goals with server-side database persistence.

---

## Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router, Turbopack) & React 19
- **Language**: TypeScript
- **Styling**: Vanilla CSS, TailwindCSS, Shadcn UI primitives
- **Icons**: Lucide React
- **API Communication**: Custom HTTP client (`apiFetch`) with JWT token storage (`localStorage`)

### Backend
- **Runtime**: Node.js & Express
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT Access & Refresh tokens
- **Validation**: Zod schema validation
- **Email Service**: Nodemailer (SMTP)
- **Tooling**: Biome, Vitest

---

## Setup Instructions

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB database (local or MongoDB Atlas cluster)
- SMTP email provider credentials (e.g. Gmail App Password)

### Environment Variables

#### 1. Server Environment Variables (`server/.env`)
Copy `server/.env.example` to `server/.env` and provide your credentials:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/personal-book-manager
JWT_SECRET=your_jwt_secret_key
JWT_ACCESS_EXPIRATION_MINUTES=30
JWT_REFRESH_EXPIRATION_DAYS=30
JWT_RESET_PASSWORD_EXPIRATION_MINUTES=10
JWT_VERIFY_EMAIL_EXPIRATION_MINUTES=10
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com
FRONTEND_URL=http://localhost:3000
```

#### 2. Client Environment Variables (`client/.env.local`)
Create `client/.env.local` if custom backend URL is required:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/v1
```

---

## Installation & Run Commands

### 1. Backend Server Setup
```bash
cd server
npm install
npm run dev
```
The server will run on `http://localhost:5000` (API base path `/v1`).

### 2. Frontend Client Setup
```bash
cd client
npm install
npm run dev
```
The client will run on `http://localhost:3000`.

---

## API Endpoints List

All API routes are mounted under `/v1`.

### 🔐 Authentication (`/v1/auth`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/v1/auth/register` | Register a new user and send verification email | No |
| `POST` | `/v1/auth/login` | Log in with email and password | No |
| `POST` | `/v1/auth/logout` | Log out and invalidate refresh token | No |
| `POST` | `/v1/auth/refresh-tokens` | Refresh access & refresh tokens | No |
| `POST` | `/v1/auth/forgot-password` | Send password reset token email | No |
| `POST` | `/v1/auth/reset-password` | Reset user password using token | No |
| `POST` | `/v1/auth/send-verification-email` | Send email verification token | Yes |
| `POST` | `/v1/auth/verify-email` | Verify user email using token | No |

### 📚 Books (`/v1/books`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/v1/books` | Create a new book entry | Yes |
| `GET` | `/v1/books` | Query paginated books (filters: `search`, `status`, `tag`, `page`, `limit`) | Yes |
| `GET` | `/v1/books/stats` | Get aggregated book statistics by read status | Yes |
| `GET` | `/v1/books/:bookId` | Fetch single book by ID | Yes |
| `PATCH` | `/v1/books/:bookId` | Update book details by ID | Yes |
| `DELETE` | `/v1/books/:bookId` | Delete book by ID | Yes |

### 🏷️ Tags (`/v1/tags`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/v1/tags` | Create a new tag | Yes |
| `GET` | `/v1/tags` | List user tags (filters: `name`, `page`, `limit`) | Yes |
| `GET` | `/v1/tags/:tagId` | Fetch single tag by ID | Yes |
| `PATCH` | `/v1/tags/:tagId` | Update tag by ID | Yes |
| `DELETE` | `/v1/tags/:tagId` | Delete tag by ID | Yes |

### 👤 User & Profile (`/v1/user`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/v1/user/profile` | Fetch profile details of logged-in user | Yes |
| `PATCH` | `/v1/user/profile` | Update profile details of logged-in user | Yes |
| `POST` | `/v1/user` | Create user (Admin only) | Yes (Admin) |
| `GET` | `/v1/user` | Query paginated users (Admin only) | Yes (Admin) |
| `GET` | `/v1/user/:userId` | Get user by ID (Admin only) | Yes (Admin) |
| `PATCH` | `/v1/user/:userId` | Update user by ID (Admin only) | Yes (Admin) |
| `DELETE` | `/v1/user/:userId` | Delete user by ID (Admin only) | Yes (Admin) |
