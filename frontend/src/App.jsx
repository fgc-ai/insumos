import { useEffect, useState } from "react";
import { api } from "./api";
import SupplyTable from "./components/SupplyTable";
import SupplyFormModal from "./components/SupplyFormModal";
import MovementModal from "./components/MovementModal";
import HistoryPanel from "./components/HistoryPanel";
import RequestsPanel from "./components/RequestsPanel";
import { AlertTriangleIcon, BoxIcon, CheckCircleIcon, PlusIcon } from "./components/icons";

function StatCard({ label, value, tone, icon }) {
  const tones = {
    slate: "bg-slate-100 text-slate-600",
    red: "bg-red-100 text-red-600",
    green: "bg-green-100 text-green-600",
  };
  return (
    <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${tones[tone]}`}>
        {icon}
      </div>
      <div>
        <p className="text-xl font-bold text-gray-900 leading-tight">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </div>
  );
}

export default function App() {
  const [supplies, setSupplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [tab, setTab] = useState("inventario"); // "inventario" | "solicitudes"

  const [formTarget, setFormTarget] = useState(null); // null closed, {} new, supply = edit
  const [movementTarget, setMovementTarget] = useState(null); // { supply, type }
  const [historyTarget, setHistoryTarget] = useState(null); // supply

  async function refresh() {
    try {
      setLoading(true);
      setSupplies(await api.listSupplies());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const lowStockCount = supplies.filter((s) => s.low_stock).length;
  const okCount = supplies.length - lowStockCount;

  async function handleSaveSupply(data) {
    if (formTarget && formTarget.id) {
      await api.updateSupply(formTarget.id, data);
    } else {
      await api.createSupply(data);
    }
    setFormTarget(null);
    await refresh();
  }

  async function handleDelete(supply) {
    if (!window.confirm(`¿Eliminar "${supply.name}"? Esta acción no se puede deshacer.`)) return;
    await api.deleteSupply(supply.id);
    await refresh();
  }

  async function handleMovement(data) {
    await api.createMovement(movementTarget.supply.id, data);
    setMovementTarget(null);
    await refresh();
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
              Inventario de Suministros de Impresora
            </h1>
            <p className="mt-1 text-sm text-gray-500">Control de stock de tóner, tinta, tambor y fusor</p>
          </div>
          {tab === "inventario" && (
            <button
              onClick={() => setFormTarget({})}
              className="hidden items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 sm:inline-flex"
            >
              <PlusIcon className="h-4 w-4" />
              Agregar suministro
            </button>
          )}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatCard
            label="Suministros registrados"
            value={supplies.length}
            tone="slate"
            icon={<BoxIcon className="h-5 w-5" />}
          />
          <StatCard
            label="Con stock bajo"
            value={lowStockCount}
            tone="red"
            icon={<AlertTriangleIcon className="h-5 w-5" />}
          />
          <StatCard
            label="Stock en buen estado"
            value={okCount}
            tone="green"
            icon={<CheckCircleIcon className="h-5 w-5" />}
          />
        </div>

        <div className="mt-6 flex gap-2 border-b border-gray-200">
          <button
            onClick={() => setTab("inventario")}
            className={`border-b-2 px-3 py-2 text-sm font-medium ${
              tab === "inventario"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Inventario
          </button>
          <button
            onClick={() => setTab("solicitudes")}
            className={`border-b-2 px-3 py-2 text-sm font-medium ${
              tab === "solicitudes"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Solicitudes
          </button>
        </div>

        {error && (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="mt-6">
          {tab === "inventario" ? (
            loading ? (
              <p className="text-sm text-gray-500">Cargando...</p>
            ) : (
              <SupplyTable
                supplies={supplies}
                onEdit={(s) => setFormTarget(s)}
                onDelete={handleDelete}
                onMovement={(supply, type) => setMovementTarget({ supply, type })}
                onHistory={(s) => setHistoryTarget(s)}
              />
            )
          ) : (
            <RequestsPanel />
          )}
        </div>
      </div>

      {tab === "inventario" && (
        <button
          onClick={() => setFormTarget({})}
          aria-label="Agregar suministro"
          className="fixed bottom-5 right-5 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 sm:hidden"
        >
          <PlusIcon className="h-6 w-6" />
        </button>
      )}

      {formTarget !== null && (
        <SupplyFormModal
          initial={formTarget.id ? formTarget : null}
          onClose={() => setFormTarget(null)}
          onSubmit={handleSaveSupply}
        />
      )}

      {movementTarget && (
        <MovementModal
          supply={movementTarget.supply}
          type={movementTarget.type}
          onClose={() => setMovementTarget(null)}
          onSubmit={handleMovement}
        />
      )}

      {historyTarget && (
        <HistoryPanel supply={historyTarget} onClose={() => setHistoryTarget(null)} />
      )}
    </div>
  );
}
