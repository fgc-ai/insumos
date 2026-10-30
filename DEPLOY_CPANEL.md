# Despliegue en hosting cPanel (sin Docker, sin SSH)

Este proyecto corre normalmente con Docker, pero cPanel compartido no soporta
Docker. En su lugar se usa **Setup Node.js App** (Passenger) de cPanel: un
solo proceso Node que sirve la API (`/api/*`) y el frontend compilado
(todo lo demás) desde el mismo puerto. Por eso el backend ahora sirve
también los archivos estáticos de `backend/public` (ver `backend/src/index.js`).

## Generar el paquete para subir

Con la app corriendo en Docker (`docker compose up -d`), ejecuta:
```
powershell -ExecutionPolicy Bypass -File scripts\make-deploy-zip.ps1
```
Esto compila el frontend, hace checkpoint de la base SQLite (WAL ->
`inventory.db`) y genera `inventario-app-cpanel.zip` en la raíz del
repo con: `package.json`, `src/` (backend), `public/` (frontend
compilado) y `data/inventory.db` (los datos actuales).

**Importante:** no uses `Compress-Archive` de PowerShell a mano para
este zip — genera las rutas internas con `\` (separador de Windows)
en vez de `/`, y al extraer en el servidor Linux de cPanel los
archivos quedan planos con nombres literales como `src\db.js` en vez
de dentro de una carpeta `src/`. El script ya resuelve esto usando
`System.IO.Compression` directamente con separadores `/`.

Si vas a subir el paquete por primera vez a un servidor sin datos
previos, está bien que incluya `data/inventory.db`. Si el servidor ya
tiene datos propios más recientes, no sobrescribas esa carpeta al
extraer (o extrae todo excepto `data/`).

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

1. Con Docker corriendo, ejecuta `scripts\make-deploy-zip.ps1` (ver
   arriba) para regenerar `inventario-app-cpanel.zip` actualizado.
2. Súbelo por File Manager sobre la misma carpeta (sobrescribe) y extrae.
3. Si cambiaste dependencias en `package.json`, click **Run NPM Install**.
4. Click **Restart** en Setup Node.js App.
