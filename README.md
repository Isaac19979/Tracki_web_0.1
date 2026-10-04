# 🔥 Mis Hábitos

App web para registrar hábitos diarios, semanales y mensuales y llevar la racha de cada uno.
Stack **MEAN** (MongoDB, Express, Angular, Node) con login de **Firebase Auth** (Google y correo/contraseña).

```
server/   API Express + TypeScript + Mongoose (puerto 3000)
client/   Angular 21 (puerto 4200)
```

## Cómo funciona la racha
- Cada vez que marcas un hábito se guarda el periodo: día (`2026-10-03`), semana ISO (`2026-W40`) o mes (`2026-10`).
- La racha cuenta los periodos **seguidos** cumplidos. Si el periodo actual aún no está marcado, la racha se mantiene
  (todavía estás a tiempo); si un periodo termina sin marcar, la racha vuelve a **0**.
- Se calcula con la zona horaria del navegador, así que "hoy" es tu día local.

## Requisitos
- Node.js 22.12+ (Angular 21)
- MongoDB local (`mongodb://localhost:27017/habits`) o un clúster gratuito de MongoDB Atlas
- Un proyecto de Firebase

## 1. Configurar Firebase
1. Crea un proyecto en <https://console.firebase.google.com>.
2. **Authentication → Método de inicio de sesión**: habilita **Google** y **Correo electrónico/contraseña**.
3. **Configuración del proyecto → Tus apps → Web (`</>`)**: registra una app y copia `apiKey`, `authDomain`,
   `projectId` y `appId` en `client/src/environments/environment.ts`.
4. **Configuración del proyecto → Cuentas de servicio → Generar nueva clave privada**: descarga el JSON y copia
   `project_id`, `client_email` y `private_key` en `server/.env` (ver paso 2).

## 2. Servidor
```bash
cd server
cp .env.example .env   # y rellena los valores de Firebase / MongoDB
npm install
npm run dev            # http://localhost:3000
npm test               # tests de la lógica de rachas
```

## 3. Cliente
```bash
cd client
npm install
npm start              # http://localhost:4200
```

## API
Todas las rutas requieren `Authorization: Bearer <ID token de Firebase>`; `X-Timezone` es opcional (UTC por defecto).

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/api/habits` | Lista de hábitos con `streak` y `doneThisPeriod` |
| POST | `/api/habits` | Crear `{ title, frequency: 'daily' \| 'weekly' \| 'monthly' }` |
| PATCH | `/api/habits/:id` | Editar título/frecuencia (cambiar la frecuencia reinicia la racha) |
| DELETE | `/api/habits/:id` | Eliminar |
| POST | `/api/habits/:id/toggle` | Marcar/desmarcar el periodo actual |
