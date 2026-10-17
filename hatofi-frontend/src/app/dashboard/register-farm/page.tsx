"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { createFarm } from "@/lib/farm-api";

export default function RegisterFarmPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [capacity, setCapacity] = useState("");
  const [currentCapacity, setCurrentCapacity] = useState("0");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      await createFarm({
        name: name.trim(),
        description: description.trim() || undefined,
        location: location.trim(),
        capacity_head_count: Number(capacity),
        capacity_current_head_count: Number(currentCapacity),
      });
      router.push("/dashboard/my-farm");
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "No fue posible registrar la finca.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl">
      <Link href="/dashboard/my-farm" className="text-xs font-bold text-[#006244] hover:underline">
        ← Volver a Mis Fincas
      </Link>
      <div className="mt-4 rounded-2xl border border-[#E2E8E5] bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-extrabold tracking-tight text-[#0D1F1B]">Registrar finca</h1>
        <p className="mt-2 text-sm text-[#5D6B66]">Completa los datos que se guardarán en tu registro de fincas.</p>

        {error && <p className="mt-5 rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-700">{error}</p>}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block text-sm font-bold text-[#33443E]">
            Nombre de la finca
            <input required maxLength={150} value={name} onChange={(event) => setName(event.target.value)} className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm font-normal outline-none focus:border-[#006244]" />
          </label>
          <label className="block text-sm font-bold text-[#33443E]">
            Ubicación
            <input required maxLength={255} value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Municipio, departamento" className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm font-normal outline-none focus:border-[#006244]" />
          </label>
          <label className="block text-sm font-bold text-[#33443E]">
            Descripción <span className="font-normal text-gray-500">(opcional)</span>
            <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={3} className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm font-normal outline-none focus:border-[#006244]" />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-bold text-[#33443E]">
              Capacidad máxima (cabezas)
              <input required min="0" type="number" value={capacity} onChange={(event) => setCapacity(event.target.value)} className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm font-normal outline-none focus:border-[#006244]" />
            </label>
            <label className="block text-sm font-bold text-[#33443E]">
              Cabezas actuales
              <input required min="0" type="number" value={currentCapacity} onChange={(event) => setCurrentCapacity(event.target.value)} className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm font-normal outline-none focus:border-[#006244]" />
            </label>
          </div>
          <button disabled={saving} type="submit" className="w-full rounded-xl bg-[#063B32] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#042822] disabled:cursor-not-allowed disabled:opacity-60">
            {saving ? "Guardando..." : "Registrar finca"}
          </button>
        </form>
      </div>
    </div>
  );
}
