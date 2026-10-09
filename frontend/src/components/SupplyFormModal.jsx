import { useState } from "react";
import { XIcon } from "./icons";

const TYPES = ["Tóner", "Tinta", "Tambor/Drum", "Fusor", "Otro"];

export default function SupplyFormModal({ initial, onClose, onSubmit }) {
  const [form, setForm] = useState(
    initial ?? {
      name: "",
      type: TYPES[0],
      sku: "",
      model_code: "",
      brand: "",
      compatibility: "",
      notes: "",
      unit: "unidad",
      quantity: 0,
      min_threshold: 0,
    }
  );
  const [error, setError] = useState("");
  const isEdit = Boolean(initial);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("El nombre es requerido");
      return;
    }
    try {
      await onSubmit(form);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEdit ? "Editar suministro" : "Nuevo suministro"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-600">Nombre</label>
            <input
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="Tóner HP 26A"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-600">Tipo</label>
              <select
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={form.type}
                onChange={(e) => update("type", e.target.value)}
              >
                {TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Marca</label>
              <input
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={form.brand ?? ""}
                onChange={(e) => update("brand", e.target.value)}
                placeholder="Ej: HP, Canon, Epson"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-600">SKU (opcional)</label>
              <input
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={form.sku ?? ""}
                onChange={(e) => update("sku", e.target.value)}
                placeholder="Código interno"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Código de modelo</label>
              <input
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={form.model_code ?? ""}
                onChange={(e) => update("model_code", e.target.value)}
                placeholder="Ej: CF226A"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Compatibilidad</label>
            <textarea
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              rows={2}
              value={form.compatibility ?? ""}
              onChange={(e) => update("compatibility", e.target.value)}
              placeholder="Ej: HP LaserJet Pro M402, M403, MFP M426"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-600">Unidad</label>
              <input
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={form.unit}
                onChange={(e) => update("unit", e.target.value)}
                placeholder="unidad, caja, ml"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Mínimo</label>
              <input
                type="number"
                min="0"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={form.min_threshold}
                onChange={(e) => update("min_threshold", Number(e.target.value))}
              />
            </div>
          </div>
          {!isEdit && (
            <div>
              <label className="block text-sm font-medium text-gray-600">Cantidad inicial</label>
              <input
                type="number"
                min="0"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={form.quantity}
                onChange={(e) => update("quantity", Number(e.target.value))}
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-600">Notas / Comentarios</label>
            <textarea
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              rows={2}
              value={form.notes ?? ""}
              onChange={(e) => update("notes", e.target.value)}
              placeholder="Observaciones adicionales"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
