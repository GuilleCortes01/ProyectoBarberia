# Urban Barber Studio

Sistema demo premium para barberia con React, Tailwind, Express, Prisma y SQLite local.

## Incluye

- Landing page moderna y responsive.
- Login y registro de clientes.
- Reserva de turnos con validacion de horarios ocupados.
- Asignacion automatica cuando el cliente elige cualquier barbero disponible.
- Panel administrador con resumen del dia, reservas, calendario, barberos y servicios.
- Base local SQLite con Prisma ORM, sin servicios externos ni instalaciones extra.
- Datos demo listos para vender o mostrar.

## Estructura

```txt
ProyectoBarberia/
  client/        React + Tailwind
  server/        Express + Prisma + SQLite local
  .env.example
```

## Puesta en marcha

```bash
npm install
copy .env.example server\.env
npm run db:init
npm run dev
```

Frontend: http://localhost:5173  
Backend: http://localhost:4000/api/health

## Usuarios demo

- Admin: `admin@urbanbarber.com` / `admin123`
- Cliente: `cliente@demo.com` / `cliente123`

## Base de datos

La demo usa SQLite en `server/prisma/dev.db`. Ese archivo se genera con `npm run db:init` y no se sube a GitHub.

Tablas: `users`, `barbers`, `services`, `appointments`, `barber_availability`, `business_info`.

La tabla `appointments` guarda cliente, barbero asignado, servicio, fecha, hora, estado, si eligio cualquier barbero y fecha de creacion. Tiene una restriccion unica por `barberId + date + time` para impedir doble reserva con el mismo barbero.

## Endpoints principales

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Publico

- `GET /api/public/bootstrap`

### Cliente

- `GET /api/appointments/availability?date=YYYY-MM-DD&serviceId=ID&barberId=ID`
- `GET /api/appointments/mine`
- `POST /api/appointments`
- `PATCH /api/appointments/:id/cancel`

### Admin

- `GET /api/admin/appointments?date=YYYY-MM-DD&barberId=ID`
- `GET /api/admin/summary?date=YYYY-MM-DD`
- `PATCH /api/admin/appointments/:id/status`
- `GET|POST /api/admin/barbers`
- `PUT|DELETE /api/admin/barbers/:id`
- `GET|POST /api/admin/services`
- `PUT|DELETE /api/admin/services/:id`
