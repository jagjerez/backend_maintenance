# API Usage Examples

Este documento proporciona ejemplos prácticos de cómo usar la API con autenticación OAuth2.

## 🔑 Obtener Token de Autenticación

Primero, necesitas obtener un token JWT del servidor OAuth2:

```bash
# Login en el servidor OAuth2
curl -X POST https://oauth2-application.vercel.app/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "tu_usuario",
    "password": "tu_password"
  }'
```

**Respuesta:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

## 🚀 Ejemplos de Uso de la API

### 1. Verificar Estado de la API

```bash
# Endpoint público - no requiere autenticación
curl -X GET http://localhost:3000/health
```

**Respuesta:**
```json
{
  "status": "ok",
  "timestamp": "2023-12-01T10:00:00.000Z",
  "uptime": 12345,
  "version": "1.0.0"
}
```

### 2. Verificar Token

```bash
# Verificar si un token es válido
curl -X POST http://localhost:3000/auth/verify-token \
  -H "Content-Type: application/json" \
  -d '{
    "token": "YOUR_JWT_TOKEN"
  }'
```

### 3. Obtener Perfil de Usuario

```bash
# Obtener información del usuario autenticado
curl -X GET http://localhost:3000/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Respuesta:**
```json
{
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "johndoe",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "roles": ["admin", "user"],
    "permissions": ["users:read", "users:create", "operations:read"]
  },
  "message": "Profile retrieved successfully"
}
```

## 📊 Operaciones CRUD

### Operations

#### Crear Operación (Requiere: admin/manager + operations:create)

```bash
curl -X POST http://localhost:3000/operations \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "text",
    "name": "Customer Name",
    "description": "Customer full name field",
    "internalCode": "123e4567-e89b-12d3-a456-426614174000",
    "companyId": "507f1f77bcf86cd799439011"
  }'
```

#### Listar Operaciones

```bash
curl -X GET "http://localhost:3000/operations?page=1&limit=10&search=customer" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Respuesta:**
```json
{
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "type": "text",
      "name": "Customer Name",
      "description": "Customer full name field",
      "internalCode": "123e4567-e89b-12d3-a456-426614174000",
      "companyId": "507f1f77bcf86cd799439011",
      "createdAt": "2023-12-01T10:00:00.000Z",
      "updatedAt": "2023-12-01T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

#### Obtener Operación por ID

```bash
curl -X GET http://localhost:3000/operations/507f1f77bcf86cd799439011?companyId=507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Actualizar Operación

```bash
curl -X PATCH http://localhost:3000/operations/507f1f77bcf86cd799439011?companyId=507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Customer Name",
    "description": "Updated description"
  }'
```

#### Eliminar Operación (Soft Delete)

```bash
curl -X DELETE http://localhost:3000/operations/507f1f77bcf86cd799439011?companyId=507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Users

#### Crear Usuario (Requiere: admin + users:create)

```bash
curl -X POST http://localhost:3000/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "password123",
    "name": "New User",
    "role": "user",
    "isActive": true,
    "companyId": "507f1f77bcf86cd799439011"
  }'
```

#### Listar Usuarios

```bash
curl -X GET "http://localhost:3000/users?page=1&limit=10&role=admin" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Cambiar Contraseña

```bash
curl -X PATCH http://localhost:3000/users/507f1f77bcf86cd799439011/change-password?companyId=507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "oldpassword",
    "newPassword": "newpassword123"
  }'
```

### Locations

#### Crear Ubicación

```bash
curl -X POST http://localhost:3000/locations \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "internalCode": "LOC-001",
    "name": "Main Office",
    "description": "Main office building",
    "icon": "building",
    "companyId": "507f1f77bcf86cd799439011"
  }'
```

#### Obtener Ubicaciones con Jerarquía

```bash
curl -X GET "http://localhost:3000/locations?page=1&limit=10&level=0" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Obtener Hijos de una Ubicación

```bash
curl -X GET http://localhost:3000/locations/507f1f77bcf86cd799439011/children?companyId=507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Integration Jobs

