"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";
import { type BatchCategory } from "@/lib/batch-api";
import { useMyFarm } from "../my-farm/hook/use-my-farm";

const categoryOptions: Array<{ value: BatchCategory; label: string }> = [
  { value: "CEBA_INTENSIVA", label: "Ceba intensiva" },
  { value: "CRIA_LEVANTE", label: "Cría & levante" },
];

export default function CreateBatchPage() {
  const { farms, loading, error, creatingBatch, handleCreateBatch } = useMyFarm();
  const [farmId, setFarmId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<BatchCategory>("CEBA_INTENSIVA");
  const [targetAmount, setTargetAmount] = useState("");
  const [durationMonths, setDurationMonths] = useState("");
  const [fundingStartDate, setFundingStartDate] = useState("");
  const [message, setMessage] = useState("");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    try {
      await handleCreateBatch({
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        target_amount: Number(targetAmount),
        duration_months: Number(durationMonths),
        funding_start_date: `${fundingStartDate}T00:00:00`,
        farm_id: Number(farmId || farms[0]?.id),
      });
      setTitle("");
      setDescription("");
      setCategory("CEBA_INTENSIVA");
      setTargetAmount("");
      setDurationMonths("");
      setFundingStartDate("");
      setMessage("Lote creado correctamente en estado borrador.");
    } catch {
      // El hook expone el error de la API en la vista.
    }
  };

  if (loading) return <div className="rounded-2xl border border-[#E2E8E5] bg-white p-8 text-sm text-[#5D6B66]">Cargando tus fincas...</div>;
  if (error) return <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm font-semibold text-red-700">{error}</div>;
  if (farms.length === 0) return <div className="rounded-2xl border border-[#E2E8E5] bg-white p-8 text-center"><h1 className="text-2xl font-extrabold">Registra una finca primero</h1><Link href="/dashboard/register-farm" className="mt-5 inline-flex rounded-xl bg-[#063B32] px-5 py-3 text-sm font-bold text-white">Registrar finca</Link></div>;

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="mb-6"><span className="text-xs font-bold uppercase tracking-wide text-[#006244]">Gestión ganadera</span><h1 className="mt-1 text-3xl font-extrabold text-[#0D1F1B]">Crear nuevo lote</h1><p className="mt-2 text-sm text-[#5D6B66]">Los lotes nuevos se guardan como borrador y puedes editarlos antes de iniciar el fondeo.</p></div>
      <form onSubmit={submit} className="grid gap-4 rounded-2xl border border-[#E2E8E5] bg-white p-6 shadow-sm sm:grid-cols-2">
        <label className="text-sm font-bold text-[#33443E] sm:col-span-2">Finca<select required value={farmId || farms[0]?.id} onChange={(event) => setFarmId(event.target.value)} className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 font-normal outline-none focus:border-[#006244]">{farms.map((farm) => <option key={farm.id} value={farm.id}>{farm.name} — {farm.location}</option>)}</select></label>
        <label className="text-sm font-bold text-[#33443E] sm:col-span-2">Título<input required maxLength={150} value={title} onChange={(event) => setTitle(event.target.value)} className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2.5 font-normal outline-none focus:border-[#006244]" /></label>
        <label className="text-sm font-bold text-[#33443E] sm:col-span-2">Categoría<select required value={category} onChange={(event) => setCategory(event.target.value as BatchCategory)} className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 font-normal outline-none focus:border-[#006244]">{categoryOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
        <label className="text-sm font-bold text-[#33443E] sm:col-span-2">Descripción <span className="font-normal text-gray-500">(opcional)</span><textarea rows={3} value={description} onChange={(event) => setDescription(event.target.value)} className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2.5 font-normal outline-none focus:border-[#006244]" /></label>
        <label className="text-sm font-bold text-[#33443E]">Meta de financiación<input required min="1" step="0.01" type="number" value={targetAmount} onChange={(event) => setTargetAmount(event.target.value)} className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2.5 font-normal outline-none focus:border-[#006244]" /></label>
        <label className="text-sm font-bold text-[#33443E]">Duración (meses)<input required min="1" type="number" value={durationMonths} onChange={(event) => setDurationMonths(event.target.value)} className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2.5 font-normal outline-none focus:border-[#006244]" /></label>
        <label className="text-sm font-bold text-[#33443E]">Inicio de financiación<input required type="date" value={fundingStartDate} onChange={(event) => setFundingStartDate(event.target.value)} className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2.5 font-normal outline-none focus:border-[#006244]" /></label>
        {message && <p className="sm:col-span-2 rounded-xl bg-[#E8F5EE] p-3 text-xs font-semibold text-[#006244]">{message}</p>}
        <div className="flex items-end justify-end sm:col-span-2"><button disabled={creatingBatch} type="submit" className="w-full rounded-xl bg-[#063B32] px-5 py-3 text-sm font-bold text-white hover:bg-[#042822] disabled:opacity-60 sm:w-auto">{creatingBatch ? "Guardando..." : "Crear lote"}</button></div>
      </form>
    </div>
  );
}
