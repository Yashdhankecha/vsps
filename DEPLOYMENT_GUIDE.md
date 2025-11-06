# 🚀 Samaj Portal Deployment Guide

## Pre-Deployment Checklist

### ✅ Backend Requirements
- [ ] Node.js v16+ installed
- [ ] MongoDB connection established
- [ ] Environment variables configured
- [ ] All npm dependencies installed

### ✅ Frontend Requirements
- [ ] React 18+ environment
- [ ] Vite build system
- [ ] TailwindCSS configured
- [ ] All npm dependencies installed

## 🔧 Installation Steps

### 1. Backend Setup
```bash
cd server
npm install
```

### 2. Frontend Setup
```bash
cd client
npm install
```

### 3. Environment Configuration
Ensure your `.env` file includes:
```env
JWT_SECRET=your_jwt_secret_here
MONGO_URI=your_mongodb_connection_string
NODE_ENV=production
```

## 🗄️ Database Migration

### Existing Users Update
Run this MongoDB command to update existing users:
```javascript
// In MongoDB shell or MongoDB Compass
db.users.updateMany(
  { role: { $exists: false } },
  { $set: { role: 'user' } }
);
```

### Schema Validation
Verify the User model includes the correct roles:
```javascript
// Check this in your User.js model
role: { type: String, enum: ['user', 'admin'], default: 'user' }
```

## 🚦 Testing Deployment

### 1. Start Backend Server
```bash
cd server
npm start
```

### 2. Start Frontend Development Server
```bash
cd client
npm run dev
```

### 3. Access Points
- **User Interface**: http://localhost:5173/
- **Admin Panel**: http://localhost:5173/admin/dashboard
- **API Endpoint**: http://localhost:3000/api

## 🧪 Post-Deployment Testing

### User Role Testing
1. **Create Test Accounts**:
   - Regular user: test-user@example.com
   - Admin: admin@example.com

2. **Test Authentication**:
   ```bash
   # Test user login
   curl -X POST http://localhost:3000/api/auth/login \\n     -H \"Content-Type: application/json\" \\n     -d '{\"email\":\"test-user@example.com\",\"password\":\"password123\"}'
   ```

3. **Test Role Access**:
   - Login as user → Should access only user routes
   - Login as admin → Should access all routes

### Admin Functionality Testing
1. **User Management**: Test role changes work
2. **Access Controls**: Ensure proper authorization

## 🔒 Security Verification

### Authentication Tests
- [ ] JWT tokens are properly validated
- [ ] Role-based access control works
- [ ] Protected routes deny unauthorized access
- [ ] Session management functions correctly

### Authorization Tests
- [ ] Admin routes blocked for non-admins
- [ ] API endpoints respect role permissions

## 📊 Performance Monitoring

### Key Metrics to Monitor
- API response times
- Database query performance
- Memory usage
- User session management
- Error rates

### Monitoring Commands
```bash
# Check server status
curl http://localhost:3000/api/health

# Monitor logs
tail -f server/logs/application.log

# Check database connections
netstat -an | grep 3000
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Role Access Denied
**Symptoms**: \"Access denied\" errors
**Solution**: 
- Check user role in database
- Verify JWT token contains role
- Ensure middleware is applied correctly

#### 2. Database Connection Issues
**Symptoms**: \"User not found\" errors
**Solution**:
- Verify MongoDB connection string
- Check database name and collections
- Ensure User model is properly defined

### Debug Commands
```bash
# Check user roles in database
mongo
use your_database_name
db.users.find({}, {username: 1, email: 1, role: 1})

# Verify JWT token content
# Use JWT.io to decode tokens and check role field

# Check server logs
cd server && npm run dev
# Look for authentication/authorization errors
```

## 📝 Production Deployment

### Build Frontend
```bash
cd client
npm run build
```

### Environment Variables
```env
# Production .env
NODE_ENV=production
JWT_SECRET=strong_production_secret
MONGO_URI=mongodb_production_url
PORT=3000
```

### PM2 Process Management
```bash
# Install PM2
npm install -g pm2

# Start backend with PM2
cd server
pm2 start server.js --name \"samaj-portal-api\"

# Monitor processes
pm2 status
pm2 logs
```

### Nginx Configuration
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /path/to/client/dist;
        try_files $uri $uri/ /index.html;
    }

    # API routes
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🎯 Success Indicators

### Deployment Success
- [ ] All role types can login successfully
- [ ] Admin dashboard loads without errors
- [ ] Booking management system works
- [ ] Award management functions correctly
- [ ] Admin can manage users
- [ ] All routes respect authorization rules

### Performance Success
- [ ] Page load times < 2 seconds
- [ ] API responses < 500ms
- [ ] No memory leaks detected
- [ ] Error rate < 1%

## 📞 Support Contacts

- **Technical Issues**: Check server logs and database connections
- **User Access Problems**: Verify roles in admin panel
- **Feature Requests**: Document for future development cycles

---

**Deployment Status**: 🟢 Ready for Production
**Last Updated**: [Current Date]
**Version**: 2.1.0 - Simplified Role System Release