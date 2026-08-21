# 🎥 ClipShare

A modern full-stack video and screen recording application built with **React**, **TypeScript**, **Node.js**, **Express**, **MySQL**, **Docker** and **Tailwind CSS 4**.

Users can record their screen or webcam directly in the browser, upload recordings, manage their private video library and share videos through public links.

---

# ✨ Features

- 🔐 Secure authentication

  - JWT authentication
  - HTTP-only cookies
  - Password hashing with bcrypt

- 🎥 Browser recording

  - Screen recording
  - Webcam recording
  - Microphone support
  - System audio (browser support dependent)

- 📁 Video management

  - Upload videos
  - Edit title and description
  - Delete videos
  - Personal video library
  - Public share links

- 💾 MySQL database

  - User management
  - Video metadata
  - Automatic database initialization

- 🐳 Docker support

  - One-command startup
  - Automatic MySQL setup
  - Ready for GitHub

- 🎨 Modern UI
  - React
  - Tailwind CSS 4
  - Responsive layout
  - Dark mode

---

# 🛠 Tech Stack

## Frontend

- React
- React Router
- Vite
- Tailwind CSS 4

## Backend

- Node.js
- Express
- Multer
- bcrypt
- JWT

## Database

- MySQL 8
- mysql2

## DevOps

- Docker
- Docker Compose

---

# 📂 Project Structure

```text
.
├── client/                 React application
├── server/                 Express API
├── database/
│   └── init.sql            Database initialization
├── Dockerfile
├── docker-compose.yml
├── .env.example
└── README.md
```

---

# 🚀 Getting Started

## Requirements

- Docker Desktop

or

- Node.js 20+
- npm 10+
- MySQL 8

---

# 🐳 Running with Docker (Recommended)

Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/clipshare.git

cd clipshare
```

Create your environment file

```bash
cp .env.example .env
```

Start everything

```bash
docker compose up --build
```

That's it 🎉

Docker automatically starts

- MySQL
- Express API
- React development server

---

# 💻 Running without Docker

Install dependencies from the repository root

```bash
npm install
```

Create your environment file

```bash
cp .env.example .env
```

Start the application

```bash
npm run dev
```

---

# 🌐 URLs

Frontend

```
http://localhost:5173
```

Backend

```
http://localhost:3000
```

MySQL

```
localhost:3306
```

---

# 🗄 Database

The application automatically creates

- database
- tables
- indexes

during the first Docker startup using

```
database/init.sql
```

No manual SQL execution is required.

---

# 📦 Uploaded Files

Uploaded videos are stored in

```
server/uploads/
```

Only the video metadata is stored in MySQL.

---

# 🔐 Authentication

Authentication is implemented using

- JWT
- HTTP-only Cookies
- bcrypt password hashing

No passwords are stored in plain text.

---

# 📸 Browser Support

Supported browsers

- Chrome
- Edge
- Firefox
- Safari

Screen recording requires

- HTTPS

or

- localhost

depending on the browser.

---

# 📜 License

MIT License

---

Made with ❤️ using React, Node.js and Tailwind CSS.
