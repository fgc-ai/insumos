# Despliegue en hosting cPanel (sin Docker, sin SSH)

Este proyecto corre normalmente con Docker, pero cPanel compartido no soporta
Docker. En su lugar se usa **Setup Node.js App** (Passenger) de cPanel: un
solo proceso Node que sirve la API (`/api/*`) y el frontend compilado
(todo lo demás) desde el mismo puerto. Por eso el backend ahora sirve
también los archivos estáticos de `backend/public` (ver `backend/src/index.js`).

## Paquete listo para subir

Ya generado en:
```
C:\Users\fgacitua\AppData\Local\Temp\claude\R--Inventario-Impresoras\27f48748-bc30-4971-9e71-3a92e328d9b9\scratchpad\inventario-app-cpanel.zip
```
Contiene: `package.json`, `src/` (backend) y `public/` (frontend ya compilado).
No incluye `node_modules` ni la base de datos: se generan en el servidor.

## Pasos en cPanel

### 1. Crear la app Node en "Setup Node.js App"
- cPanel → **Setup Node.js App** → **Create Application**.
- **Node.js version:** la LTS más nueva disponible (20 o 22).
- **Application mode:** Production.
- **Application root:** un nombre de carpeta, ej. `inventario-app`
  (cPanel la crea dentro de tu home, fuera de `public_html`).
- **Application URL:** `inventario.braincomputer.cl` (el subdominio ya creado).
- **Application startup file:** `src/index.js`
- Click **Create**.

### 2. Subir el código
- **File Manager** → entra a la carpeta `inventario-app` (el Application root).
- Borra los archivos placeholder que cPanel puso ahí (`app.js`, etc.).
- Sube `inventario-app-cpanel.zip` y usa **Extract** sobre ese archivo
  (debe quedar `package.json`, `src/` y `public/` directamente dentro de
  `inventario-app`, no dentro de una subcarpeta extra).

### 3. Variables de entorno
- Vuelve a **Setup Node.js App** → abre la app → sección **Environment variables**:
  - `JOTFORM_API_KEY` = tu API key (opcional, solo si usarás la sincronización con JotForm)
  - `JOTFORM_FORM_ID` = `262813892867069` (opcional, igual que arriba)
- **No** definas `PORT`: Passenger lo asigna solo y el código ya usa `process.env.PORT`.

### 4. Instalar dependencias y arrancar
- En la misma pantalla de la app, click **Run NPM Install**.
- Luego **Restart**.
- Abre `https://inventario.braincomputer.cl` en el navegador: deberías ver
  la app, y `https://inventario.braincomputer.cl/solicitar` debería cargar
  el formulario público.

## Notas importantes

- **Datos:** se guardan en `inventario-app/data/inventory.db` (se crea
  solo al primer arranque). Haz backups periódicos descargando esa
  carpeta desde File Manager.
- **better-sqlite3:** usa un módulo nativo. `Run NPM Install` normalmente
  descarga un binario precompilado para Linux x64, pero si falla la
  instalación, prueba otra versión de Node (18/20/22) en el selector o
  pide a soporte del hosting que confirme que hay build tools (python3,
  make, g++) disponibles para el NPM del Node Selector.
- **CORS:** sigue habilitado pero ya no es necesario (frontend y API
  quedan en el mismo origen); no afecta el funcionamiento.

## Cómo actualizar la app después de un cambio

1. En local: `docker compose exec frontend npm run build` (compila a `dist`
   dentro del contenedor).
2. `docker cp inventario_impresoras-frontend-1:/app/dist backend/public`
   (reemplaza `backend/public` con el build nuevo).
3. Vuelve a comprimir `package.json` + `src/` + `public/` en un zip.
4. Súbelo por File Manager sobre la misma carpeta (sobrescribe) y extrae.
5. Si cambiaste dependencias en `package.json`, click **Run NPM Install**.
6. Click **Restart** en Setup Node.js App.
