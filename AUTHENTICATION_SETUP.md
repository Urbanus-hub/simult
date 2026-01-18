# Simult - Custom Authentication Setup

## Backend Setup Complete ✅

The backend has been set up with custom authentication while preserving the Socket.IO messaging functionality.

### What's Included:

1. **Authentication System**
   - JWT-based authentication
   - User registration and login
   - Token verification
   - Password hashing with bcrypt

2. **API Routes**
   - `/api/auth/register` - Register new user
   - `/api/auth/login` - Login user
   - `/api/auth/verify` - Verify JWT token
   - `/api/auth/me` - Get current user
   - `/api/users/profile` - Get/update user profile
   - `/api/users/` - List all users
   - `/api/users/:id` - Get/delete specific user
   - `/api/admin/stats` - Get admin statistics
   - `/api/admin/users` - Admin user management
   - `/api/admin/users/:id/role` - Update user role

3. **Socket.IO Messaging** (Preserved)
   - Real-time messaging functionality
   - WebSocket connections
   - Message broadcasting

4. **Middleware**
   - `authenticate` - JWT verification middleware
   - `authorize` - Role-based access control
   - Error handling middleware

### Getting Started:

1. **Configure Environment Variables**
   ```bash
   cd backend
   cp .env.example .env
   ```
   
   Edit `.env` and add your:
   - MongoDB URI
   - JWT secret key
   - Frontend URL (default: http://localhost:3000)

2. **Install Dependencies** (if needed)
   ```bash
   npm install
   ```

3. **Start MongoDB**
   Make sure MongoDB is running on your system

4. **Start Backend Server**
   ```bash
   npm run dev
   ```
   
   Server will run on http://localhost:5000

## Frontend Setup Complete ✅

The frontend has been updated with custom authentication, removing all Clerk dependencies.

### What's Included:

1. **Custom Auth Pages**
   - `/login` - Login form with validation
   - `/register` - Registration form with password confirmation

2. **Auth Context**
   - `AuthProvider` - Global authentication state
   - `useAuth` hook - Access user state and auth functions
   - Token management (cookies)
   - Auto token verification on app load

3. **API Client**
   - `/lib/api.ts` - Centralized API client
   - Auth endpoints (login, register, verify)
   - User endpoints (profile, users list)
   - Admin endpoints (stats, user management)
   - Automatic token injection in requests

4. **Middleware**
   - Protected route handling
   - Auto-redirect to login if not authenticated
   - Auto-redirect to dashboard if already logged in

### Getting Started:

1. **Configure Environment Variables**
   ```bash
   cd frontend
   cp .env.example .env.local
   ```
   
   The API URL defaults to http://localhost:5000/api

2. **Install Dependencies** (already done)
   ```bash
   npm install
   ```

3. **Start Frontend**
   ```bash
   npm run dev
   ```
   
   App will run on http://localhost:3000

## Testing the Authentication Flow:

1. Start the backend server
2. Start the frontend app
3. Navigate to http://localhost:3000/register
4. Create a new account
5. You'll be automatically logged in and redirected to /onboarding
6. Try logging out and logging back in at /login

## User Roles:

- **user** - Default role for new registrations
- **admin** - Full access to admin routes and user management

To create an admin user, you'll need to manually update the role in MongoDB or use the admin API endpoint.

## Socket.IO Messaging:

The WebSocket functionality remains intact. You can:
- Connect to ws://localhost:5000
- Emit "message" events
- Listen for "newMessage" events
- Access the "welcome" message on connection

## Security Notes:

- JWT tokens expire after 7 days
- Passwords are hashed with bcrypt (10 salt rounds)
- Tokens are stored in HTTP cookies
- CORS is configured for frontend URL
- Remember to change JWT_SECRET in production!
