import { useState } from "react";
import { XIcon } from "./icons";

export default function MovementModal({ supply, type, onClose, onSubmit }) {
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  const isEntrada = type === "entrada";

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await onSubmit({ type, quantity, note });
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-1 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEntrada ? "Registrar entrada" : "Registrar salida"}
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
        <p className="mb-4 text-sm text-gray-500">
          {supply.name} — stock actual: {supply.quantity} {supply.unit}
        </p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-600">Cantidad</label>
            <input
              type="number"
              min="1"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Nota (opcional)</label>
            <input
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ej: reposición de bodega, impresora recepción"
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
              className={`rounded-lg px-4 py-2 text-sm font-medium text-white shadow-sm ${
                isEntrada ? "bg-green-600 hover:bg-green-700" : "bg-orange-600 hover:bg-orange-700"
              }`}
            >
              Confirmar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
