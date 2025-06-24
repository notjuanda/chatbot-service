# Chatbot Service - Gluten Free Home

Servicio de chatbot inteligente para Gluten Free Home, integrado con llama3 de Ollama y conectado a la base de datos principal del e-commerce.

## Características

- 🤖 **IA Inteligente**: Integración con llama3 de Ollama para respuestas contextuales
- 🔐 **Autenticación JWT**: Validación de usuarios autenticados contra la base de datos principal
- 🛡️ **Rate Limiting**: Protección contra abusos para usuarios no autenticados (10 mensajes/hora por IP)
- 📊 **Contexto de Productos**: Acceso a productos reales de la base de datos
- 💬 **Historial de Conversación**: Mantiene contexto de conversaciones por sesión
- 📱 **Escalación a WhatsApp**: Redirección automática para consultas complejas

## Configuración

### 1. Variables de Entorno

Copia el archivo `env.example` a `.env` y configura las variables:

```bash
# Configuración del servidor
NODE_ENV=development
PORT=3001

# Base de datos del chatbot
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=password
DB_NAME=chatbot_db

# Base de datos principal de GFHome
MAIN_DB_HOST=localhost
MAIN_DB_PORT=5432
MAIN_DB_USER=postgres
MAIN_DB_PASS=password
MAIN_DB_NAME=gfhome

# JWT Secret (debe ser el mismo que en el proyecto principal)
JWT_SECRET=tu_jwt_secret_super_seguro_aqui

# WhatsApp (opcional)
WHATSAPP_PHONE=+1234567890
WHATSAPP_MESSAGE=Hola, necesito ayuda con mi pedido
```

### 2. Instalación

```bash
yarn install
```

### 3. Ollama Setup

```bash
# Instalar Ollama (si no lo tienes)
# https://ollama.ai/

# Descargar y ejecutar llama3
ollama pull llama3
ollama run llama3

# Verificar que Ollama esté corriendo en http://localhost:11434
```

### 4. Base de Datos

```bash
# Crear base de datos del chatbot
createdb chatbot_db

# Ejecutar migraciones (si las hay)
yarn run migration:run
```

### 5. Ejecutar

```bash
# Desarrollo
yarn run start:dev

# Producción
yarn run start:prod
```

## API Endpoints

### POST /chat
Endpoint principal para enviar mensajes al chatbot.

**Usuarios Autenticados:**
- Requiere header `Authorization: Bearer <jwt_token>`
- Sin límite de mensajes
- Acceso completo a funcionalidades

**Usuarios No Autenticados:**
- Limitado a 10 mensajes por hora por IP
- Funcionalidad básica

**Ejemplo de Request:**
```json
{
  "message": "¿Qué productos sin gluten tienen?"
}
```

**Ejemplo de Response:**
```json
{
  "response": "¡Hola! Tenemos varios productos sin gluten...",
  "productos": [
    {
      "id": 1,
      "name": "Pan sin gluten",
      "price": 5.99
    }
  ],
  "remainingRequests": 9
}
```

### POST /chat/authenticated
Endpoint específico para usuarios autenticados (requiere JWT).

## Autenticación

El servicio valida usuarios contra la base de datos principal de GFHome:

1. **Verificación JWT**: Valida el token contra el secret configurado
2. **Validación de Usuario**: Verifica que el usuario existe en la base de datos
3. **Verificación de Roles**: Confirma que el usuario tiene rol de "cliente"
4. **Rate Limiting**: Solo aplica a usuarios no autenticados

## Rate Limiting

- **Usuarios Autenticados**: Sin límite
- **Usuarios No Autenticados**: 10 mensajes por hora por IP
- **Headers de Respuesta**: Incluye `remainingRequests` y `resetTime`

## Integración con Frontend

### Usuarios Autenticados
```javascript
const response = await fetch('/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    message: '¿Qué productos tienen?'
  })
});
```

### Usuarios No Autenticados
```javascript
const response = await fetch('/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    message: '¿Qué productos tienen?'
  })
});
```

## Estructura del Proyecto

```
src/
├── chat/                 # Módulo principal del chatbot
│   ├── chat.controller.ts
│   ├── chat.service.ts
│   ├── entities/         # Entidades de la base de datos
│   └── dto/             # Data Transfer Objects
├── users/               # Validación de usuarios
├── ai/                  # Integración con llama3 + Ollama
├── products/            # Acceso a productos
├── common/              # Servicios compartidos
│   ├── guards/          # Guards de autenticación
│   ├── services/        # Rate limiting, WhatsApp
│   └── jwt/            # Configuración JWT
└── config/             # Configuración de base de datos
```

## Desarrollo

### Comandos Útiles

```bash
# Ejecutar tests
yarn run test

# Ejecutar tests e2e
yarn run test:e2e

# Generar documentación Swagger
# Disponible en: http://localhost:3001/api
```

### Logs

El servicio registra:
- Validaciones de usuarios
- Rate limiting
- Errores de IA
- Conexiones a base de datos

## Seguridad

- ✅ Validación de JWT tokens
- ✅ Verificación de roles de usuario
- ✅ Rate limiting por IP
- ✅ Conexiones seguras a base de datos
- ✅ Sanitización de inputs

## Soporte

Para problemas o preguntas:
1. Revisar logs del servicio
2. Verificar configuración de variables de entorno
3. Confirmar conectividad con bases de datos
4. Validar JWT secret con el proyecto principal
5. Verificar que Ollama esté corriendo y el modelo llama3 esté disponible
