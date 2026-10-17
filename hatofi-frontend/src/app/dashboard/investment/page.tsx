"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { registerInvestment } from "@/lib/api";
import { connectFreighter, investOnChain } from "@/lib/stellar";

interface Lot {
  id: string;
  batchId: number;
  code: string;
  name: string;
  place: string;
  apy: string;
  apyNumber: number;
  breed: string;
  term: string;
  termMonths: number;
  cattle: string;
  raised: string;
  target: string;
  targetUsdc: number;
  progress: number;
  image: string;
  minInvestment: number;
}

const lots: Lot[] = [
  {
    id: "rsr",
    batchId: 1,
    code: "Lote #RSR-104",
    name: "Hacienda Santa Rosalía",
    place: "Montería, Córdoba",
    apy: "15.2%",
    apyNumber: 15.2,
    breed: "Brahman Rojo",
    term: "8 Meses",
    termMonths: 8,
    cattle: "50 Novillos",
    raised: "$41,000 USDC",
    target: "$50,000 USDC",
    targetUsdc: 50000,
    progress: 82,
    minInvestment: 100,
    image: "https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "mirador",
    batchId: 2,
    code: "Lote #MFM-088",
    name: "Finca El Mirador",
    place: "Armenia, Quindío",
    apy: "14.8%",
    apyNumber: 14.8,
    breed: "Brangus",
    term: "10 Meses",
    termMonths: 10,
    cattle: "65 Novillos",
    raised: "$32,000 USDC",
    target: "$50,000 USDC",
    targetUsdc: 50000,
    progress: 64,
    minInvestment: 100,
    image: "https://images.unsplash.com/photo-1551884831-bbf3cdc6469e?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "benito",
    batchId: 3,
    code: "Lote #SB-202",
    name: "Hacienda San Benito",
    place: "Puerto López, Meta",
    apy: "16.0%",
    apyNumber: 16.0,
    breed: "Exportación F1",
    term: "6 Meses",
    termMonths: 6,
    cattle: "70 Reses",
    raised: "$76,000 USDC",
    target: "$80,000 USDC",
    targetUsdc: 80000,
    progress: 95,
    minInvestment: 250,
    image: "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=800&q=80",
  },
];

