"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

type Role = "admin" | "developer" | "inversionista" | "ganadero";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // La sesión identifica al usuario; la ruta solo evita un cambio visual antes de leerla.
  const [role, setRole] = useState<Role | null>(null);

  const [userName, setUserName] = useState("");
  const [userAccount, setUserAccount] = useState("");

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      try {
        const session = localStorage.getItem("hatofi_session");
        if (session) {
          const parsed = JSON.parse(session);
          if (parsed.role) setRole(parsed.role);
          if (parsed.name) setUserName(parsed.name);
          if (parsed.account) setUserAccount(parsed.account);
        } else {
          // cerrar sesión si no hay sesión almacenada
          localStorage.removeItem("hatofi_session");
          localStorage.removeItem("hatofi_access_token");
          router.push("/login");
        }
      } catch {
        // Mantener los valores iniciales si la sesión almacenada no es válida.
      }

    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [pathname]);

  const handleLogout = () => {
    try {
      localStorage.removeItem("hatofi_session");
      localStorage.removeItem("hatofi_access_token");
    } catch {}
    router.push("/login");
  };

  const [comingSoonFeature, setComingSoonFeature] = useState<string | null>(null);

  // Enlaces de navegación según rol (con SVG icons limpios y estado disponible/próximamente)
  const navItems = role === "inversionista" ? [
    {
      href: "/dashboard/investment",
      label: "Explorar Lotes",
      available: true,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="7" height="7" x="3" y="3" rx="1" />
          <rect width="7" height="7" x="14" y="3" rx="1" />
          <rect width="7" height="7" x="14" y="14" rx="1" />
          <rect width="7" height="7" x="3" y="14" rx="1" />
        </svg>
      ),
    },
    {
      href: "#simular",
      label: "Simulador RWA",
      available: true,
      action: () => {
        window.dispatchEvent(new CustomEvent("open-simulate-modal"));
      },
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 3v18h18" />
          <path d="m19 9-5 5-4-4-3 3" />
        </svg>
      ),
    },
    {
      href: "#liquidaciones",
      label: "Liquidaciones RWA",
      available: false,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="20" height="14" x="2" y="5" rx="2" />
          <line x1="2" x2="22" y1="10" y2="10" />
        </svg>
      ),
    },
    {
      href: "#analitica",
      label: "Analítica Pecuaria",
      available: false,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" x2="18" y1="20" y2="10" />
          <line x1="12" x2="12" y1="20" y2="4" />
          <line x1="6" x2="6" y1="20" y2="14" />
        </svg>
      ),
    },
    {
      href: "#billetera",
      label: "Billetera Soroban",
      available: false,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
          <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
          <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
        </svg>
      ),
    },
  ] : role === "ganadero" ? [
    {
      href: "/dashboard/my-farm",
      label: "Mis Fincas",
      available: true,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 21h18M5 21V10l7-5 7 5v11M9 21v-6a3 3 0 0 1 6 0v6M9 10h6" />
        </svg>
      ),
    },
    {
      href: "/dashboard/register-farm",
      label: "Registrar Finca",
      available: true,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 21h18M5 21V10l7-5 7 5v11" />
          <path d="M12 10v6M9 13h6" />
        </svg>
      ),
    },
    {
      href: "/dashboard/create-batch",
      label: "Crear Lote",
      available: true,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5V5.8a1.8 1.8 0 0 1 1.8-1.8h12.4A1.8 1.8 0 0 1 20 5.8v13.7" />
          <path d="M4 19.5c0-1.1.9-2 2-2h14M12 7v7M8.5 10.5h7" />
        </svg>
      ),
    },
    {
      href: "/dashboard/cattle",
      label: "Inventario Bovino",
      available: true,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
          <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
        </svg>
      ),
    },
    {
      href: "#solicitar-lote",
      label: "Solicitar Lote Ceba",
      available: false,
      action: () => {
        window.dispatchEvent(new CustomEvent("open-new-batch-modal"));
      },
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      ),
    },
    {
      href: "#certificado-ica",
      label: "Certificado ICA",
      available: false,
      action: () => {
        window.dispatchEvent(new CustomEvent("download-ica-cert"));
      },
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      ),
    },
    {
      href: "#bascula",
      label: "Báscula IoT & Pesaje",
      available: false,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
          <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
          <path d="M7 21h10M12 3v18M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
        </svg>
      ),
    },
    {
      href: "#liquidaciones",
      label: "Liquidaciones",
      available: false,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="20" height="14" x="2" y="5" rx="2" />
          <line x1="2" x2="22" y1="10" y2="10" />
        </svg>
      ),
    },
  ] : [];

  return (
    <div className="min-h-screen bg-[#F4F7F5] flex flex-col antialiased text-[#0D1F1B]">
      
      {/* SIDEBAR DESKTOP */}
      <aside className="fixed left-0 top-0 h-full w-72 bg-white z-50 hidden lg:flex flex-col justify-between p-6 border-r border-[#E2E8E5] shadow-[0_10px_30px_-5px_rgba(10,92,54,0.04)]">
        <div className="flex flex-col gap-6">
          
          {/* Brand Header con Static Profile Badge */}
          <div className="flex items-center justify-between">
            <Link href={role === "inversionista" ? "/dashboard/investment" : "/dashboard/my-farm"} className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-white border border-[#E2E8E5] p-1.5 flex items-center justify-center shadow-sm">
                <Image
                  src="/brand/hatofi-icon.svg"
                  alt="HatoFi"
                  width={30}
                  height={30}
                  priority
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <span className="font-extrabold text-base tracking-tight text-[#063B32] block leading-tight">
                  HatoFi
                </span>
                <span className="text-[9px] font-bold tracking-widest text-[#7C8B85] uppercase block">
                  {role === "inversionista" ? "Pecuaria RWA" : "Ganadería RWA"}
                </span>
              </div>
            </Link>

            {/* Static Role Badge (Informativo, sin cambiar rol) */}
            <div className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#E8F3EE] text-[#006244] border border-[#CCE3D8]">
              <span>{role === "inversionista" ? "Inversor" : "Ganadero"}</span>
            </div>
          </div>

          {/* Navegación Principal */}
          <nav className="flex flex-col gap-1.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              if (item.available) {
                return item.action ? (
                  <button
                    key={item.label}
                    type="button"
                    onClick={item.action}
                    className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#5A6963] hover:bg-[#F0F4F2] hover:text-[#0D1F1B] transition-all text-left cursor-pointer"
                  >
                    <span className="text-[#84958E]">{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ) : (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? "bg-[#E8F5E9] text-[#006244] shadow-sm"
                        : "text-[#5A6963] hover:bg-[#F0F4F2] hover:text-[#0D1F1B]"
                    }`}
                  >
                    <span className={isActive ? "text-[#006244]" : "text-[#84958E]"}>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                );
              }
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setComingSoonFeature(item.label)}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium text-[#7A8A84] hover:bg-[#F0F4F2] hover:text-[#0D1F1B] transition-colors text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-[#9CA9A3] group-hover:text-[#5A6963]">{item.icon}</span>
                    <span className="truncate">{item.label}</span>
                  </div>
                  <span className="text-[9px] font-semibold tracking-wide px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 uppercase border border-gray-200 shrink-0">
                    Pronto
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="flex flex-col gap-3 pt-4 border-t border-[#EEF2F0]">
          
          {/* Network Badge */}
          <div className="flex items-center justify-between px-3 py-1.5 rounded-full bg-[#F0F4F2] text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
              <span className="text-[11px] font-semibold text-[#3D4D47]">
                {role === "ganadero" ? "ICA SIGMA Conectado" : "Stellar Mainnet"}
              </span>
            </div>
            <span className="text-[10px] font-bold text-[#059669]">Online</span>
          </div>

          {/* User Account Card con Logout Button */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F0F4F2] border border-[#E2E8E5]">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#006244] text-white flex items-center justify-center font-bold text-xs shrink-0">
                {userName.charAt(0) || "U"}
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-[#0D1F1B] truncate block">{userName}</span>
                <span className="text-[10px] text-[#71807A] truncate block">{userAccount}</span>
              </div>
            </div>

            {/* Botón Logout */}
            <button
              onClick={handleLogout}
              title="Cerrar sesión"
              className="p-1.5 rounded-lg text-[#84958E] hover:text-[#DC2626] hover:bg-white transition-colors cursor-pointer"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" x2="9" y1="12" y2="12" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* TOPBAR & MAIN CONTENT WRAPPER */}
      <div className="lg:pl-72 flex flex-col flex-1 min-w-0">
        
        {/* TOPBAR */}
        <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#E2E8E5] h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
          
          <div className="flex items-center gap-3 min-w-0">
            {/* Botón menú móvil */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" x2="21" y1="6" y2="6" /><line x1="3" x2="21" y1="12" y2="12" /><line x1="3" x2="21" y1="18" y2="18" />
              </svg>
            </button>

            <span className="text-xs sm:text-sm font-semibold text-[#5A6963] truncate">
              {role === "ganadero"
                ? "Portal del Productor Ganadero RWA • Hacienda La Palmira"
                : "Plataforma de Inversión Pecuaria RWA"}
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            {/* Ticker Ganado en Pie */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F0F4F2] text-xs text-[#55645E]">
              <span className="text-[#10B981] font-bold">●</span>
              <span>Ganado en Pie:</span>
              <strong className="text-[#0D1F1B]">$8,950 COP/kg</strong>
              <small className="text-gray-400">(~$2.28 USD)</small>
            </div>

            {/* Saldo Pill */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8F5E9] text-[#006244] text-xs font-bold border border-[#CCE3D8]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#006244]">
                <line x1="12" x2="12" y1="2" y2="22" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
              <span>{role === "ganadero" ? "$13,685.00 USD" : "$14,250.00 USDC"}</span>
            </div>

            {/* Campana */}
            <button
              type="button"
              onClick={() => setComingSoonFeature("Centro de Notificaciones")}
              className="relative p-2 rounded-full text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
              </svg>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#10B981]"></span>
            </button>

            {/* User Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="w-8 h-8 rounded-full bg-[#006244] text-white flex items-center justify-center font-bold text-xs ring-2 ring-emerald-100 cursor-pointer"
              >
                {userName.charAt(0) || "U"}
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-50 text-xs">
                  <div className="px-3 py-2 border-b border-gray-100">
                    <span className="font-bold text-gray-900 block truncate">{userName}</span>
                    <span className="text-[11px] text-gray-500 block truncate">{role === "ganadero" ? "Ganadero Rural" : "Inversor Institucional"}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2.5 text-rose-600 hover:bg-rose-50 font-bold flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" />
                    </svg>
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* MODAL PRÓXIMAMENTE */}
        {comingSoonFeature && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-[#E8F5E9] text-[#006244] flex items-center justify-center mb-4">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#006244] bg-[#E8F3EE] px-2.5 py-0.5 rounded-full mb-2">
                En Desarrollo
              </span>
              <h3 className="text-base font-extrabold text-[#0D1F1B] mb-2">
                {comingSoonFeature}
              </h3>
              <p className="text-xs text-[#5D6B66] leading-relaxed mb-6">
                Próximamente tendremos esta función disponible. Nuestro equipo está auditando e implementando este módulo para el ecosistema ganadero de HatoFi.
              </p>
              <button
                type="button"
                onClick={() => setComingSoonFeature(null)}
                className="w-full py-2.5 rounded-xl bg-[#063B32] hover:bg-[#042822] text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        )}

        {/* MOBILE OFF-CANVAS DRAWER */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop con Blur */}
            <div
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            ></div>

            {/* Panel Deslizante Lateral */}
            <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-white shadow-2xl flex flex-col justify-between p-6 z-50 animate-slide-right">
              <div className="flex flex-col gap-6">
                
                {/* Brand Header */}
                <div className="flex items-center justify-between pb-4 border-b border-[#EEF2F0]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-white border border-[#E2E8E5] p-1 flex items-center justify-center shadow-sm">
                      <Image
                        src="/brand/hatofi-icon.svg"
                        alt="HatoFi"
                        width={28}
                        height={28}
                        priority
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div>
                      <span className="font-extrabold text-sm text-[#063B32] block leading-tight">HatoFi</span>
                      <span className="text-[9px] font-bold tracking-widest text-[#7C8B85] uppercase block">
                        {role === "inversionista" ? "Pecuaria RWA" : "Ganadería RWA"}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>

                {/* Role Tag */}
                <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-[#E8F3EE] text-[#006244] text-xs font-bold border border-[#CCE3D8]">
                  <span>Perfil Activo:</span>
                  <span className="uppercase text-[11px]">{role === "inversionista" ? "Inversor" : "Ganadero"}</span>
                </div>

                {/* Nav Items */}
                <nav className="flex flex-col gap-1.5">
                  {navItems.map((item) => {
                    if (item.available) {
                      return item.action ? (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => {
                            setMobileMenuOpen(false);
                            item.action();
                          }}
                          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#5A6963] hover:bg-[#F0F4F2] hover:text-[#0D1F1B] transition-all text-left"
                        >
                          <span className="text-[#84958E]">{item.icon}</span>
                          <span>{item.label}</span>
                        </button>
                      ) : (
                        <Link
                          key={item.label}
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                            pathname === item.href
                              ? "bg-[#E8F5E9] text-[#006244] shadow-sm"
                              : "text-[#5A6963] hover:bg-[#F0F4F2] hover:text-[#0D1F1B]"
                          }`}
                        >
                          <span className={pathname === item.href ? "text-[#006244]" : "text-[#84958E]"}>{item.icon}</span>
                          <span>{item.label}</span>
                        </Link>
                      );
                    }
                    return (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          setComingSoonFeature(item.label);
                        }}
                        className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium text-[#7A8A84] hover:bg-[#F0F4F2] hover:text-[#0D1F1B] transition-colors text-left cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-[#9CA9A3] group-hover:text-[#5A6963]">{item.icon}</span>
                          <span>{item.label}</span>
                        </div>
                        <span className="text-[9px] font-semibold tracking-wide px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 uppercase border border-gray-200">
                          Pronto
                        </span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Drawer Footer */}
              <div className="flex flex-col gap-3 pt-4 border-t border-[#EEF2F0]">
                {/* Network */}
                <div className="flex items-center justify-between px-3 py-1.5 rounded-full bg-[#F0F4F2] text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
                    <span className="text-[11px] font-semibold text-[#3D4D47]">
                      {role === "ganadero" ? "ICA SIGMA Conectado" : "Stellar Mainnet"}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-[#059669]">Online</span>
                </div>

                {/* User Info & Logout */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F0F4F2] border border-[#E2E8E5]">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-[#006244] text-white flex items-center justify-center font-bold text-xs shrink-0">
                      {userName.charAt(0) || "U"}
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-[#0D1F1B] truncate block">{userName}</span>
                      <span className="text-[10px] text-[#71807A] truncate block">{userAccount}</span>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    title="Cerrar sesión"
                    className="p-1.5 rounded-lg text-[#84958E] hover:text-[#DC2626] hover:bg-white transition-colors"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" x2="9" y1="12" y2="12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CONTENIDO DE LA PÁGINA */}
        <main className="flex-1 w-full max-w-[1440px] mx-auto p-3 sm:p-5 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
