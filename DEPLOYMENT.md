# Deployment Guide

This guide covers deploying the Backend App Maintenance application to different environments.

## 🏠 Local Development

### Prerequisites
- Node.js 18+ 
- MongoDB
- MinIO (for file storage)

### Setup Steps

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd backend_app_maintenance
   npm install
   ```

2. **Environment Configuration**
   ```bash
   cp env.example .env
   # Edit .env with your local settings
   ```

3. **Start Services**
   ```bash
   # MongoDB (Docker)
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   
   # MinIO (Docker)
   docker run -d -p 9000:9000 -p 9001:9001 --name minio \
     -e "MINIO_ROOT_USER=minioadmin" \
     -e "MINIO_ROOT_PASSWORD=minioadmin" \
     minio/minio server /data --console-address ":9001"
   ```

4. **Run Application**
   ```bash
   npm run start:dev
   ```

## ☁️ Production Deployment

### Vercel Deployment

1. **Prepare for Vercel**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Login to Vercel
   vercel login
   ```

2. **Environment Variables**
   Set these in Vercel dashboard:
   ```
   NODE_ENV=production
   MONGODB_URI=your_mongodb_atlas_uri
   STORAGE_TYPE=vercel
   VERCEL_ACCESS_TOKEN=your_vercel_token
   VERCEL_PROJECT_ID=your_project_id
   JWT_SECRET=your_jwt_secret
   CRON_EXPRESSION=0 0 * * * *
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Docker Deployment

1. **Create Dockerfile**
   ```dockerfile
   FROM node:18-alpine
   
   WORKDIR /app
   
   COPY package*.json ./
   RUN npm ci --only=production
   
   COPY . .
   RUN npm run build
   
   EXPOSE 3000
   
   CMD ["npm", "run", "start:prod"]
   ```

2. **Create docker-compose.yml**
   ```yaml
   version: '3.8'
   services:
     app:
       build: .
       ports:
         - "3000:3000"
       environment:
         - NODE_ENV=production
         - MONGODB_URI=mongodb://mongodb:27017/backend_app_maintenance
         - STORAGE_TYPE=minio
         - MINIO_ENDPOINT=minio
         - MINIO_PORT=9000
         - MINIO_ACCESS_KEY=minioadmin
         - MINIO_SECRET_KEY=minioadmin
         - MINIO_BUCKET_NAME=app-maintenance
         - MINIO_USE_SSL=false
         - JWT_SECRET=your_jwt_secret
         - CRON_EXPRESSION=0 0 * * * *
       depends_on:
         - mongodb
         - minio
   
     mongodb:
       image: mongo:latest
       ports:
         - "27017:27017"
       volumes:
         - mongodb_data:/data/db
   
     minio:
       image: minio/minio:latest
       ports:
         - "9000:9000"
         - "9001:9001"
       environment:
         - MINIO_ROOT_USER=minioadmin
         - MINIO_ROOT_PASSWORD=minioadmin
       volumes:
         - minio_data:/data
       command: server /data --console-address ":9001"
   
   volumes:
     mongodb_data:
     minio_data:
   ```

3. **Deploy with Docker**
   ```bash
   docker-compose up -d
   ```

### AWS Deployment

1. **EC2 Setup**
   ```bash
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install PM2
   npm install -g pm2
   
   # Install MongoDB
   wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
   echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
   sudo apt-get update
   sudo apt-get install -y mongodb-org
   ```

2. **Application Setup**
   ```bash
   # Clone and setup
   git clone <repository-url>
   cd backend_app_maintenance
   npm install
   npm run build
   
   # Configure environment
   cp env.example .env
   # Edit .env for production
   ```

3. **PM2 Configuration**
   ```bash
   # Create ecosystem file
   cat > ecosystem.config.js << EOF
   module.exports = {
     apps: [{
       name: 'backend-app-maintenance',
       script: 'dist/main.js',
       instances: 'max',
       exec_mode: 'cluster',
       env: {
         NODE_ENV: 'production',
         PORT: 3000
       }
     }]
   }
   EOF
   
   # Start with PM2
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

## 🔧 Environment-Specific Configurations

### Development
- Cron: Every 30 seconds
- Storage: MinIO local
- Logging: Verbose
- CORS: All origins

### Production
- Cron: Daily at midnight
- Storage: Vercel or AWS S3
- Logging: Error level
- CORS: Specific domains

### Staging
- Cron: Every hour
- Storage: MinIO or Vercel
- Logging: Info level
- CORS: Staging domains

## 📊 Monitoring and Health Checks

### Health Check Endpoint
```bash
curl http://localhost:3000/health
```

### Log Monitoring
```bash
# PM2 logs
pm2 logs backend-app-maintenance

# Docker logs
docker-compose logs -f app
```

### Database Monitoring
```bash
# MongoDB status
mongo --eval "db.stats()"

# MinIO status
curl http://localhost:9000/minio/health/live
```

## 🔒 Security Considerations

1. **Environment Variables**
   - Never commit `.env` files
   - Use strong JWT secrets
   - Rotate secrets regularly

2. **Database Security**
   - Use MongoDB authentication
   - Enable SSL/TLS
   - Restrict network access

3. **File Storage**
   - Use signed URLs for sensitive files
   - Implement proper access controls
   - Regular backup strategy

4. **API Security**
   - Rate limiting
   - Input validation
   - CORS configuration
   - HTTPS in production

## 🚨 Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   ```bash
   # Check MongoDB status
   sudo systemctl status mongod
   
   # Check connection string
   echo $MONGODB_URI
   ```

2. **MinIO Connection Failed**
   ```bash
   # Check MinIO status
   docker ps | grep minio
   
   # Test connection
   curl http://localhost:9000/minio/health/live
   ```

3. **Application Won't Start**
   ```bash
   # Check logs
   npm run start:dev
   
   # Check environment variables
   node -e "console.log(process.env)"
   ```

4. **Cron Jobs Not Running**
   ```bash
   # Check cron expression
   echo $CRON_EXPRESSION
   
   # Check application logs
   tail -f logs/application.log
   ```

## 📈 Performance Optimization

1. **Database Indexing**
   - Ensure proper indexes on frequently queried fields
   - Monitor query performance

2. **Caching**
   - Implement Redis for session storage
   - Cache frequently accessed data

3. **Load Balancing**
   - Use PM2 cluster mode
   - Implement reverse proxy (Nginx)

4. **File Storage**
   - Use CDN for static files
   - Implement file compression

## 🔄 Backup and Recovery

### Database Backup
```bash
# MongoDB backup
mongodump --uri="mongodb://localhost:27017/backend_app_maintenance" --out=./backup

# Restore
mongorestore --uri="mongodb://localhost:27017/backend_app_maintenance" ./backup/backend_app_maintenance
```

### File Storage Backup
```bash
# MinIO backup
mc mirror minio/app-maintenance ./backup/files

# Restore
mc mirror ./backup/files minio/app-maintenance
```

## 📞 Support

For deployment issues:
1. Check the logs first
2. Verify environment variables
3. Test database connectivity
4. Check service status
5. Open an issue with detailed information