#### Crear Job de Integración

```bash
curl -X POST http://localhost:3000/integration-jobs \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "import",
    "status": "pending",
    "fileName": "users_import.csv",
    "fileUrl": "https://example.com/files/users_import.csv",
    "fileSize": 1024,
    "totalRows": 1000,
    "companyId": "507f1f77bcf86cd799439011"
  }'
```

#### Actualizar Progreso del Job

```bash
curl -X PATCH "http://localhost:3000/integration-jobs/507f1f77bcf86cd799439011/progress?companyId=507f1f77bcf86cd799439011&processedRows=500&successRows=450&errorRows=50&limitedRows=0" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Obtener Estadísticas de Jobs

```bash
curl -X GET http://localhost:3000/integration-jobs/stats?companyId=507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🔒 Manejo de Errores

### Error 401 - No Autorizado

```json
{
  "statusCode": 401,
  "message": "Token validation failed",
  "error": "Unauthorized"
}
```

**Solución:** Verificar que el token sea válido y esté incluido en el header Authorization.

### Error 403 - Prohibido

```json
{
  "statusCode": 403,
  "message": "Insufficient permissions",
  "error": "Forbidden"
}
```

**Solución:** Verificar que el usuario tenga los roles y permisos necesarios.

### Error 404 - No Encontrado

```json
{
  "statusCode": 404,
  "message": "Operation not found",
  "error": "Not Found"
}
```

**Solución:** Verificar que el ID del recurso sea correcto y que exista.

## 🧪 Testing con Postman

### Configuración de Postman

1. **Crear Environment:**
   - `base_url`: `http://localhost:3000`
   - `oauth2_url`: `https://oauth2-application.vercel.app`
   - `jwt_token`: `{{token}}`

2. **Pre-request Script para obtener token:**
```javascript
pm.sendRequest({
    url: pm.environment.get("oauth2_url") + "/api/login",
    method: 'POST',
    header: {
        'Content-Type': 'application/json'
    },
    body: {
        mode: 'raw',
        raw: JSON.stringify({
            username: "tu_usuario",
            password: "tu_password"
        })
    }
}, function (err, response) {
    if (response.json().access_token) {
        pm.environment.set("jwt_token", response.json().access_token);
    }
});
```

3. **Configurar Authorization:**
   - Type: Bearer Token
   - Token: `{{jwt_token}}`

## 📱 Testing con JavaScript/Fetch

```javascript
// Función para hacer requests autenticados
async function authenticatedRequest(url, options = {}) {
  const token = localStorage.getItem('jwt_token'); // Obtener token del storage
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
}

// Ejemplo de uso
try {
  const operations = await authenticatedRequest('http://localhost:3000/operations?page=1&limit=10');
  console.log(operations);
} catch (error) {
  console.error('Error:', error);
}
```

## 🔄 Renovación de Tokens

```javascript
// Función para renovar token automáticamente
async function refreshToken() {
  try {
    const response = await fetch('https://oauth2-application.vercel.app/api/refresh', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('refresh_token')}`,
      },
    });
    
    const data = await response.json();
    localStorage.setItem('jwt_token', data.access_token);
    return data.access_token;
  } catch (error) {
    // Redirigir al login
    window.location.href = '/login';
  }
}
```

## 📝 Notas Importantes

1. **Token Expiration**: Los tokens tienen tiempo de expiración limitado
2. **Rate Limiting**: Respeta los límites de rate del servidor
3. **Error Handling**: Siempre maneja los errores de autenticación
4. **Security**: Nunca expongas tokens en logs o consola
5. **HTTPS**: Usa HTTPS en producción para proteger los tokens

## 🔗 Recursos Adicionales

- [AUTHENTICATION.md](./AUTHENTICATION.md) - Guía detallada de autenticación
- [Swagger UI](http://localhost:3000/api) - Documentación interactiva
- [OAuth2 Server](https://oauth2-application.vercel.app/) - Servidor de autenticación
