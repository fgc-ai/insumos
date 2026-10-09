import { useEffect, useState } from "react";
import { api } from "../api";
import { XIcon } from "./icons";

export default function HistoryPanel({ supply, onClose }) {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .listMovements(supply.id)
      .then(setMovements)
      .finally(() => setLoading(false));
  }, [supply.id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Historial — {supply.name}</h2>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>
        {loading ? (
          <p className="text-sm text-gray-500">Cargando...</p>
        ) : movements.length === 0 ? (
          <p className="text-sm text-gray-500">Sin movimientos registrados.</p>
        ) : (
          <div className="space-y-2">
            {movements.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 bg-slate-50 px-3 py-2"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        m.type === "entrada"
                          ? "bg-green-100 text-green-700"
                          : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {m.type === "entrada" ? "Entrada" : "Salida"}
                    </span>
                    <span className="text-sm font-medium text-gray-900">{m.quantity}</span>
                  </div>
                  {m.note && <p className="mt-0.5 truncate text-xs text-gray-500">{m.note}</p>}
                </div>
                <span className="shrink-0 whitespace-nowrap text-xs text-gray-400">
                  {new Date(m.created_at + "Z").toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
