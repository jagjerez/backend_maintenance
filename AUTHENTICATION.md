# Authentication & Authorization Guide

Este documento explica cómo funciona el sistema de autenticación y autorización en la aplicación Backend App Maintenance.

## 🔐 Sistema de Autenticación

La aplicación utiliza un sistema de autenticación basado en JWT que se integra con tu servidor OAuth2 en Vercel.

### Servidor OAuth2

- **URL**: https://oauth2-application.vercel.app/
- **Tipo**: Servidor OAuth2 independiente
- **Protocolo**: JWT tokens

## 🛡️ Protección de Rutas

### Guard Global

Todas las rutas están protegidas por defecto usando el `GlobalAuthGuard`. Para hacer una ruta pública, usa el decorador `@Public()`.

```typescript
import { Public } from './auth/decorators/public.decorator';

@Get('health')
@Public()
getHealth() {
  return { status: 'ok' };
}
```

### Guards Disponibles

1. **JwtAuthGuard**: Verifica la validez del token JWT
2. **RolesGuard**: Verifica roles de usuario
3. **PermissionsGuard**: Verifica permisos específicos

### Decoradores de Autorización

#### Roles
```typescript
import { RequireRoles } from './auth/decorators/roles.decorator';

@Post()
@RequireRoles('admin', 'manager')
createUser() {
  // Solo usuarios con rol 'admin' o 'manager' pueden acceder
}
```

#### Permisos
```typescript
import { RequirePermissions } from './auth/decorators/permissions.decorator';

@Post()
@RequirePermissions('users:create', 'users:write')
createUser() {
  // Solo usuarios con estos permisos pueden acceder
}
```

## 🔑 Flujo de Autenticación

### 1. Obtener Token

El cliente debe obtener un token JWT del servidor OAuth2:

```bash
# Ejemplo de login
curl -X POST https://oauth2-application.vercel.app/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "usuario",
    "password": "password"
  }'
```

### 2. Usar Token en Requests

Incluir el token en el header `Authorization`:

```bash
curl -X GET http://localhost:3000/operations \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. Verificación del Token

El sistema verifica automáticamente el token contra el servidor OAuth2:

```typescript
// El AuthService hace esta verificación
const response = await fetch(`${oauth2ServerUrl}/api/verify-token`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});
```

## 📋 Estructura de Usuario

Basado en el esquema de tu servidor OAuth2, el usuario tiene esta estructura:

```typescript
interface User {
  _id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  roles: string[];
  appMetadata: {
    department?: string;
    level?: string;
    location?: string;
  };
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}
```

## 🎯 Ejemplos de Uso

### Controlador Protegido

```typescript
@ApiTags('Operations')
@Controller('operations')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@ApiBearerAuth('JWT-auth')
export class OperationsController {
  
  @Post()
  @RequireRoles('admin', 'manager')
  @RequirePermissions('operations:create')
  @ApiOperation({ summary: 'Create a new operation' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async create(@Body() createOperationDto: CreateOperationDto) {
    return this.operationsService.create(createOperationDto);
  }
}
```

### Endpoint Público

```typescript
@Controller()
export class AppController {
  
  @Get('health')
  @Public()
  @ApiOperation({ summary: 'Health check endpoint' })
  getHealth() {
    return { status: 'ok' };
  }
}
```

## 🔧 Configuración

### Variables de Entorno

```env
# OAuth2 Configuration
OAUTH2_SERVER_URL=https://oauth2-application.vercel.app

# JWT Configuration (para validación local)
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=24h
```

### Configuración en NestJS

```typescript
// config/configuration.ts
export default () => ({
  oauth2: {
    serverUrl: process.env.OAUTH2_SERVER_URL || 'https://oauth2-application.vercel.app',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
});
```

## 🚨 Manejo de Errores

### Errores de Autenticación

- **401 Unauthorized**: Token inválido o expirado
- **403 Forbidden**: Usuario sin permisos suficientes

### Respuestas de Error

```json
{
  "statusCode": 401,
  "message": "Token validation failed",
  "error": "Unauthorized"
}
```

```json
{
  "statusCode": 403,
  "message": "Insufficient permissions",
  "error": "Forbidden"
}
```

## 📚 Endpoints de Autenticación

### GET /auth/profile
Obtener perfil del usuario autenticado.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
{
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "johndoe",
    "email": "john.doe@example.com",
    "roles": ["user", "admin"],
    "permissions": ["users:read", "users:create"]
  },
  "message": "Profile retrieved successfully"
}
```

### POST /auth/verify-token
Verificar un token JWT.

**Body:**
```json
{
  "token": "YOUR_JWT_TOKEN"
}
```

**Response:**
```json
{
  "valid": true,
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "johndoe"
  },
  "message": "Token is valid"
}
```

### GET /auth/userinfo
Obtener información detallada del usuario.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

## 🔄 Flujo Completo

1. **Cliente** → Login en servidor OAuth2
2. **Servidor OAuth2** → Retorna JWT token
3. **Cliente** → Incluye token en requests a la API
4. **API** → Verifica token con servidor OAuth2
5. **API** → Verifica roles y permisos
6. **API** → Ejecuta operación si autorizado

## 🛠️ Desarrollo

### Testing con Postman

1. Obtener token del servidor OAuth2
2. Configurar header `Authorization: Bearer TOKEN`
3. Hacer requests a endpoints protegidos

### Testing con cURL

```bash
# Verificar token
curl -X POST http://localhost:3000/auth/verify-token \
  -H "Content-Type: application/json" \
  -d '{"token": "YOUR_JWT_TOKEN"}'

# Obtener perfil
curl -X GET http://localhost:3000/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 📝 Notas Importantes

1. **Token Expiration**: Los tokens tienen tiempo de expiración configurado
2. **Refresh Tokens**: Implementar renovación automática de tokens
3. **Rate Limiting**: Considerar límites de rate para verificación de tokens
4. **Caching**: Cachear información de usuario para mejorar performance
5. **Logging**: Registrar intentos de acceso no autorizados

## 🔗 Referencias

- [NestJS Authentication](https://docs.nestjs.com/security/authentication)
- [Passport.js](http://www.passportjs.org/)
- [JWT.io](https://jwt.io/)
- [OAuth2 Specification](https://tools.ietf.org/html/rfc6749)
