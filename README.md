# Simult - Real-Time Collaboration Platform

A comprehensive real-time collaboration platform featuring room-based messaging, direct messaging, task coordination, and presence management.

## 🌟 Features

### Core Features
- ✅ **Authentication System**: Secure JWT-based authentication with user profiles
- ✅ **Room Collaboration**: Create and manage collaboration rooms with members
- ✅ **Real-Time Messaging**: Room-based and direct messaging with WebSocket
- ✅ **Task Management**: Create, assign, and track tasks with real-time updates
- ✅ **Invitation System**: Email-based room invitations
- ✅ **Presence Tracking**: Real-time online/offline status for users
- ✅ **Typing Indicators**: See when others are typing
- ✅ **Message Reactions**: React to messages with emojis
- ✅ **Multi-Device Support**: Use from multiple devices simultaneously

## 📁 Project Structure

```
simult/
├── frontend/              # Next.js frontend application
│   ├── app/              # Next.js app directory
│   │   ├── (auth)/       # Authentication pages
│   │   ├── (dashboard)/  # Dashboard pages
│   │   └── onboarding/   # Onboarding flow
│   ├── components/       # Reusable components
│   ├── contexts/         # React contexts
│   ├── lib/              # Utilities
│   └── package.json      # Frontend dependencies
│
└── backend/              # Express backend server
    ├── src/
    │   ├── config/       # Configuration
    │   ├── controllers/  # Request handlers
    │   ├── middleware/   # Express middleware
    │   ├── models/       # Database models
    │   ├── routes/       # API routes
    │   ├── services/     # Business logic
    │   ├── sockets/      # WebSocket handlers
    │   └── server.ts     # Entry point
    ├── API_DOCUMENTATION.md
    ├── SETUP_GUIDE.md
    ├── IMPLEMENTATION_SUMMARY.md
    └── package.json      # Backend dependencies
```

## 🛠️ Tech Stack

### Frontend
- **Next.js 14+** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **Socket.IO Client** - Real-time communication
- **Axios** - HTTP client

### Backend
- **Node.js + TypeScript** - Runtime and language
- **Express.js** - Web framework
- **Socket.IO** - WebSocket library
- **MongoDB + Mongoose** - Database and ODM
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **Nodemailer** - Email service
- **Helmet** - Security headers

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# Start development server
npm run dev
```

Server runs at `http://localhost:5000`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
# Create .env.local and add:
# NEXT_PUBLIC_API_URL=http://localhost:5000
# NEXT_PUBLIC_WS_URL=http://localhost:5000

# Start development server
npm run dev
```

Frontend runs at `http://localhost:3000`

## 📖 Documentation

- **[Backend Setup Guide](./backend/SETUP_GUIDE.md)** - Detailed setup instructions
- **[API Documentation](./backend/API_DOCUMENTATION.md)** - Complete API reference
- **[Implementation Summary](./backend/IMPLEMENTATION_SUMMARY.md)** - Feature overview

## 🔑 API Overview

### REST Endpoints (47 total)
- **Authentication**: 7 endpoints (register, login, profile, etc.)
- **Rooms**: 10 endpoints (CRUD, members, ownership)
- **Tasks**: 11 endpoints (CRUD, claim, comments, checklist)
- **Messages**: 11 endpoints (room/DM, edit, reactions)
- **Invitations**: 8 endpoints (send, accept, manage)

### WebSocket Events (20+)
- Room events (join, leave, messages)
- Direct messaging
- Task updates
- Presence tracking
- Typing indicators

## 🔐 Authentication

JWT-based authentication with secure password hashing:

```javascript
// Register
POST /api/auth/user/register
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123"
}

// Login
POST /api/auth/user/login
{
  "email": "john@example.com",
  "password": "password123"
}

// Use token in subsequent requests
Authorization: Bearer <token>
```

## 💬 Real-Time Communication

WebSocket connection with authentication:

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:5000', {
  auth: { token: 'your-jwt-token' }
});

// Join room
socket.emit('join_room', roomId);

// Send message
socket.emit('room_message', {
  roomId: 'room-id',
  content: 'Hello!'
});

// Listen for messages
socket.on('room_message_received', (data) => {
  console.log('New message:', data.message);
});
```

## 🎯 Key Features Detail

### Room Collaboration
- Create private/public rooms
- Invite members via email
- Real-time messaging
- Member management
- Owner controls and permissions

### Task Management
- Create and assign tasks
- Claim/unclaim mechanism
- Priority levels and status tracking
- Comments and checklists
- Watch tasks for updates

### Messaging
- Room-based group chat
- Direct messaging
- Message editing and deletion
- Reactions and replies
- Read receipts
- Typing indicators

### Presence System
- Real-time online/offline status
- Custom status messages
- Multi-device support
- Last active tracking

## Features (To Be Implemented)
- Real-time event updates
- Instant messaging
- Room creation and joining
- User collaboration features
