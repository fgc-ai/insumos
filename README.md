# Inventario de Suministros de Impresora

App web para registrar stock de suministros de impresora (tóner, tinta, tambor, etc.), con alertas de stock bajo.

## Stack
- **Backend:** Node.js + Express + SQLite (better-sqlite3)
- **Frontend:** React + Vite + Tailwind CSS
- Todo corre en contenedores Docker, no necesitas instalar Node en tu equipo.

## Cómo levantar la app

```
docker compose up --build -d
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:4000/api

## Cómo detener la app

```
docker compose down
```

Los datos (base SQLite) se guardan en `backend/data/inventory.db` y persisten entre reinicios.

## Funcionalidades
- Alta, edición y eliminación de suministros (nombre, tipo, SKU, unidad, mínimo).
- Registro de movimientos de entrada y salida de stock, con nota opcional.
- Historial de movimientos por suministro.
- Indicador visual de "stock bajo" cuando la cantidad actual llega o baja del mínimo definido.
- Solicitudes de suministros desde las distintas áreas de la empresa vía un formulario JotForm, con pantalla de gestión (entregar/rechazar) que descuenta stock automáticamente.

## Solicitudes de suministros (JotForm)

Las áreas piden suministros desde este formulario: https://form.jotform.com/262813892867069

El backend sincroniza los envíos del formulario cada 60 segundos (o al tocar "Actualizar desde JotForm" en la pestaña **Solicitudes** de la app). Para habilitar la sincronización:

1. Copia `.env.example` a `.env` en la raíz del proyecto.
2. Genera una API Key en https://www.jotform.com/myaccount/api y complétala en `.env` (`JOTFORM_API_KEY=...`). El `JOTFORM_FORM_ID` ya viene con el formulario actual.
3. Reinicia el backend: `docker compose up -d backend`.

`.env` está excluido del repositorio (`.gitignore`) porque contiene una credencial.

## Próximos pasos posibles
- Asociar suministros a impresoras específicas y proveedores.
- Reportes de consumo histórico y predicción de agotamiento.
