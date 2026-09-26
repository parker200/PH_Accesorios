# Accesorios PH 📱✨

Plataforma web de catálogo de accesorios de celular (auriculares, cargadores, cables, USB y adaptadores, fundas) con panel de administración y cálculo inteligente de promociones en tiempo real.

Diseñada con **Arquitectura Limpia (Clean Layered Architecture)**, principios SOLID, alta cohesión, desacoplamiento y estética minimalista inspirada en el lenguaje visual de Apple.

---

## 🎨 Paleta de Marca ("Acessorio PH")
- **Negro** `#140F0C`: Logo, encabezados y textos principales
- **Blanco** `#F1F1F2`: Fondos de página y contrastes limpios
- **Gris claro** `#DBDCE1`: Degradados sutiles, bordes y tarjetas
- **Azul cielo** `#98C1DA`: Color de acento, badges de ofertas y elementos activos

---

## 🏛️ Arquitectura del Sistema

### 1. Backend (Node.js + Express + TypeScript)
- **Rutas y Controladores (`src/modules/**`)**: Recepción de solicitudes HTTP y emisión de respuestas estandarizadas.
- **Validación**: Esquemas con **Zod** en middleware para `body`, `query` y `params`.
- **Servicios (`*.service.ts`)**: Reglas de negocio puras, lógica de precedencia de promociones y cálculo de descuentos.
- **Repositorios (`*.repository.ts`)**: Acceso a datos con **Prisma ORM**.
- **Capa de Almacenamiento Abstracta (`IStorageService`)**:
  - Implementación actual: `LocalStorageAdapter` (con verificación real de MIME types y límites).
  - Extensible a AWS S3 o Cloudinary cambiando únicamente la instancia en `src/shared/storage/index.ts`.
- **Seguridad**: Hasheo de contraseñas con `bcryptjs`, tokens `JWT`, encabezados `helmet`, CORS configurable y `express-rate-limit` en `/api/auth/login`.

### 2. Frontend (React 18 + TypeScript + Vite)
- **Catálogo Público**:
  - Hero minimalista estilo Apple.
  - Buscador en tiempo real y filtrado dinámico por categorías con contador.
  - Ficha de producto interactiva con galería de fotos, reproductor de **video corto en bucle (máx. 5 seg)** con selector de audio y visualización de descuentos.
  - Botón de pedido directo por **WhatsApp** con mensaje pre-rellenado y precio calculado.
- **Panel de Administración**:
  - Acceso seguro para administrador (`admin` / `AdminPassword123!`).
  - Gestión completa de perfil: cambio de nombre de usuario y contraseña con confirmación de credencial anterior.
  - CRUD dinámico de categorías (con protección ante eliminación de categorías con productos).
  - CRUD de productos con carga de múltiples imágenes (JPG/PNG) y videos de 5 segundos con validación de duración previa en el cliente.
  - Motor de promociones por producto o por categoría con rango de fechas de vigencia y **lista de exclusiones/excepciones**.

---

## 🚀 Requisitos Previos

- **Node.js** v18 o superior (probado en v22)
- **npm** v9 o superior

---

## 🛠️ Instalación y Puesta en Marcha en Local

### 1. Clonar o acceder a la carpeta del proyecto
```bash
cd "c:/Users/miguel jr/Desktop/pa vender/PH accesorio"
```

### 2. Configurar y Levantar el Backend
```bash
cd backend
npm install

# Ejecutar migraciones automáticas versionadas
npx prisma migrate dev --name init

# Poblar la base de datos con datos de muestra y el usuario admin inicial
npm run prisma:seed

# Iniciar el servidor en modo desarrollo
npm run dev
```
El backend estará disponible en: **`http://localhost:4000`**

### 3. Configurar y Levantar el Frontend
En otra terminal:
```bash
cd frontend
npm install

# Iniciar servidor de desarrollo de Vite
npm run dev
```
El frontend estará disponible en: **`http://localhost:5173`**

---

## 🔑 Credenciales de Administrador por Defecto

- **Usuario**: `admin`
- **Contraseña**: `AdminPassword123!`
- **URL de Login**: `http://localhost:5173/admin/login`

*(Una vez dentro, el administrador puede cambiar su nombre de usuario y contraseña en la sección "Mi Perfil").*

---

## 🧪 Ejecución de Tests

El proyecto incluye tests unitarios para la lógica de cálculo de promociones y tests de integración para las rutas críticas:
```bash
cd backend
npm test
```
Resultados de las pruebas:
- `✓ PromotionsService - Pricing Calculation Engine`:
  - Cálculo de precio original sin promociones
  - Aplicación de descuento por categoría
  - Respeto a la lista de exclusiones de la categoría
  - Precedencia de promoción de producto sobre promoción de categoría
- `✓ Integration Tests - Critical Endpoints`:
  - `GET /api/health` (Estado saludable)
  - `GET /api/categories` (Listado de categorías)
  - `GET /api/products` (Cálculo dinámico de precios en backend)
  - `POST /api/auth/login` (Rechazo de credenciales erróneas y emisión de JWT)

---

## 📦 Base de Datos: SQLite (Local) y PostgreSQL (Producción)

Para permitir una ejecución local inmediata sin requerir la instalación de servicios externos, el backend utiliza SQLite con Prisma. 

Para migrar a **PostgreSQL** en producción:
1. En `backend/prisma/schema.prisma`, sustituir `provider = "sqlite"` por `provider = "postgresql"` (se incluye el archivo de referencia `schema.postgresql.prisma`).
2. Configurar en `.env`:
   ```env
   DATABASE_URL="postgresql://usuario:password@localhost:5432/accesorios_ph?schema=public"
   ```
3. Ejecutar: `npx prisma migrate deploy`
