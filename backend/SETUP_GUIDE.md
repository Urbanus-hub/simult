# Simult Backend - Setup & Installation Guide

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn
- Git

## 🚀 Quick Start

### 1. Clone and Install

```bash
cd backend
npm install
```

### 2. Environment Configuration

Create a `.env` file in the backend directory:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Frontend URL
FRONTEND_URL=http://localhost:3000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/simult

# JWT Secret (Generate a strong random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# SMTP Email (Optional - for invitations)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@simult.com
```

### 3. MongoDB Setup

#### Option A: Local MongoDB
```bash
# Install MongoDB (macOS)
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community

# Or run manually
mongod --config /usr/local/etc/mongod.conf
```

#### Option B: MongoDB Atlas (Cloud)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env`

### 4. Email Configuration (Optional)

For Gmail SMTP:

1. Enable 2-Factor Authentication
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Use app password in `SMTP_PASS`

For other providers:
- **SendGrid**: Use API with SMTP relay
- **Mailgun**: Get SMTP credentials from dashboard
- **AWS SES**: Configure SMTP settings

> **Note**: Email is optional. If not configured, invitations won't be sent but the app will work.

### 5. Start Development Server

```bash
npm run dev
```

Server will start at `http://localhost:5000`

### 6. Build for Production

```bash
npm run build
npm start
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   │   ├── database.ts  # MongoDB connection
│   │   └── env.ts       # Environment variables
│   ├── controllers/     # Request handlers
│   │   ├── auth.controller.ts
│   │   ├── room.controller.ts
│   │   ├── task.controller.ts
│   │   ├── message.controller.ts
│   │   └── invitation.controller.ts
│   ├── middleware/      # Express middleware
│   │   ├── auth.ts      # JWT authentication
│   │   └── errorHandler.ts
│   ├── models/          # Mongoose schemas
│   │   ├── User.model.ts
│   │   ├── Room.model.ts
│   │   ├── Task.model.ts
│   │   ├── Message.model.ts
│   │   └── Invitation.model.ts
│   ├── routes/          # API routes
│   │   ├── auth.routes.ts
│   │   ├── room.routes.ts
│   │   ├── task.routes.ts
│   │   ├── message.routes.ts
│   │   └── invitation.routes.ts
│   ├── services/        # Business logic
│   │   └── email.service.ts
│   ├── sockets/         # WebSocket handlers
│   │   └── index.ts
│   ├── utils/           # Utilities
│   │   └── logger.ts
│   └── server.ts        # Application entry point
├── .env.example         # Environment template
├── package.json
└── tsconfig.json
```

## 🔑 API Endpoints

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete API reference.

### Quick Reference

**Authentication:**
- `POST /api/auth/user/register` - Register
- `POST /api/auth/user/login` - Login
- `GET /api/auth/user/profile` - Get profile

**Rooms:**
- `POST /api/rooms` - Create room
- `GET /api/rooms` - Get user's rooms
- `GET /api/rooms/:id` - Get room details

**Tasks:**
- `POST /api/rooms/:roomId/tasks` - Create task
- `GET /api/rooms/:roomId/tasks` - Get room tasks
- `POST /api/tasks/:id/claim` - Claim task

**Messages:**
- `GET /api/messages/rooms/:roomId/messages` - Get room messages
- `POST /api/messages/rooms/:roomId/messages` - Send room message
- `GET /api/messages/direct/:userId` - Get direct messages

**Invitations:**
- `POST /api/invitations/send` - Send invitation
- `POST /api/invitations/accept/:token` - Accept invitation

## 🔌 WebSocket Connection

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:5000', {
  auth: {
    token: 'your-jwt-token'
  }
});

// Join a room
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

## 🧪 Testing

### Using Thunder Client / Postman

1. Import collection from `API_DOCUMENTATION.md`
2. Set base URL: `http://localhost:5000/api`
3. Register a user to get JWT token
4. Add token to Authorization header: `Bearer <token>`

### Test Flow

```bash
# 1. Register User
POST /api/auth/user/register
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123"
}

# 2. Create Room
POST /api/rooms
Authorization: Bearer <token>
{
  "name": "Test Room",
  "description": "Testing room"
}

# 3. Create Task
POST /api/rooms/<roomId>/tasks
{
  "title": "Test Task",
  "priority": "high"
}

# 4. Send Message (WebSocket preferred)
POST /api/messages/rooms/<roomId>/messages
{
  "content": "Hello World!"
}
```

## 🐛 Debugging

### Enable Debug Logs

```env
NODE_ENV=development
```

### Common Issues

**MongoDB Connection Error:**
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
Solution: Ensure MongoDB is running

**JWT Token Invalid:**
```
Error: Invalid token
```
Solution: Check JWT_SECRET matches, token not expired

**Socket Authentication Failed:**
```
Error: Authentication error: No token provided
```
Solution: Pass token in socket auth config

**Email Not Sending:**
```
Error: Failed to send email
```
Solution: Check SMTP configuration, use app password for Gmail

## 📦 Dependencies

### Production
- `express` - Web framework
- `socket.io` - WebSocket library
- `mongoose` - MongoDB ODM
- `jsonwebtoken` - JWT authentication
- `bcrypt` / `bcryptjs` - Password hashing
- `nodemailer` - Email service
- `cors` - CORS middleware
- `helmet` - Security headers
- `morgan` - HTTP logger
- `dotenv` - Environment variables

### Development
- `typescript` - Type safety
- `ts-node` - TypeScript execution
- `nodemon` - Auto-restart on changes
- `@types/*` - TypeScript definitions

## 🔒 Security Best Practices

1. **JWT Secret**: Use strong random string (32+ characters)
2. **MongoDB**: Use authentication in production
3. **CORS**: Configure allowed origins properly
4. **Rate Limiting**: Add rate limiting middleware (express-rate-limit)
5. **Input Validation**: Validate all user inputs
6. **HTTPS**: Use HTTPS in production
7. **Environment Variables**: Never commit `.env` file

## 🚀 Deployment

### Using Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

### Build and Run

```bash
docker build -t simult-backend .
docker run -p 5000:5000 --env-file .env simult-backend
```

### Deploy to Cloud

**Railway:**
```bash
railway login
railway init
railway up
```

**Render:**
- Connect GitHub repository
- Set build command: `npm install && npm run build`
- Set start command: `npm start`

**AWS/DigitalOcean:**
- Use PM2 for process management
- Set up Nginx as reverse proxy
- Configure SSL with Let's Encrypt

## 📊 Performance Tips

1. **Database Indexes**: Already configured in models
2. **Connection Pooling**: Mongoose handles automatically
3. **Caching**: Consider Redis for session/presence data
4. **Load Balancing**: Use Nginx or cloud load balancer
5. **Monitoring**: Add APM tools (New Relic, DataDog)

## 🤝 Contributing

1. Create feature branch
2. Make changes
3. Write tests
4. Submit pull request

## 📝 License

MIT License

## 🆘 Support

- Documentation: See `API_DOCUMENTATION.md`
- Issues: Create GitHub issue
- Email: support@simult.com

---

Happy coding! 🎉
