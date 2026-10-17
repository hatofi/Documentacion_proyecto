"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import { getOpenBatches, type Batch, type BatchCategory } from "@/lib/batch-api";

const batchImages = [
  "https://images.unsplash.com/photo-1545468259-7fa9a2e7a7f1?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=900&q=80",
];

const categoryLabels: Record<BatchCategory, string> = {
  CEBA_INTENSIVA: "Ceba intensiva",
  CRIA_LEVANTE: "Cría & levante",
};

function formatMoney(value: number) {
  return new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 }).format(value);
}

function getBatchImage(batchId: number) {
  return batchImages[batchId % batchImages.length];
}

function getMinimumInvestment(batch: Batch) {
  return Math.max(batch.price_per_share, 100);
}

type MetricIconName = "target" | "trend" | "batches" | "dividends";

function MetricIcon({ name }: { name: MetricIconName }) {
  const paths = {
    target: (
      <>
        <circle cx="12" cy="12" r="8.5" />
        <circle cx="12" cy="12" r="4.5" />
        <circle cx="12" cy="12" r="1" />
      </>
    ),
    trend: (
      <>
        <path d="M4 16 9 11l3 3 6-7" />
        <path d="M14 7h4v4" />
      </>
    ),
    batches: (
      <>
        <rect x="4" y="4" width="16" height="5" rx="1" />
        <rect x="4" y="11" width="16" height="5" rx="1" />
        <path d="M8 18h8" />
      </>
    ),
    dividends: (
      <>
        <rect x="3.5" y="5" width="17" height="14" rx="2" />
        <path d="M3.5 9h17M7 14h4" />
      </>
    ),
  };

  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
      {paths[name]}
    </svg>
  );
}

