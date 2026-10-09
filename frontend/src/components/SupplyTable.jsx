import {
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  ClockIcon,
  PencilIcon,
  TrashIcon,
} from "./icons";

function StatusBadge({ low }) {
  return low ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
      <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
      Stock bajo
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
      <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
      OK
    </span>
  );
}

function IconButton({ onClick, label, tone, children }) {
  const tones = {
    green: "border-green-200 text-green-700 hover:bg-green-50",
    orange: "border-orange-200 text-orange-700 hover:bg-orange-50",
    gray: "border-gray-200 text-gray-600 hover:bg-gray-50",
    red: "border-red-200 text-red-700 hover:bg-red-50",
  };
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border ${tones[tone]}`}
    >
      {children}
    </button>
  );
}

function ActionButtons({ s, onMovement, onHistory, onEdit, onDelete }) {
  return (
    <div className="flex items-center justify-end gap-1.5">
      <IconButton label="Registrar entrada" tone="green" onClick={() => onMovement(s, "entrada")}>
        <ArrowDownTrayIcon className="h-4 w-4" />
      </IconButton>
      <IconButton label="Registrar salida" tone="orange" onClick={() => onMovement(s, "salida")}>
        <ArrowUpTrayIcon className="h-4 w-4" />
      </IconButton>
      <IconButton label="Ver historial" tone="gray" onClick={() => onHistory(s)}>
        <ClockIcon className="h-4 w-4" />
      </IconButton>
      <IconButton label="Editar" tone="gray" onClick={() => onEdit(s)}>
        <PencilIcon className="h-4 w-4" />
      </IconButton>
      <IconButton label="Eliminar" tone="red" onClick={() => onDelete(s)}>
        <TrashIcon className="h-4 w-4" />
      </IconButton>
    </div>
  );
}

export default function SupplyTable({ supplies, onEdit, onDelete, onMovement, onHistory }) {
  if (supplies.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-white py-12 text-center">
        <p className="text-sm text-gray-500">
          No hay suministros registrados todavía. Agrega el primero con el botón de arriba.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Mobile: stacked cards */}
      <div className="space-y-3 md:hidden">
        {supplies.map((s) => (
          <div
            key={s.id}
            className={`rounded-xl border p-4 shadow-sm ${
              s.low_stock ? "border-red-200 bg-red-50" : "border-gray-200 bg-white"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-gray-900">{s.name}</p>
                <p className="text-xs text-gray-500">
                  {s.type}
                  {s.brand ? ` · ${s.brand}` : ""}
                </p>
              </div>
              <StatusBadge low={s.low_stock} />
            </div>

            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-gray-900">{s.quantity}</span>
              <span className="text-sm text-gray-500">
                {s.unit} · mínimo {s.min_threshold}
              </span>
            </div>

            {(s.sku || s.model_code) && (
              <p className="mt-1 text-xs text-gray-500">
                {[s.sku, s.model_code].filter(Boolean).join(" · ")}
              </p>
            )}
            {s.compatibility && (
              <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                Compatible: {s.compatibility}
              </p>
            )}
            {s.notes && <p className="mt-1 text-xs italic text-gray-400 line-clamp-2">{s.notes}</p>}

            <div className="mt-3 border-t border-black/5 pt-3">
              <ActionButtons s={s} onMovement={onMovement} onHistory={onHistory} onEdit={onEdit} onDelete={onDelete} />
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: table */}
      <div className="hidden overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm md:block">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr className="text-left">
              <th className="px-3 py-2.5">Nombre</th>
              <th className="px-3 py-2.5">Tipo</th>
              <th className="px-3 py-2.5">Marca</th>
              <th className="px-3 py-2.5">SKU</th>
              <th className="px-3 py-2.5">Modelo</th>
              <th className="px-3 py-2.5">Compatibilidad</th>
              <th className="px-3 py-2.5">Cantidad</th>
              <th className="px-3 py-2.5">Mínimo</th>
              <th className="px-3 py-2.5">Estado</th>
              <th className="px-3 py-2.5">Notas</th>
              <th className="px-3 py-2.5 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {supplies.map((s) => (
              <tr key={s.id} className={`${s.low_stock ? "bg-red-50/60" : ""} hover:bg-slate-50`}>
                <td className="px-3 py-2.5 font-medium text-gray-900">{s.name}</td>
                <td className="px-3 py-2.5 text-gray-600">{s.type}</td>
                <td className="px-3 py-2.5 text-gray-500">{s.brand || "—"}</td>
                <td className="px-3 py-2.5 text-gray-500">{s.sku || "—"}</td>
                <td className="px-3 py-2.5 text-gray-500">{s.model_code || "—"}</td>
                <td
                  className="max-w-[220px] truncate px-3 py-2.5 text-gray-500"
                  title={s.compatibility || ""}
                >
                  {s.compatibility || "—"}
                </td>
                <td className="px-3 py-2.5 font-medium text-gray-900">
                  {s.quantity} <span className="font-normal text-gray-500">{s.unit}</span>
                </td>
                <td className="px-3 py-2.5 text-gray-500">{s.min_threshold}</td>
                <td className="px-3 py-2.5">
                  <StatusBadge low={s.low_stock} />
                </td>
                <td
                  className="max-w-[180px] truncate px-3 py-2.5 text-gray-500"
                  title={s.notes || ""}
                >
                  {s.notes || "—"}
                </td>
                <td className="px-3 py-2.5">
                  <ActionButtons s={s} onMovement={onMovement} onHistory={onHistory} onEdit={onEdit} onDelete={onDelete} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
