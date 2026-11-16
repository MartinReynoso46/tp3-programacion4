# TP3 – Gestión de vehículos, conductores y viajes

Trabajo Práctico N.º 3 de **Programación IV** (UTN FRLR).
Aplicación para registrar vehículos, conductores y viajes de una empresa de transporte.

## Tecnologías

| Parte | Tecnologías |
| --- | --- |
| Backend | Node.js + Express, MySQL (`mysql2`), `express-validator`, JWT (`jsonwebtoken`), Passport (`passport-jwt`), bcrypt |
| Frontend | Vite + React (JavaScript), React Router, `fetch`, CSS puro |

## Estructura

```
tp3_programacion_IV/
├── backend/
│   ├── config/        # conexión a MySQL y estrategia de Passport
│   ├── middleware/    # autenticación JWT y manejo de errores de validación
│   ├── routes/        # auth, vehículos, conductores y viajes
│   ├── http/          # archivos .http para probar la API
│   ├── database.sql   # definición de tablas
│   └── index.js       # punto de entrada del servidor
└── frontend/
    └── src/
        ├── pages/     # Home, Login, Vehículos, Conductores y Viajes
        ├── api.js     # cliente fetch con el token JWT
        └── validaciones.js
```

## Puesta en marcha

### 1. Base de datos

Crear la base y las tablas:

```bash
mysql -u root -p < backend/database.sql
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env   # completar DB_PASSWORD y JWT_SECRET
npm run dev
```

Variables de entorno:

```
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=flota
JWT_SECRET=cambiar_este_secreto
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

La API se consume por defecto en `http://localhost:3000/api`. Se puede cambiar con
`VITE_API_URL` (ver `frontend/.env.example`).

## Funcionalidad

- Página principal pública.
- Registro e inicio de sesión con contraseñas hasheadas (bcrypt) y JWT que expira a las 4 horas.
- Rutas CRUD de vehículos, conductores y viajes protegidas con Passport.
- Alta, modificación y eliminación de vehículos y conductores.
- Registro de viajes asociando un vehículo y un conductor.
- Historial de viajes filtrable por vehículo y/o conductor.
- Total de kilómetros recorridos según el filtro aplicado.

## Validaciones

Se validan en el frontend y en el backend (con `express-validator`):

- **Nombre y apellido (conductores y usuarios):** solo letras, sin números.
- **Número de documento (DNI):** solo números, entre 7 y 9 dígitos.
- **Capacidad de carga:** obligatoria y no puede ser negativa.
- **Kilómetros:** obligatorios y no pueden ser negativos.
- **Patente:** formato `ABC123` o `AB123CD`.
- **Fechas:** el vencimiento de la licencia debe ser posterior al alta; la llegada del viaje no puede ser anterior a la salida.
- **Email:** formato válido y único.
- **Contraseña:** mínimo 6 caracteres.

## Endpoints

| Método | Ruta | Descripción |
| --- | --- | --- |
| POST | `/api/auth/register` | Registro de usuario |
| POST | `/api/auth/login` | Inicio de sesión (devuelve el JWT) |
| GET | `/api/vehiculos` | Listar vehículos (`?q=` búsqueda opcional) |
| GET | `/api/vehiculos/:id` | Obtener un vehículo |
| POST | `/api/vehiculos` | Crear vehículo |
| PUT | `/api/vehiculos/:id` | Actualizar vehículo |
| DELETE | `/api/vehiculos/:id` | Eliminar vehículo |
| GET | `/api/conductores` | Listar conductores (`?q=` búsqueda opcional) |
| GET | `/api/conductores/:id` | Obtener un conductor |
| POST | `/api/conductores` | Crear conductor |
| PUT | `/api/conductores/:id` | Actualizar conductor |
| DELETE | `/api/conductores/:id` | Eliminar conductor |
| GET | `/api/viajes` | Historial (`?vehiculo_id=` y/o `?conductor_id=`) |
| GET | `/api/viajes/:id` | Obtener un viaje |
| POST | `/api/viajes` | Registrar viaje |
| PUT | `/api/viajes/:id` | Actualizar viaje |
| DELETE | `/api/viajes/:id` | Eliminar viaje |

Todas las rutas de vehículos, conductores y viajes requieren
`Authorization: Bearer <token>`.

## Pruebas de la API

En la carpeta `backend/http/` hay un archivo por recurso (`auth.http`, `vehiculos.http`,
`conductores.http`, `viajes.http`). Sirven con la extensión **REST Client** de VS Code.
