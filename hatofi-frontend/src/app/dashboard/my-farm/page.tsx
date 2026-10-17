"use client";

import Link from "next/link";
import { type FormEvent, type ReactNode, useState } from "react";
import { type Batch, type BatchCategory, type BatchStatus, type BatchUpdatePayload } from "@/lib/batch-api";
import { useMyFarm } from "./hook/use-my-farm";

const batchImages = [
  "https://images.unsplash.com/photo-1545468259-7fa9a2e7a7f1?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=900&q=80",
];

const statusLabels: Record<BatchStatus, string> = {
  DRAFT: "Borrador",
  FUNDING: "En financiación",
  FUNDED: "Financiado",
  BUYING_PROCESS: "Proceso de compra",
  IN_PROGRESS: "En progreso",
  READY_FOR_SALE: "Listo para venta",
  CLOSED: "Cerrado",
  CANCELLED: "Cancelado",
};

const categoryLabels: Record<BatchCategory, string> = {
  CEBA_INTENSIVA: "Ceba intensiva",
  CRIA_LEVANTE: "Cría & levante",
};

function formatCapacity(value: number) {
  return new Intl.NumberFormat("es-CO").format(value);
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-CO", { dateStyle: "medium" }).format(new Date(value));
}

function getBatchImage(batchId: number) {
  return batchImages[batchId % batchImages.length];
}

function InfoIcon({ children }: { children: ReactNode }) {
  return <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#E8F5EE] text-[#006244]">{children}</span>;
}

