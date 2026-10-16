import { useEffect, useState } from "react";
import { api } from "./api";
import { CheckCircleIcon } from "./components/icons";

const AREAS = [
  "Administracion",
  "Calidad",
  "Comercial",
  "Contabilidad",
  "Gerencia",
  "Logistica",
  "Mantencion",
  "Operaciones",
  "Prevencion",
  "RRHH",
  "IT",
];

export default function RequestPage() {
  const [supplies, setSupplies] = useState([]);
  const [loadingSupplies, setLoadingSupplies] = useState(true);
  const [form, setForm] = useState({ area: "", requester_name: "", supply_id: "", quantity: 1, note: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    api
      .listSupplies()
      .then(setSupplies)
      .catch((err) => setError(err.message))
      .finally(() => setLoadingSupplies(false));
  }, []);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!form.area.trim() || !form.requester_name.trim() || !form.supply_id) {
      setError("Completa área, nombre y suministro");
      return;
    }
    try {
      setSubmitting(true);
      await api.createRequest(form);
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <CheckCircleIcon className="mx-auto h-10 w-10 text-green-600" />
          <h1 className="mt-3 text-lg font-semibold text-gray-900">Solicitud enviada</h1>
          <p className="mt-1 text-sm text-gray-500">
            Tu solicitud quedó registrada y será revisada por el equipo a cargo del inventario.
          </p>
          <button
            onClick={() => {
              setForm({ area: "", requester_name: "", supply_id: "", quantity: 1, note: "" });
              setSent(false);
            }}
            className="mt-5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
          >
            Enviar otra solicitud
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-lg font-bold text-gray-900 sm:text-xl">Solicitar suministro</h1>
        <p className="mt-1 text-sm text-gray-500">
          Pide tóner, tinta u otro suministro de impresora para tu área.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-600">Área</label>
            <select
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={form.area}
              onChange={(e) => update("area", e.target.value)}
            >
              <option value="">Selecciona un área</option>
              {AREAS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Tu nombre</label>
            <input
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={form.requester_name}
              onChange={(e) => update("requester_name", e.target.value)}
              placeholder="Nombre y apellido"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Suministro</label>
            <select
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={form.supply_id}
              onChange={(e) => update("supply_id", e.target.value)}
              disabled={loadingSupplies}
            >
              <option value="">{loadingSupplies ? "Cargando..." : "Selecciona un suministro"}</option>
              {supplies.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Cantidad</label>
            <input
              type="number"
              min="1"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={form.quantity}
              onChange={(e) => update("quantity", Number(e.target.value))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Nota (opcional)</label>
            <textarea
              rows={2}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={form.note}
              onChange={(e) => update("note", e.target.value)}
              placeholder="Detalles adicionales"
            />
          </div>

          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? "Enviando..." : "Enviar solicitud"}
          </button>
        </form>
      </div>
    </div>
  );
}