export default function InvestmentPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [toastMessage, setToastMessage] = useState("");
  const [simulateModalOpen, setSimulateModalOpen] = useState(false);
  const [selectedLot, setSelectedLot] = useState<Lot>(lots[0]);
  const [amountUsdc, setAmountUsdc] = useState<number>(1000);
  const [dividendClaimed, setDividendClaimed] = useState(false);
  const [investmentSubmitting, setInvestmentSubmitting] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  const calculateReturn = () => {
    const apy = selectedLot.apyNumber / 100;
    const months = selectedLot.termMonths;
    const rawGain = amountUsdc * apy * (months / 12);
    const total = amountUsdc + rawGain;
    const kgBeef = Math.round(amountUsdc / 2.28);
    return {
      gain: rawGain.toFixed(2),
      total: total.toFixed(2),
      kgBeef,
    };
  };

  const simulation = calculateReturn();

  const handleOpenInvestModal = (lot: Lot) => {
    setSelectedLot(lot);
    setAmountUsdc(lot.minInvestment * 5);
    setSimulateModalOpen(true);
  };

  const handleConfirmInvestment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (investmentSubmitting) return;
    setInvestmentSubmitting(true);
    try {
      const session = JSON.parse(
        localStorage.getItem("hatofi_session") ?? "{}",
      ) as { access_token?: string };
      if (!session.access_token) {
        throw new Error("Inicia sesión con una cuenta conectada al backend antes de invertir.");
      }
      const walletAddress = await connectFreighter();
      const transactionHash = await investOnChain(
        walletAddress,
        selectedLot.batchId,
        amountUsdc.toFixed(2),
      );
      await registerInvestment({
        batchId: selectedLot.batchId,
        amount: amountUsdc.toFixed(2),
        walletAddress,
        transactionHash,
      });
      setSimulateModalOpen(false);
      showToast(`✓ Inversión confirmada en Stellar: ${transactionHash.slice(0, 12)}...`);
    } catch (error) {
      showToast(error instanceof Error ? error.message : "No se pudo completar la inversión.");
    } finally {
      setInvestmentSubmitting(false);
    }
  };

  // Escuchar evento personalizado desde el sidebar para abrir simulador
  useEffect(() => {
    const handleOpenSim = () => setSimulateModalOpen(true);
    window.addEventListener("open-simulate-modal", handleOpenSim);
    return () => window.removeEventListener("open-simulate-modal", handleOpenSim);
  }, []);

  return (
    <div className="flex flex-col gap-6 w-full">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#006244] text-white px-5 py-3 rounded-xl shadow-xl text-xs font-bold flex items-center gap-3 animate-fade-in border border-[#10B981]">
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage("")} className="text-white hover:text-emerald-200 cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* Top Header Limpio */}
      <div className="flex flex-col gap-1.5 max-w-3xl">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0D1F1B] tracking-tight">
          Mercado Primario de Inversión Pecuaria RWA
        </h1>
        <p className="text-xs sm:text-sm text-[#5D6B66] leading-relaxed">
          Financia lotes certificados de terneros de ceba con garantías prendarias verificadas por ICA y liquidación autónoma mediante contratos inteligentes en Stellar Soroban.
        </p>
      </div>

      {/* KPI Bento Row (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Capital Total Financiado */}
        <div className="p-5 rounded-2xl bg-white border border-[#E2E8E5] shadow-sm flex flex-col justify-between min-h-[170px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#62736C]">Capital Total Sindicado</span>
            <div className="w-8 h-8 rounded-lg bg-[#E8F3EE] flex items-center justify-center text-[#006244]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="8" />
                <line x1="12" x2="12" y1="8" y2="16" />
                <path d="M14.5 10a2.5 2.5 0 0 0-5 0c0 3 5 1.5 5 4.5a2.5 2.5 0 0 1-5 0" />
              </svg>
            </div>
          </div>
          <div className="my-2">
            <div className="text-2xl sm:text-3xl font-extrabold text-[#0D1F1B] tracking-tight">
              $184,500 <span className="text-xs font-medium text-gray-500">USDC</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-[#059669] font-bold">
              <span>▲</span>
              <span>+18.4% vs mes anterior</span>
            </div>
          </div>
          <span className="text-[11px] text-gray-400 font-medium mt-auto">
            Garantizado 100% con prenda agraria
          </span>
        </div>

        {/* Card 2: Rendimiento Promedio (APY) */}
        <div className="p-5 rounded-2xl bg-white border border-[#E2E8E5] shadow-sm flex flex-col justify-between min-h-[170px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#62736C]">Rendimiento Promedio</span>
            <div className="w-8 h-8 rounded-lg bg-[#E8F3EE] flex items-center justify-center text-[#006244]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                <polyline points="16 7 22 7 22 13" />
              </svg>
            </div>
          </div>
          <div className="my-2">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#006244] tracking-tight">15.3%</span>
              <span className="text-xs text-gray-500 font-bold">APY</span>
            </div>
            <span className="text-xs text-[#059669] font-semibold mt-1 block">
              Ganancia diaria de peso (GDP)
            </span>
          </div>
          <span className="text-[11px] text-gray-400 font-medium mt-auto">
            Tasa neta libre de intermediarios
          </span>
        </div>

        {/* Card 3: Lotes Activos */}
        <div className="p-5 rounded-2xl bg-white border border-[#E2E8E5] shadow-sm flex flex-col justify-between min-h-[170px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#62736C]">Lotes Activos en Ceba</span>
            <div className="w-8 h-8 rounded-lg bg-[#E8F3EE] flex items-center justify-center text-[#006244]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
          </div>
          <div className="my-2">
            <div className="text-2xl sm:text-3xl font-extrabold text-[#0D1F1B] tracking-tight">
              3 <span className="text-xs font-medium text-gray-500">Lotes</span>
            </div>
            <span className="text-xs text-gray-500 mt-1 block">185 Novillos en pastoreo activo</span>
          </div>
          <span className="text-[11px] text-[#059669] font-bold mt-auto">
            ✓ Aretes RFID verificados
          </span>
        </div>

        {/* Card 4: Dividendos por Reclamar */}
        <div className="p-5 rounded-2xl bg-white border border-[#E2E8E5] shadow-sm flex flex-col justify-between min-h-[170px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#62736C]">Dividendos Disponibles</span>
            <div className="w-8 h-8 rounded-lg bg-[#E8F3EE] flex items-center justify-center text-[#006244]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="14" x="2" y="5" rx="2" />
                <line x1="2" x2="22" y1="10" y2="10" />
              </svg>
            </div>
          </div>
          <div className="my-2">
            <div className="text-2xl sm:text-3xl font-extrabold text-[#006244] tracking-tight">
              {dividendClaimed ? "$0.00" : "$1,850.50"} <span className="text-xs font-medium text-gray-500">USDC</span>
            </div>
            <span className="text-[11px] text-gray-500 mt-1 block">
              {dividendClaimed ? "✓ Acreditado en billetera" : "Dispersión mensual de Lote #RSR-104"}
            </span>
          </div>
          <button
            type="button"
            disabled={dividendClaimed}
            onClick={() => {
              setDividendClaimed(true);
              showToast("✓ $1,850.50 USDC acreditados en tu cuenta Stellar Soroban.");
            }}
            className="w-full mt-auto py-2 px-3 bg-[#063B32] hover:bg-[#042822] text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {dividendClaimed ? "Reclamado ✓" : "Reclamar Dividendos"}
          </button>
        </div>
      </div>

      {/* Lotes Disponibles Section */}
      <div className="bg-white rounded-2xl border border-[#E2E8E5] shadow-sm p-6 sm:p-7 flex flex-col gap-6">
        
        {/* Section Header with Category Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EEF2F0]">
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-[#0D1F1B]">
              Lotes Disponibles para Financiación
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Originaciones pecuarias abiertas para sindicación con trazabilidad de aretes oficial.
            </p>
          </div>

          <div className="overflow-x-auto max-w-full pb-1 sm:pb-0">
            <div className="inline-flex p-1 rounded-xl bg-[#F0F4F2] text-xs font-bold shrink-0 gap-1 text-[#62736C]">
              <button
                type="button"
                onClick={() => setSelectedCategory("all")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === "all" ? "bg-white text-[#006244] shadow-sm" : "hover:text-[#0D1F1B]"
                }`}
              >
                Todos los Lotes
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory("ceba")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === "ceba" ? "bg-white text-[#006244] shadow-sm" : "hover:text-[#0D1F1B]"
                }`}
              >
                Ceba Intensiva
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory("cria")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === "cria" ? "bg-white text-[#006244] shadow-sm" : "hover:text-[#0D1F1B]"
                }`}
              >
                Cría & Levante
              </button>
            </div>
          </div>
        </div>

        {/* Grid de Tarjetas de Lotes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lots.map((lot) => (
            <article
              key={lot.id}
              className="rounded-2xl border border-[#E2E8E5] bg-white overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              {/* Imagen con Badges Superpuestos */}
              <div className="relative h-48 w-full bg-gray-900">
                <Image
                  src={lot.image}
                  alt={lot.name}
                  fill
                  className="object-cover opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                
                {/* Badges superiores */}
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white text-[11px] font-bold">
                  {lot.code}
                </div>
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-[#5BCB35] text-[#063B32] text-xs font-black shadow-md">
                  {lot.apy} APY
                </div>

                {/* Info inferior en la foto */}
                <div className="absolute bottom-3 left-3 text-white">
                  <h3 className="font-extrabold text-sm sm:text-base leading-tight">{lot.name}</h3>
                  <span className="text-[11px] text-[#A7F3D0] flex items-center gap-1 mt-0.5">
                    📍 {lot.place}
                  </span>
                </div>
              </div>

              {/* Detalles del Lote */}
              <div className="p-5 flex flex-col gap-4 flex-1 justify-between">
                
                {/* 3 Métricas del lote */}
                <div className="grid grid-cols-3 gap-2 p-2.5 bg-[#F8FAF9] rounded-xl text-center text-xs border border-[#EEF2F0]">
                  <div>
                    <span className="text-[10px] text-gray-500 block">Raza</span>
                    <strong className="text-[#0D1F1B] font-bold truncate block">{lot.breed}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 block">Plazo</span>
                    <strong className="text-[#0D1F1B] font-bold block">{lot.term}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 block">Población</span>
                    <strong className="text-[#0D1F1B] font-bold block">{lot.cattle}</strong>
                  </div>
                </div>

                {/* Barra de Fondeo */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-gray-600">Recaudado: <strong className="text-gray-900">{lot.raised}</strong></span>
                    <span className="text-[#006244] font-bold">{lot.progress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full bg-[#10B981] rounded-full"
                      style={{ width: `${lot.progress}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-[11px] text-gray-500">
                    <span>Meta: {lot.target}</span>
                    <span className="font-semibold text-gray-700">Mín. ${lot.minInvestment} USDC</span>
                  </div>
                </div>

                {/* Botón Invertir */}
                <button
                  type="button"
                  onClick={() => handleOpenInvestModal(lot)}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#063B32] hover:bg-[#042822] text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <span>Invertir en este Lote</span>
                  <span>→</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* MODAL SIMULAR / INVERTIR */}
      {simulateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-gray-200">
            <div className="flex justify-between items-center mb-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-[#10B981] tracking-wider block">
                  Bóveda Soroban • Fondeo Colectivo
                </span>
                <h3 className="text-lg font-extrabold text-[#0D1F1B]">{selectedLot.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSimulateModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="bg-[#F8FAF9] p-3 rounded-xl border border-gray-200 text-xs space-y-1.5 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-500">Código de Lote:</span>
                <strong className="text-gray-900">{selectedLot.code}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Rendimiento Proyectado:</span>
                <strong className="text-[#059669] font-bold">{selectedLot.apy} APY</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Duración del Ciclo:</span>
                <strong className="text-gray-900">{selectedLot.term}</strong>
              </div>
            </div>

            <form onSubmit={handleConfirmInvestment} className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-gray-700">Monto a Depositar (USDC):</label>
                  <span className="text-base font-extrabold text-[#006244]">${amountUsdc.toLocaleString()} USDC</span>
                </div>
                <input
                  type="range"
                  min={selectedLot.minInvestment}
                  max={selectedLot.targetUsdc}
                  step={50}
                  value={amountUsdc}
                  onChange={(e) => setAmountUsdc(Number(e.target.value))}
                  className="w-full accent-[#006244] cursor-pointer"
                />
              </div>

              {/* Resultado Simulado */}
              <div className="p-3 bg-[#ECFDF5] border border-[#A7F3D0] rounded-xl text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-[#065F46]">Rendimiento Estimado:</span>
                  <strong className="text-[#065F46] font-bold">+${simulation.gain} USDC</strong>
                </div>
                <div className="flex justify-between font-bold text-[#0D1F1B] pt-1 border-t border-[#A7F3D0]/50">
                  <span>Total al Vencimiento:</span>
                  <span className="text-sm text-[#006244]">${simulation.total} USDC</span>
                </div>
                <div className="text-[11px] text-[#059669] pt-1">
                  Equivalente aproximado a <strong>~{simulation.kgBeef} kg</strong> de carne en pie.
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSimulateModalOpen(false)}
                  className="w-full sm:w-auto px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer text-center"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={investmentSubmitting}
                  className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold text-white bg-[#063B32] hover:bg-[#042822] rounded-xl cursor-pointer shadow-md text-center disabled:opacity-50 disabled:cursor-wait"
                >
                  {investmentSubmitting ? "Esperando confirmación..." : "Confirmar Inversión en Soroban"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
