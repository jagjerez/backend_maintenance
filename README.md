# Backend App Maintenance

A comprehensive NestJS backend application with MongoDB, file storage, cron jobs, and full CRUD operations with soft delete functionality.

## 🚀 Features

- **NestJS Framework** - Latest stable version with TypeScript
- **OAuth2 Authentication** - JWT token validation against external OAuth2 server
- **Role-based Authorization** - Granular permissions and roles system
- **MongoDB** - With Mongoose ODM for data persistence
- **File Storage** - MinIO for local development, Vercel for production
- **Environment Configuration** - Comprehensive environment variable management
- **Cron Jobs** - Environment-based scheduling (30s local, daily production)
- **Pagination** - Built-in pagination for all CRUD listings
- **Soft Delete** - Soft delete functionality for all entities
- **API Documentation** - Complete Swagger/OpenAPI documentation
- **Validation** - Class-validator for request validation
- **Password Hashing** - bcrypt for secure password storage

## 📋 Entities

### 1. Operations
- Type (enum: number, text, date, time, datetime, boolean)
- Name, description, internal code
- Company association

### 2. Locations
- Hierarchical structure with parent-child relationships
- Path tracking and level management
- Icon support and leaf node detection

### 3. Users
- Email, password (hashed), name, role
- User preferences (theme, language, notifications)
- Email verification and last login tracking

### 4. Integration Jobs
- Import/export/sync operations
- Progress tracking and error management
- File handling and status management

### 5. Companies
- Branding configuration (logo, colors, app name)
- Settings management (user registration, email verification)
- Theme support

### 6. Accounts
- Subscription association
- Company linking

### 7. Subscriptions
- Plan management with entity limits
- Settings per entity type

## 🛠️ Tech Stack

- **Framework**: NestJS 11.x
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **File Storage**: MinIO (local) / Vercel (production)
- **Validation**: class-validator, class-transformer
- **Documentation**: Swagger/OpenAPI
- **Scheduling**: @nestjs/schedule
- **Configuration**: @nestjs/config with Joi validation

## 📦 Installation

```bash
# Install dependencies
$ npm install

# Copy environment file
$ cp env.example .env

# Configure your environment variables
$ nano .env
```

## ⚙️ Environment Configuration

Create a `.env` file based on `env.example`:

```env
# Application
NODE_ENV=development
PORT=3000
APP_NAME=Backend App Maintenance
APP_VERSION=1.0.0

# Database
MONGODB_URI=mongodb://localhost:27017/backend_app_maintenance

# File Storage
STORAGE_TYPE=minio

# MinIO Configuration (for local development)
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET_NAME=app-maintenance
MINIO_USE_SSL=false

# Vercel Configuration (for production)
# VERCEL_ACCESS_TOKEN=your_vercel_access_token
# VERCEL_PROJECT_ID=your_vercel_project_id

# Cron Configuration
CRON_EXPRESSION=*/30 * * * * *

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=24h
```

## 🚀 Running the Application

```bash
# Development mode
$ npm run start:dev

# Production mode
$ npm run start:prod

# Debug mode
$ npm run start:debug
```

## 📚 API Documentation

Once the application is running, visit:
- **Swagger UI**: http://localhost:3000/api
- **API Base URL**: http://localhost:3000

## 🔐 Authentication

This application uses OAuth2 authentication with JWT tokens. All routes are protected by default.

### Getting Started with Authentication

1. **Get a token** from your OAuth2 server at https://oauth2-application.vercel.app/
2. **Include the token** in your requests:
   ```bash
   curl -X GET http://localhost:3000/operations \
     -H "Authorization: Bearer YOUR_JWT_TOKEN"
   ```

### Public Endpoints

- `GET /` - Application status
- `GET /health` - Health check
- `POST /auth/verify-token` - Verify JWT token

### Protected Endpoints

All other endpoints require authentication. See [AUTHENTICATION.md](./AUTHENTICATION.md) for detailed information.

## 🗄️ Database Setup

### MongoDB
Make sure MongoDB is running on your system:

```bash
# Using Docker
$ docker run -d -p 27017:27017 --name mongodb mongo:latest

# Or install MongoDB locally
# Follow instructions at https://docs.mongodb.com/manual/installation/
```

### MinIO (for local file storage)
```bash
# Using Docker
$ docker run -d -p 9000:9000 -p 9001:9001 --name minio \
  -e "MINIO_ROOT_USER=minioadmin" \
  -e "MINIO_ROOT_PASSWORD=minioadmin" \
  minio/minio server /data --console-address ":9001"
```

## 🧪 Testing

```bash
# Unit tests
$ npm run test

# E2E tests
$ npm run test:e2e

# Test coverage
$ npm run test:cov

# Watch mode
$ npm run test:watch
```

## 📁 Project Structure

```
src/
├── common/                 # Shared utilities and services
│   ├── interfaces/        # Common interfaces
│   ├── schemas/          # Base schemas
│   └── services/         # Shared services (pagination, file storage)
├── config/               # Configuration files
├── cron/                 # Cron job implementation
├── database/             # Database configuration
├── operations/           # Operations module
├── locations/            # Locations module
├── users/                # Users module
├── integration-jobs/     # Integration jobs module
├── companies/            # Companies module
├── accounts/             # Accounts module
├── subscriptions/        # Subscriptions module
├── app.module.ts         # Main application module
└── main.ts              # Application entry point
```

## 🔧 Available Scripts

- `npm run start` - Start the application
- `npm run start:dev` - Start in development mode with hot reload
- `npm run start:debug` - Start in debug mode
- `npm run start:prod` - Start in production mode
- `npm run build` - Build the application
- `npm run test` - Run unit tests
- `npm run test:e2e` - Run e2e tests
- `npm run test:cov` - Run tests with coverage
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## 🔐 Security Features

- **OAuth2 Integration** - JWT token validation against external OAuth2 server
- **Role-based Access Control** - Granular permissions and roles system
- **Global Authentication** - All routes protected by default
- **Password hashing** - bcrypt for secure password storage
- **Input validation** - class-validator for request validation
- **CORS configuration** - Secure cross-origin requests
- **Environment-based configuration** - Secure configuration management
- **Soft delete** - Data integrity with soft delete functionality

## 📊 Features by Module

### Operations Module
- CRUD operations for operation types
- Enum validation for operation types
- Company-based filtering

### Locations Module
- Hierarchical location management
- Parent-child relationships
- Path and level tracking
- Leaf node detection

### Users Module
- User management with roles
- Password hashing and validation
- User preferences management
- Email verification

### Integration Jobs Module
- Job status tracking
- Progress monitoring
- Error management
- File handling

### Companies Module
- Company branding management
- Settings configuration
- Theme support

### Accounts Module
- Subscription linking
- Company association

### Subscriptions Module
- Plan management
- Entity limits configuration
- Settings per entity

## 🚀 Deployment

### Local Development
1. Install dependencies: `npm install`
2. Set up MongoDB and MinIO
3. Configure environment variables
4. Run: `npm run start:dev`

### Production (Vercel)
1. Set up Vercel project
2. Configure environment variables in Vercel dashboard
3. Set `STORAGE_TYPE=vercel`
4. Deploy using Vercel CLI or GitHub integration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please open an issue in the repository.