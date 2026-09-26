# Guía Paso a Paso: Despliegue 100% Gratuito de Accesorios PH

Para un catálogo local (con ~100 a 1.000 visitas al mes), la combinación más sólida, rápida y **100% gratuita (sin tarjeta de crédito)** es:
1. **Base de Datos**: [Neon.tech](https://neon.tech) (PostgreSQL en la nube gratis para siempre).
2. **Backend**: [Render.com](https://render.com) (Servicio web Node.js gratuito).
3. **Frontend**: [Vercel.com](https://vercel.com) (Alojamiento React ultra rápido con HTTPS gratis).

---

## Paso 1: Subir tu Código a GitHub

1. Crea una cuenta gratuita en [github.com](https://github.com) si aún no tienes una.
2. Crea un nuevo repositorio llamado: `accesorios-ph` (déjalo **Privado** o **Público** según prefieras).
3. Abre una terminal en la carpeta de tu proyecto y ejecuta:

```bash
cd "c:\Users\miguel jr\Desktop\pa vender\PH accesorio"

# Inicializar Git
git init
git add .
git commit -m "feat: plataforma Accesorios PH lista para producción"

# Conectar con tu repositorio de GitHub (cambia TU_USUARIO)
git branch -M main
git remote add origin https://github.com/TU_USUARIO/accesorios-ph.git
git push -u origin main
```

---

## Paso 2: Crear Base de Datos PostgreSQL Gratis en Neon.tech (1 minuto)

1. Ingresa a [neon.tech](https://neon.tech) e inicia sesión con tu cuenta de GitHub.
2. Haz clic en **"Create Project"**.
3. Nombra tu proyecto `accesorios-ph-db` y selecciona la región más cercana (ej. `US East (Ohio)` o `US East (N. Virginia)`).
4. En segundos te mostrará tu **Connection String** con formato:
   ```text
   postgresql://usuario:password@ep-xyz.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
5. **Copia esa URL**, la usarás en el backend.

---

## Paso 3: Desplegar el Backend en Render.com (Gratis)

1. Ingresa a [render.com](https://render.com) e inicia sesión con tu cuenta de GitHub.
2. En el panel principal, haz clic en **New +** y selecciona **"Web Service"**.
3. Elige tu repositorio `accesorios-ph` de GitHub.
4. Completa la configuración:
   * **Name**: `accesorios-ph-api`
   * **Region**: Oregon o Ohio
   * **Root Directory**: `backend`
   * **Environment**: `Node`
   * **Build Command**:
     ```bash
     npm install && npx prisma generate --schema=prisma/schema.postgresql.prisma && npx prisma migrate deploy --schema=prisma/schema.postgresql.prisma && npm run build
     ```
   * **Start Command**:
     ```bash
     npm run start
     ```
   * **Instance Type**: **Free** ($0 / month)

5. Ve a la sección **"Environment Variables"** y añade:
   * `DATABASE_URL`: *(Pega la URL de PostgreSQL que copiaste de Neon.tech)*
   * `NODE_ENV`: `production`
   * `JWT_SECRET`: *(Escribe una clave secreta larga de al menos 32 letras y números)*
   * `PORT`: `4000`
   * `CORS_ORIGIN`: `*` *(o luego la URL de tu frontend en Vercel)*

6. Haz clic en **"Create Web Service"**.
7. Render compilará tu API y te dará un enlace público seguro como:
   `https://accesorios-ph-api.onrender.com`

---

## Paso 4: Desplegar el Frontend en Vercel (Gratis y en 30 segundos)

1. Ingresa a [vercel.com](https://vercel.com) e inicia sesión con GitHub.
2. Haz clic en **"Add New..."** > **"Project"**.
3. Selecciona tu repositorio `accesorios-ph`.
4. En los ajustes del proyecto:
   * **Framework Preset**: `Vite`
   * **Root Directory**: Haz clic en *Edit* y selecciona la carpeta **`frontend`**.
   * **Build Command**: `npm run build`
   * **Output Directory**: `dist`
5. Abre la sección **"Environment Variables"** y añade:
   * `VITE_API_URL`: `https://accesorios-ph-api.onrender.com` *(la URL de tu backend en Render)*
6. Haz clic en **"Deploy"**.
7. En menos de 1 minuto tendrás tu tienda pública activa con dominio gratuito:
   `https://accesorios-ph.vercel.app`

---

## Paso 5: Crear el Usuario Administrador en Producción

Para crear tu usuario `admin` en la base de datos de producción:
1. En tu computadora local, edita temporalmente el archivo `backend/.env`:
   ```env
   DATABASE_URL="tu_url_de_neon_aqui"
   ```
2. Ejecuta el seeder:
   ```bash
   cd backend
   npx prisma db seed
   ```
3. ¡Listo! Tu tienda en vivo tendrá cargado el usuario:
   * **Usuario**: `admin`
   * **Contraseña**: `AdminPassword123!`
   *(Recuerda ingresar al panel y cambiar tu contraseña inmediatamente).*
