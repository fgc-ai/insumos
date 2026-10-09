import { useEffect, useState } from "react";
import { api } from "../api";
import { AlertTriangleIcon, CheckCircleIcon, XIcon } from "./icons";

function StatusPill({ status }) {
  const map = {
    pendiente: "bg-amber-100 text-amber-800",
    entregada: "bg-green-100 text-green-800",
    rechazada: "bg-gray-200 text-gray-600",
  };
  const labels = { pendiente: "Pendiente", entregada: "Entregada", rechazada: "Rechazada" };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${map[status]}`}>
      {labels[status]}
    </span>
  );
}

export default function RequestsPanel() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState("");
  const [showResolved, setShowResolved] = useState(false);
  const [busyId, setBusyId] = useState(null);

  async function load() {
    try {
      setLoading(true);
      setRequests(await api.listRequests());
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function sync() {
    try {
      setSyncing(true);
      const result = await api.syncRequests();
      if (result.skipped) setError(result.reason);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSyncing(false);
    }
  }

  useEffect(() => {
    sync();
  }, []);

  async function handleDeliver(id) {
    try {
      setBusyId(id);
      await api.deliverRequest(id);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  async function handleReject(id) {
    if (!window.confirm("¿Rechazar esta solicitud?")) return;
    try {
      setBusyId(id);
      await api.rejectRequest(id);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  const pending = requests.filter((r) => r.status === "pendiente");
  const resolved = requests.filter((r) => r.status !== "pendiente");
  const visible = showResolved ? resolved : pending;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-2">
          <button
            onClick={() => setShowResolved(false)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
              !showResolved ? "bg-blue-600 text-white" : "bg-white text-gray-600 border border-gray-200"
            }`}
          >
            Pendientes ({pending.length})
          </button>
          <button
            onClick={() => setShowResolved(true)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
              showResolved ? "bg-blue-600 text-white" : "bg-white text-gray-600 border border-gray-200"
            }`}
          >
            Resueltas ({resolved.length})
          </button>
        </div>
        <button
          onClick={sync}
          disabled={syncing}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          {syncing ? "Sincronizando..." : "Actualizar desde JotForm"}
        </button>
      </div>

      {error && (
        <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      {loading ? (
        <p className="mt-4 text-sm text-gray-500">Cargando...</p>
      ) : visible.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-gray-300 bg-white py-12 text-center">
          <p className="text-sm text-gray-500">
            {showResolved ? "Sin solicitudes resueltas todavía." : "No hay solicitudes pendientes."}
          </p>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {visible.map((r) => (
            <div key={r.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-gray-900">{r.supply_name_raw}</p>
                  <p className="text-xs text-gray-500">
                    {r.area} · {r.requester_name}
                  </p>
                </div>
                <StatusPill status={r.status} />
              </div>

              <div className="mt-2 flex items-center gap-1.5 text-sm text-gray-700">
                <span className="font-medium">Cantidad:</span> {r.quantity}
              </div>

              {!r.supply_id && (
                <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-700">
                  <AlertTriangleIcon className="h-3.5 w-3.5" />
                  No se identificó este suministro en el inventario
                </div>
              )}

              {r.note && <p className="mt-2 text-xs italic text-gray-500">{r.note}</p>}

              <p className="mt-2 text-xs text-gray-400">
                {new Date(r.created_at + "Z").toLocaleString()}
              </p>

              {r.status === "pendiente" && (
                <div className="mt-3 flex justify-end gap-2 border-t border-black/5 pt-3">
                  <button
                    onClick={() => handleReject(r.id)}
                    disabled={busyId === r.id}
                    className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <XIcon className="h-4 w-4" />
                    Rechazar
                  </button>
                  <button
                    onClick={() => handleDeliver(r.id)}
                    disabled={busyId === r.id || !r.supply_id}
                    title={!r.supply_id ? "No se puede descontar stock sin identificar el suministro" : ""}
                    className="inline-flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-green-700 disabled:opacity-50"
                  >
                    <CheckCircleIcon className="h-4 w-4" />
                    Entregar
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
