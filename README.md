# Simult - Real-time Collaboration Tool

A web-based collaboration tool with real-time event updates, messaging, and room joining capabilities.

## Project Structure

```
simult/
├── frontend/          # Next.js frontend application
│   ├── app/          # Next.js app directory
│   ├── public/       # Static assets
│   └── package.json  # Frontend dependencies
│
└── backend/          # Express backend server
    ├── src/          # Source code
    └── package.json  # Backend dependencies
```

## Tech Stack

### Frontend
- **Next.js** - React framework
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **lucide-react** - Icons
- **WebSockets** - Real-time communication

### Backend
- **Express** - Web server
- **MongoDB** - Database
- **Mongoose** - ODM
- **WebSockets (ws)** - Real-time communication

## Getting Started

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

## Features (To Be Implemented)
- Real-time event updates
- Instant messaging
- Room creation and joining
- User collaboration features
