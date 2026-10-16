import { Router } from "express";
import { db } from "./db.js";
import { syncJotformRequests } from "./jotform.js";

export const router = Router();

function withStatus(supply) {
  return { ...supply, low_stock: supply.quantity <= supply.min_threshold };
}

// List all supplies
router.get("/supplies", (req, res) => {
  const supplies = db.prepare("SELECT * FROM supplies ORDER BY name").all();
  res.json(supplies.map(withStatus));
});

// Get one supply
router.get("/supplies/:id", (req, res) => {
  const supply = db.prepare("SELECT * FROM supplies WHERE id = ?").get(req.params.id);
  if (!supply) return res.status(404).json({ error: "Suministro no encontrado" });
  res.json(withStatus(supply));
});

// Create supply
router.post("/supplies", (req, res) => {
  const { name, type, sku, model_code, brand, compatibility, notes, unit, quantity, min_threshold } =
    req.body;
  if (!name || !type) {
    return res.status(400).json({ error: "name y type son requeridos" });
  }
  const result = db
    .prepare(
      `INSERT INTO supplies (name, type, sku, model_code, brand, compatibility, notes, unit, quantity, min_threshold)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      name,
      type,
      sku ?? null,
      model_code ?? null,
      brand ?? null,
      compatibility ?? null,
      notes ?? null,
      unit ?? "unidad",
      quantity ?? 0,
      min_threshold ?? 0
    );
  const supply = db.prepare("SELECT * FROM supplies WHERE id = ?").get(result.lastInsertRowid);
  res.status(201).json(withStatus(supply));
});

// Update supply
router.put("/supplies/:id", (req, res) => {
  const existing = db.prepare("SELECT * FROM supplies WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Suministro no encontrado" });

  const { name, type, sku, model_code, brand, compatibility, notes, unit, min_threshold } = req.body;
  db.prepare(
    `UPDATE supplies SET name = ?, type = ?, sku = ?, model_code = ?, brand = ?, compatibility = ?,
     notes = ?, unit = ?, min_threshold = ?
     WHERE id = ?`
  ).run(
    name ?? existing.name,
    type ?? existing.type,
    sku ?? existing.sku,
    model_code ?? existing.model_code,
    brand ?? existing.brand,
    compatibility ?? existing.compatibility,
    notes ?? existing.notes,
    unit ?? existing.unit,
    min_threshold ?? existing.min_threshold,
    req.params.id
  );
  const supply = db.prepare("SELECT * FROM supplies WHERE id = ?").get(req.params.id);
  res.json(withStatus(supply));
});

// Delete supply
router.delete("/supplies/:id", (req, res) => {
  const result = db.prepare("DELETE FROM supplies WHERE id = ?").run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: "Suministro no encontrado" });
  res.status(204).send();
});

// List movements for a supply
router.get("/supplies/:id/movements", (req, res) => {
  const movements = db
    .prepare("SELECT * FROM movements WHERE supply_id = ? ORDER BY created_at DESC, id DESC")
    .all(req.params.id);
  res.json(movements);
});

// Register a movement (entrada/salida) and update stock
router.post("/supplies/:id/movements", (req, res) => {
  const supply = db.prepare("SELECT * FROM supplies WHERE id = ?").get(req.params.id);
  if (!supply) return res.status(404).json({ error: "Suministro no encontrado" });

  const { type, quantity, note } = req.body;
  if (!["entrada", "salida"].includes(type)) {
    return res.status(400).json({ error: "type debe ser 'entrada' o 'salida'" });
  }
  const qty = Number(quantity);
  if (!Number.isFinite(qty) || qty <= 0) {
    return res.status(400).json({ error: "quantity debe ser un número positivo" });
  }
  if (type === "salida" && qty > supply.quantity) {
    return res.status(400).json({ error: "No hay suficiente stock para esta salida" });
  }

  const newQuantity = type === "entrada" ? supply.quantity + qty : supply.quantity - qty;

  const tx = db.transaction(() => {
    db.prepare(
      "INSERT INTO movements (supply_id, type, quantity, note) VALUES (?, ?, ?, ?)"
    ).run(req.params.id, type, qty, note ?? null);
    db.prepare("UPDATE supplies SET quantity = ? WHERE id = ?").run(newQuantity, req.params.id);
  });
  tx();

  const updated = db.prepare("SELECT * FROM supplies WHERE id = ?").get(req.params.id);
  res.status(201).json(withStatus(updated));
});

// List supply requests (from JotForm), optionally filtered by status
router.get("/requests", (req, res) => {
  const { status } = req.query;
  const rows = status
    ? db.prepare("SELECT * FROM requests WHERE status = ? ORDER BY created_at DESC").all(status)
    : db.prepare("SELECT * FROM requests ORDER BY created_at DESC").all();
  res.json(rows);
});

// Create a supply request directly from the internal public page (not via JotForm)
router.post("/requests", (req, res) => {
  const { area, requester_name, supply_id, quantity, note } = req.body;
  if (!area || !String(area).trim()) {
    return res.status(400).json({ error: "El área es requerida" });
  }
  if (!requester_name || !String(requester_name).trim()) {
    return res.status(400).json({ error: "El nombre de quien solicita es requerido" });
  }
  const supply = db.prepare("SELECT * FROM supplies WHERE id = ?").get(supply_id);
  if (!supply) {
    return res.status(400).json({ error: "Debes seleccionar un suministro válido" });
  }
  const qty = Number(quantity);
  if (!Number.isFinite(qty) || qty <= 0) {
    return res.status(400).json({ error: "La cantidad debe ser un número positivo" });
  }

  const submissionId = `interna-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const result = db
    .prepare(
      `INSERT INTO requests
         (jotform_submission_id, area, requester_name, supply_id, supply_name_raw, quantity, note, source)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'interna')`
    )
    .run(submissionId, area.trim(), requester_name.trim(), supply.id, supply.name, qty, note?.trim() || null);

  const created = db.prepare("SELECT * FROM requests WHERE id = ?").get(result.lastInsertRowid);
  res.status(201).json(created);
});

// Pull new submissions from JotForm into the requests table
router.post("/requests/sync", async (req, res) => {
  try {
    const result = await syncJotformRequests();
    res.json(result);
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

// Mark a request as delivered: discounts stock and logs a 'salida' movement
router.post("/requests/:id/deliver", (req, res) => {
  const request = db.prepare("SELECT * FROM requests WHERE id = ?").get(req.params.id);
  if (!request) return res.status(404).json({ error: "Solicitud no encontrada" });
  if (request.status !== "pendiente") {
    return res.status(400).json({ error: "Esta solicitud ya fue resuelta" });
  }
  if (!request.supply_id) {
    return res
      .status(400)
      .json({ error: "No se pudo identificar el suministro en el inventario; recházala o entrégala manualmente" });
  }

  const supply = db.prepare("SELECT * FROM supplies WHERE id = ?").get(request.supply_id);
  if (!supply) return res.status(400).json({ error: "El suministro asociado ya no existe" });
  if (request.quantity > supply.quantity) {
    return res.status(400).json({ error: "No hay suficiente stock para entregar esta cantidad" });
  }

  const tx = db.transaction(() => {
    db.prepare("INSERT INTO movements (supply_id, type, quantity, note) VALUES (?, 'salida', ?, ?)").run(
      request.supply_id,
      request.quantity,
      `Solicitud de ${request.area} (${request.requester_name})`
    );
    db.prepare("UPDATE supplies SET quantity = quantity - ? WHERE id = ?").run(
      request.quantity,
      request.supply_id
    );
    db.prepare(
      "UPDATE requests SET status = 'entregada', resolved_at = datetime('now') WHERE id = ?"
    ).run(req.params.id);
  });
  tx();

  const updated = db.prepare("SELECT * FROM requests WHERE id = ?").get(req.params.id);
  res.json(updated);
});

// Mark a request as rejected
router.post("/requests/:id/reject", (req, res) => {
  const result = db
    .prepare("UPDATE requests SET status = 'rechazada', resolved_at = datetime('now') WHERE id = ? AND status = 'pendiente'")
    .run(req.params.id);
  if (result.changes === 0) {
    return res.status(404).json({ error: "Solicitud no encontrada o ya resuelta" });
  }
  const updated = db.prepare("SELECT * FROM requests WHERE id = ?").get(req.params.id);
  res.json(updated);
});