export default function MyFarmPage() {
  const {
    farms,
    selectedFarm,
    selectedFarmId,
    setSelectedFarmId,
    loading,
    error,
    visibleBatches,
    batchesLoading,
    batchError,
    batchStatus,
    setBatchStatus,
    handleUpdateBatch,
    handleUpdateBatchStatus,
  } = useMyFarm();
  const [editingBatchId, setEditingBatchId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editTargetAmount, setEditTargetAmount] = useState("");
  const [editDurationMonths, setEditDurationMonths] = useState("");
  const [editFundingStartDate, setEditFundingStartDate] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  if (loading) {
    return <div className="rounded-2xl border border-[#E2E8E5] bg-white p-8 text-sm text-[#5D6B66]">Cargando tus fincas...</div>;
  }

  if (error) {
    return <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm font-semibold text-red-700">{error}</div>;
  }

  if (farms.length === 0) {
    return (
      <div className="rounded-2xl border border-[#E2E8E5] bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-extrabold text-[#0D1F1B]">Aún no tienes fincas registradas</h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-[#5D6B66]">Registra tu primera finca para consultar su capacidad, ubicación y descripción desde aquí.</p>
        <Link href="/dashboard/register-farm" className="mt-6 inline-flex rounded-xl bg-[#063B32] px-5 py-3 text-sm font-bold text-white hover:bg-[#042822]">Registrar finca</Link>
      </div>
    );
  }

  const occupancy = selectedFarm && selectedFarm.capacity_head_count > 0
    ? Math.min(100, Math.round((selectedFarm.capacity_current_head_count / selectedFarm.capacity_head_count) * 100))
    : 0;

  const beginEdit = (batch: Batch) => {
    setEditingBatchId(batch.id);
    setEditTitle(batch.title);
    setEditDescription(batch.description ?? "");
    setEditTargetAmount(String(batch.target_amount));
    setEditDurationMonths(String(batch.duration_months));
    setEditFundingStartDate(batch.funding_start_date.slice(0, 10));
    setActionMessage("");
  };

  const submitEdit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (editingBatchId === null) return;
    try {
      const payload: BatchUpdatePayload = {
        title: editTitle.trim(),
        description: editDescription.trim() || null,
        target_amount: Number(editTargetAmount),
        duration_months: Number(editDurationMonths),
        funding_start_date: `${editFundingStartDate}T00:00:00`,
      };
      await handleUpdateBatch(editingBatchId, payload);
      setEditingBatchId(null);
      setActionMessage("Lote actualizado correctamente.");
    } catch {
      setActionMessage("No fue posible actualizar el lote.");
    }
  };

  const changeStatus = async (batchId: number, status: BatchStatus) => {
    setActionMessage("");
    try {
      await handleUpdateBatchStatus(batchId, status);
      setActionMessage(status === "FUNDING" ? "El lote está iniciando el fondeo." : "El lote fue cancelado.");
    } catch (statusError) {
      setActionMessage(statusError instanceof Error ? statusError.message : "No fue posible cambiar el estado.");
    }
  };

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wide text-[#006244]">Panel de fincas</span>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-[#0D1F1B] sm:text-3xl">Mis Fincas</h1>
          <p className="mt-2 text-sm text-[#5D6B66]">Consulta tu finca y administra los lotes que has creado.</p>
        </div>
        <Link href="/dashboard/register-farm" className="rounded-xl bg-[#063B32] px-4 py-2.5 text-center text-xs font-bold text-white hover:bg-[#042822]">+ Registrar finca</Link>
      </div>

      <div className="rounded-2xl border border-[#E2E8E5] bg-white p-5 shadow-sm">
        <label htmlFor="farm-selector" className="block text-xs font-bold uppercase tracking-wide text-[#62736C]">Finca que deseas observar</label>
        <select id="farm-selector" value={selectedFarmId ?? ""} onChange={(event) => setSelectedFarmId(Number(event.target.value))} className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-3 py-3 text-sm font-bold text-[#0D1F1B] outline-none focus:border-[#006244] sm:max-w-lg">
          {farms.map((farm) => <option key={farm.id} value={farm.id}>{farm.name} — {farm.location}</option>)}
        </select>
      </div>

      {selectedFarm && (
        <>
          <div>
            <h2 className="text-xl font-extrabold text-[#0D1F1B]">{selectedFarm.name}</h2>
            <p className="mt-1 text-sm text-[#5D6B66]">{selectedFarm.location}</p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Capacidad máxima", formatCapacity(selectedFarm.capacity_head_count), "cabezas permitidas"],
              ["Cabezas actuales", formatCapacity(selectedFarm.capacity_current_head_count), "registradas en la finca"],
              ["Ocupación", `${occupancy}%`, "de la capacidad total"],
              ["Capacidad disponible", formatCapacity(Math.max(0, selectedFarm.capacity_head_count - selectedFarm.capacity_current_head_count)), "cabezas disponibles"],
            ].map(([label, value, detail], index) => (
              <div key={label} className="rounded-2xl border border-[#E2E8E5] bg-white p-5 shadow-sm">
                <p className="text-xs font-bold text-[#62736C]">{label}</p>
                <p className={`mt-3 text-3xl font-extrabold ${index === 1 ? "text-[#006244]" : "text-[#0D1F1B]"}`}>{value}</p>
                <p className="mt-1 text-xs text-gray-500">{detail}</p>
                {label === "Ocupación" && <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100"><div className="h-full rounded-full bg-[#10B981]" style={{ width: `${occupancy}%` }} /></div>}
              </div>
            ))}
          </div>

          <section className="rounded-2xl border border-[#E2E8E5] bg-white p-6 shadow-sm">
            <h3 className="text-base font-extrabold text-[#0D1F1B]">Información de la finca</h3>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <div className="flex items-start gap-3"><InfoIcon>⌖</InfoIcon><div><p className="text-xs text-[#62736C]">Ubicación</p><p className="mt-1 font-bold text-[#0D1F1B]">{selectedFarm.location}</p></div></div>
              <div className="flex items-start gap-3"><InfoIcon>⌂</InfoIcon><div><p className="text-xs text-[#62736C]">Descripción</p><p className="mt-1 font-bold text-[#0D1F1B]">{selectedFarm.description || "Sin descripción registrada"}</p></div></div>
              <div className="flex items-start gap-3"><InfoIcon>№</InfoIcon><div><p className="text-xs text-[#62736C]">Identificador</p><p className="mt-1 font-bold text-[#0D1F1B]">Finca #{selectedFarm.id}</p></div></div>
            </div>
          </section>

          <section className="rounded-2xl border border-[#E2E8E5] bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 border-b border-[#E8EEEB] pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div><h3 className="text-xl font-extrabold text-[#0D1F1B]">Mis lotes</h3><p className="mt-1 text-sm text-[#5D6B66]">Lotes creados para {selectedFarm.name}.</p></div>
              <select value={batchStatus} onChange={(event) => setBatchStatus(event.target.value as BatchStatus | "ALL")} className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-bold text-[#0D1F1B] outline-none focus:border-[#006244]">
                <option value="ALL">Todos los estados</option>
                {(Object.keys(statusLabels) as BatchStatus[]).map((status) => <option key={status} value={status}>{statusLabels[status]}</option>)}
              </select>
            </div>
            {batchError && <p className="mt-4 rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-700">{batchError}</p>}
            {batchesLoading ? <p className="py-8 text-center text-sm text-[#62736C]">Cargando lotes...</p> : visibleBatches.length === 0 ? <p className="py-8 text-center text-sm text-[#62736C]">No hay lotes para este filtro.</p> : (
              <div className="mt-5 grid gap-5 lg:grid-cols-2">
                {visibleBatches.map((batch) => {
                  const progress = batch.target_amount > 0 ? Math.min(100, Math.round((batch.collected_amount / batch.target_amount) * 100)) : 0;
                  return <article key={batch.id} className="overflow-hidden rounded-2xl border border-[#DDE7E2] bg-white shadow-sm">
                    <div className="relative h-44 bg-cover bg-center" style={{ backgroundImage: `url(${getBatchImage(batch.id)})` }}>
                      <div className="absolute inset-0 bg-gradient-to-t from-[#071B17] via-transparent to-transparent" />
                      <span className="absolute left-4 top-4 rounded-lg bg-[#071B17]/80 px-3 py-1 text-xs font-bold text-white">{batch.code}</span>
                      <span className="absolute right-4 top-4 rounded-lg bg-[#5BCB35] px-3 py-1 text-xs font-extrabold text-[#063B32]">{batch.estimated_roi_percentage}% ROI</span>
                      <span className="absolute bottom-16 left-4 rounded-lg bg-white/90 px-3 py-1 text-xs font-bold text-[#063B32]">{categoryLabels[batch.category]}</span>
                      <div className="absolute bottom-4 left-4 text-white"><h4 className="text-xl font-extrabold">{batch.title}</h4><p className="text-xs text-[#D6F5E1]">{selectedFarm.location}</p></div>
                    </div>
                    <div className="p-4">
                      <div className="grid grid-cols-3 rounded-xl bg-[#F5F8F6] p-3 text-center text-xs"><div><span className="block text-[#62736C]">Estado</span><strong className="mt-1 block text-[#0D1F1B]">{statusLabels[batch.status]}</strong></div><div><span className="block text-[#62736C]">Plazo</span><strong className="mt-1 block text-[#0D1F1B]">{batch.duration_months} meses</strong></div><div><span className="block text-[#62736C]">Inicio</span><strong className="mt-1 block text-[#0D1F1B]">{formatDate(batch.funding_start_date)}</strong></div></div>
                      <div className="mt-4 flex justify-between text-sm font-bold text-[#0D1F1B]"><span>Recaudado: ${formatMoney(batch.collected_amount)} USDC</span><span className="text-[#006244]">{progress}%</span></div>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#E8EEEB]"><div className="h-full rounded-full bg-[#10B981]" style={{ width: `${progress}%` }} /></div>
                      <p className="mt-2 text-xs text-[#62736C]">Meta: ${formatMoney(batch.target_amount)} USDC</p>
                      {batch.status === "DRAFT" && <div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={() => beginEdit(batch)} className="rounded-lg border border-[#006244] px-3 py-2 text-xs font-bold text-[#006244] hover:bg-[#E8F5EE]">Editar</button><button type="button" onClick={() => void changeStatus(batch.id, "FUNDING")} className="rounded-lg bg-[#063B32] px-3 py-2 text-xs font-bold text-white hover:bg-[#042822]">Iniciar fondeo</button><button type="button" onClick={() => void changeStatus(batch.id, "CANCELLED")} className="rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-50">Cancelar</button></div>}
                      {editingBatchId === batch.id && <form onSubmit={submitEdit} className="mt-4 grid gap-3 border-t border-[#E8EEEB] pt-4 sm:grid-cols-2"><label className="text-xs font-bold text-[#33443E] sm:col-span-2">Título<input required maxLength={150} value={editTitle} onChange={(event) => setEditTitle(event.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 font-normal outline-none focus:border-[#006244]" /></label><label className="text-xs font-bold text-[#33443E] sm:col-span-2">Descripción<textarea rows={2} value={editDescription} onChange={(event) => setEditDescription(event.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 font-normal outline-none focus:border-[#006244]" /></label><label className="text-xs font-bold text-[#33443E]">Meta<input required min="1" step="0.01" type="number" value={editTargetAmount} onChange={(event) => setEditTargetAmount(event.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 font-normal outline-none focus:border-[#006244]" /></label><label className="text-xs font-bold text-[#33443E]">Duración<input required min="1" type="number" value={editDurationMonths} onChange={(event) => setEditDurationMonths(event.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 font-normal outline-none focus:border-[#006244]" /></label><label className="text-xs font-bold text-[#33443E]">Inicio<input required type="date" value={editFundingStartDate} onChange={(event) => setEditFundingStartDate(event.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 font-normal outline-none focus:border-[#006244]" /></label><div className="flex items-end gap-2"><button type="submit" className="rounded-lg bg-[#006244] px-3 py-2 text-xs font-bold text-white">Guardar cambios</button><button type="button" onClick={() => setEditingBatchId(null)} className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-bold text-[#33443E]">Cerrar</button></div></form>}
                    </div>
                  </article>;
                })}
              </div>
            )}
          </section>

          {actionMessage && <p className="rounded-xl bg-[#E8F5EE] p-3 text-xs font-semibold text-[#006244]">{actionMessage}</p>}
        </>
      )}
    </div>
  );
}
