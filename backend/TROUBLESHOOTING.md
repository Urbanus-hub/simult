# Known Issues and Solutions

## TypeScript Errors with Mongoose ObjectId

### Issue
TypeScript shows errors for `mongoose.Types.ObjectId.isValid()` and `new mongoose.Types.ObjectId(string)`.

### Solutions

#### Option 1: Use mongoose.isValidObjectId (Recommended)
Replace all occurrences:
```typescript
// Before
if (!mongoose.Types.ObjectId.isValid(id)) { }

// After  
if (!mongoose.isValidObjectId(id)) { }
```

#### Option 2: Cast to any
```typescript
const objectId = new mongoose.Types.ObjectId(id) as any;
```

#### Option 3: Import from mongoose
```typescript
import { isValidObjectId, Types } from 'mongoose';

if (!isValidObjectId(id)) { }
const objectId = new Types.ObjectId(id) as any;
```

### Quick Fix
Run this in the backend directory:

```bash
# Replace all isValid calls
find src -name "*.ts" -exec sed -i 's/mongoose\.Types\.ObjectId\.isValid/mongoose.isValidObjectId/g' {} +

# For new ObjectId, cast is required:
# new mongoose.Types.ObjectId(id) as any
```

### Note
These are TypeScript type definition issues. The code will run correctly at runtime. The warnings don't affect functionality.

## Bcrypt Module Issue

If you encounter:
```
Error: Cannot find module 'bcrypt_lib.node'
```

### Solution
```bash
cd backend
npm rebuild bcrypt --build-from-source
```

Or switch to bcryptjs:
```bash
npm uninstall bcrypt
npm install bcryptjs @types/bcryptjs
```

Then update imports in `User.model.ts`:
```typescript
import bcrypt from 'bcryptjs';
```

## Email Service Not Working

### Issue
Emails not being sent in development.

### Solution
1. Configure SMTP settings in `.env`
2. For Gmail, use App Password (not regular password)
3. Enable 2FA first
4. Generate App Password at: https://myaccount.google.com/apppasswords

### Alternative
For development, emails are optional. The app works without email configuration.

## MongoDB Connection Issues

### Issue
```
MongooseServerSelectionError: connect ECONNREFUSED
```

### Solutions

**Local MongoDB:**
```bash
# macOS
brew services start mongodb-community

# Ubuntu
sudo systemctl start mongod

# Windows
net start MongoDB
```

**MongoDB Atlas:**
1. Whitelist your IP address
2. Check connection string format
3. Ensure user has proper permissions

## Port Already in Use

### Issue
```
Error: listen EADDRINUSE: address already in use :::5000
```

### Solution
```bash
# Find process using port 5000
lsof -i :5000  # macOS/Linux
netstat -ano | findstr :5000  # Windows

# Kill the process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows

# Or use different port in .env
PORT=5001
```

## Socket.IO Connection Issues

### Issue
WebSocket connection fails or doesn't authenticate.

### Solutions
1. Ensure token is passed in auth config:
```javascript
const socket = io(url, {
  auth: { token: 'your-token' }
});
```

2. Check CORS configuration
3. Verify JWT_SECRET matches between registration and validation

## Build Errors

### Issue
TypeScript compilation errors during build.

### Solution
```bash
# Clean and rebuild
rm -rf dist node_modules
npm install
npm run build
```

## Environment Variables Not Loading

### Issue
Configuration not being read from `.env` file.

### Solution
1. Ensure `.env` file exists in backend root
2. Check file is named exactly `.env` (not `.env.txt`)
3. Restart the development server after changes
4. Verify dotenv is installed: `npm install dotenv`

## Performance Issues

### Issue
Slow API responses or high memory usage.

### Solutions
1. Add database indexes (already configured in models)
2. Limit message pagination
3. Use Redis for session storage
4. Enable database query logging to find slow queries

## Common Development Tips

### Hot Reload Not Working
```bash
# Restart nodemon
npm run dev
```

### Clear MongoDB Data
```javascript
// In MongoDB shell
use simult
db.dropDatabase()
```

### Test API Endpoints
Use Thunder Client or Postman:
1. Register user
2. Copy JWT token from response
3. Add to Authorization header: `Bearer <token>`
4. Test protected endpoints

### Debug WebSocket
Enable Socket.IO debug mode:
```javascript
// In socket client
const socket = io(url, {
  auth: { token },
  debug: true
});
```

### View Logs
All logs are output to console with color coding:
- 🟢 Green: Success
- 🔵 Blue: Info
- 🟡 Yellow: Warning
- 🔴 Red: Error

## Getting Help

1. Check [SETUP_GUIDE.md](./SETUP_GUIDE.md)
2. Review [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
3. Check console logs for detailed error messages
4. Ensure all dependencies are installed
5. Verify environment configuration

## Production Checklist

Before deploying to production:

- [ ] Change JWT_SECRET to secure random string
- [ ] Configure production MongoDB (Atlas recommended)
- [ ] Set NODE_ENV=production
- [ ] Configure SMTP for production emails
- [ ] Enable HTTPS
- [ ] Set up proper CORS origins
- [ ] Add rate limiting
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy
- [ ] Test all endpoints
- [ ] Load test WebSocket connections