export default function InvestmentPage() {
  const [selectedCategory, setSelectedCategory] = useState<BatchCategory | "ALL">("ALL");
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [amountUsdc, setAmountUsdc] = useState(1000);

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => {
      if (active) {
        setLoading(true);
        setError("");
      }
    });
    getOpenBatches(selectedCategory === "ALL" ? undefined : selectedCategory)
      .then((loadedBatches) => {
        if (active) setBatches(loadedBatches);
      })
      .catch((loadError) => {
        if (active) {
          setBatches([]);
          setError(loadError instanceof Error ? loadError.message : "No fue posible cargar los lotes disponibles.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [selectedCategory]);

  const totalTarget = useMemo(
    () => batches.reduce((total, batch) => total + batch.target_amount, 0),
    [batches],
  );
  const averageRoi = batches.length
    ? batches.reduce((total, batch) => total + batch.estimated_roi_percentage, 0) / batches.length
    : 0;

  const showToast = (message: string) => {
    setToastMessage(message);
    window.setTimeout(() => setToastMessage(""), 4000);
  };

  const openInvestment = (batch: Batch) => {
    setSelectedBatch(batch);
    setAmountUsdc(getMinimumInvestment(batch));
  };

  const simulation = selectedBatch
    ? amountUsdc * (selectedBatch.estimated_roi_percentage / 100) * (selectedBatch.duration_months / 12)
    : 0;

  const confirmInvestment = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedBatch) return;
    setSelectedBatch(null);
    showToast(`Inversión de $${formatMoney(amountUsdc)} USDC confirmada en ${selectedBatch.title}.`);
  };

  return (
    <div className="flex w-full flex-col gap-6">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl border border-[#10B981] bg-[#006244] px-5 py-3 text-xs font-bold text-white shadow-xl">
          {toastMessage}
        </div>
      )}

      <div>
        <span className="text-xs font-bold uppercase tracking-wide text-[#006244]">Mercado de inversión</span>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-[#0D1F1B] sm:text-3xl">Lotes disponibles para invertir</h1>
        <p className="mt-2 max-w-3xl text-sm text-[#5D6B66]">Consulta lotes abiertos a financiación y elige una originación pecuaria según su categoría.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Capital objetivo", value: `$${formatMoney(totalTarget)} USDC`, detail: "de los lotes abiertos", icon: "target" as const },
          { label: "Rendimiento promedio", value: `${averageRoi.toFixed(2)}%`, detail: "ROI estimado", icon: "trend" as const },
          { label: "Lotes disponibles", value: String(batches.length), detail: "abiertos a inversión", icon: "batches" as const },
          { label: "Dividendos disponibles", value: "$0.00", unit: "USDC", detail: "Distribución mensual de dividendos", icon: "dividends" as const, action: true },
        ].map(({ label, value, unit, detail, icon, action }) => (
          <div key={label} className="flex min-h-[166px] flex-col rounded-2xl border border-[#E2E8E5] bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <p className="text-xs font-bold text-[#62736C]">{label}</p>
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#EAF4F0] text-[#006244]">
                <MetricIcon name={icon} />
              </span>
            </div>
            <p className="mt-3 text-3xl font-extrabold text-[#006244]">
              {value} {unit && <span className="text-xs font-medium text-[#62736C]">{unit}</span>}
            </p>
            <p className="mt-1 text-xs text-gray-500">{detail}</p>
            {action && (
              <button
                type="button"
                disabled
                className="mt-auto w-full cursor-not-allowed rounded-xl bg-[#063B32] px-4 py-2.5 text-sm font-semibold text-white opacity-90"
              >
                Reclamar Dividendos
              </button>
            )}
          </div>
        ))}
      </div>

      <section className="rounded-2xl border border-[#E2E8E5] bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 border-b border-[#E8EEEB] pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-[#0D1F1B]">Lotes disponibles para financiación</h2>
            <p className="mt-1 text-sm text-[#5D6B66]">Los resultados se consultan directamente en la API.</p>
          </div>
          <div className="inline-flex gap-1 rounded-xl bg-[#F0F4F2] p-1 text-xs font-bold text-[#62736C]">
            <button type="button" onClick={() => setSelectedCategory("ALL")} className={`rounded-lg px-3 py-2 ${selectedCategory === "ALL" ? "bg-white text-[#006244] shadow-sm" : ""}`}>Todos</button>
            <button type="button" onClick={() => setSelectedCategory("CEBA_INTENSIVA")} className={`rounded-lg px-3 py-2 ${selectedCategory === "CEBA_INTENSIVA" ? "bg-white text-[#006244] shadow-sm" : ""}`}>Ceba intensiva</button>
            <button type="button" onClick={() => setSelectedCategory("CRIA_LEVANTE")} className={`rounded-lg px-3 py-2 ${selectedCategory === "CRIA_LEVANTE" ? "bg-white text-[#006244] shadow-sm" : ""}`}>Cría & levante</button>
          </div>
        </div>

        {error && <p className="mt-5 rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-700">{error}</p>}
        {loading ? <p className="py-10 text-center text-sm text-[#62736C]">Cargando lotes disponibles...</p> : batches.length === 0 ? <p className="py-10 text-center text-sm text-[#62736C]">No hay lotes abiertos para esta categoría.</p> : (
          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            {batches.map((batch) => {
              const progress = batch.target_amount > 0 ? Math.min(100, Math.round((batch.collected_amount / batch.target_amount) * 100)) : 0;
              return (
                <article key={batch.id} className="overflow-hidden rounded-2xl border border-[#DDE7E2] bg-white shadow-sm">
                  <div className="relative h-44 bg-cover bg-center" style={{ backgroundImage: `url(${getBatchImage(batch.id)})` }}>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#071B17] via-transparent to-transparent" />
                    <span className="absolute left-4 top-4 rounded-lg bg-[#071B17]/80 px-3 py-1 text-xs font-bold text-white">{batch.code}</span>
                    <span className="absolute right-4 top-4 rounded-lg bg-[#5BCB35] px-3 py-1 text-xs font-extrabold text-[#063B32]">{batch.estimated_roi_percentage}% ROI</span>
                    <span className="absolute bottom-16 left-4 rounded-lg bg-white/90 px-3 py-1 text-xs font-bold text-[#063B32]">{categoryLabels[batch.category]}</span>
                    <div className="absolute bottom-4 left-4 text-white"><h3 className="text-xl font-extrabold">{batch.title}</h3><p className="text-xs text-[#D6F5E1]">Lote abierto a inversión</p></div>
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-3 rounded-xl bg-[#F5F8F6] p-3 text-center text-xs">
                      <div><span className="block text-[#62736C]">Estado</span><strong className="mt-1 block text-[#0D1F1B]">En financiación</strong></div>
                      <div><span className="block text-[#62736C]">Plazo</span><strong className="mt-1 block text-[#0D1F1B]">{batch.duration_months} meses</strong></div>
                      <div><span className="block text-[#62736C]">Mínimo</span><strong className="mt-1 block text-[#0D1F1B]">${formatMoney(getMinimumInvestment(batch))}</strong></div>
                    </div>
                    <div className="mt-4 flex justify-between text-sm font-bold text-[#0D1F1B]"><span>Recaudado: ${formatMoney(batch.collected_amount)} USDC</span><span className="text-[#006244]">{progress}%</span></div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#E8EEEB]"><div className="h-full rounded-full bg-[#10B981]" style={{ width: `${progress}%` }} /></div>
                    <p className="mt-2 text-xs text-[#62736C]">Meta: ${formatMoney(batch.target_amount)} USDC</p>
                    <button type="button" onClick={() => openInvestment(batch)} className="mt-4 w-full rounded-xl bg-[#063B32] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#042822]">Invertir en este lote →</button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {selectedBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between"><div><span className="text-[10px] font-bold uppercase tracking-wider text-[#10B981]">Fondeo colectivo</span><h2 className="text-lg font-extrabold text-[#0D1F1B]">{selectedBatch.title}</h2></div><button type="button" onClick={() => setSelectedBatch(null)} className="text-gray-400">✕</button></div>
            <div className="mt-4 space-y-1 rounded-xl border border-gray-200 bg-[#F8FAF9] p-3 text-xs"><div className="flex justify-between"><span className="text-gray-500">Código:</span><strong>{selectedBatch.code}</strong></div><div className="flex justify-between"><span className="text-gray-500">ROI:</span><strong className="text-[#059669]">{selectedBatch.estimated_roi_percentage}%</strong></div><div className="flex justify-between"><span className="text-gray-500">Duración:</span><strong>{selectedBatch.duration_months} meses</strong></div></div>
            <form onSubmit={confirmInvestment} className="mt-4 space-y-4">
              <label className="block text-xs font-bold text-gray-700">Monto a depositar (USDC)<span className="float-right text-base text-[#006244]">${formatMoney(amountUsdc)}</span><input type="range" min={getMinimumInvestment(selectedBatch)} max={Math.max(selectedBatch.target_amount, getMinimumInvestment(selectedBatch))} step={getMinimumInvestment(selectedBatch)} value={amountUsdc} onChange={(event) => setAmountUsdc(Number(event.target.value))} className="mt-3 w-full accent-[#006244]" /></label>
              <div className="rounded-xl border border-[#A7F3D0] bg-[#ECFDF5] p-3 text-xs text-[#065F46]">Rendimiento estimado: <strong>+${formatMoney(simulation)} USDC</strong></div>
              <div className="flex justify-end gap-2"><button type="button" onClick={() => setSelectedBatch(null)} className="rounded-xl px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-100">Cancelar</button><button type="submit" className="rounded-xl bg-[#063B32] px-5 py-2.5 text-xs font-bold text-white">Confirmar inversión</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
