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

## Próximos pasos posibles
- Asociar suministros a impresoras específicas y proveedores.
- Reportes de consumo histórico y predicción de agotamiento.
