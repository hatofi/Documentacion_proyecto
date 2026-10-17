"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { loginUser, type AuthUser } from "@/lib/auth-api";

const REMEMBERED_LOGIN_KEY = "hatofi_remembered_login";
const ACCESS_TOKEN_KEY = "hatofi_access_token";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      try {
        const rememberedLogin = localStorage.getItem(REMEMBERED_LOGIN_KEY);
        if (!rememberedLogin) return;

        const { identifier: rememberedIdentifier, password: rememberedPassword } = JSON.parse(rememberedLogin) as {
          identifier?: string;
          password?: string;
        };

        if (rememberedIdentifier) setIdentifier(rememberedIdentifier);
        if (rememberedPassword) setPassword(rememberedPassword);
      } catch {
        localStorage.removeItem(REMEMBERED_LOGIN_KEY);
      }
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const handleApiLogin = (user: AuthUser, accessToken: string) => {
    const isGanadero = user.role.name === "user_farmer";
    const sessionData = {
      role: isGanadero ? "ganadero" : "inversionista",
      name: user.full_name,
      account: user.email,
      key: `user-${user.id}`,
      balance: "—",
    };

    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem("hatofi_session", JSON.stringify(sessionData));

    router.push(isGanadero ? "/dashboard/my-farm" : "/dashboard/investment");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (rememberMe) {
        localStorage.setItem(
          REMEMBERED_LOGIN_KEY,
          JSON.stringify({ identifier, password })
        );
      } else {
        localStorage.removeItem(REMEMBERED_LOGIN_KEY);
      }

      const loginResponse = await loginUser(identifier.trim(), password);
      handleApiLogin(loginResponse.user, loginResponse.access_token);
    } catch (loginError) {
      setError(
        loginError instanceof Error
          ? loginError.message
          : "No fue posible iniciar sesión."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7F5] text-[#0D1F1B] flex flex-col justify-between p-4 md:p-8 selection:bg-[#5BCB35] selection:text-white">
      {/* Contenedor Principal */}
      <main className="max-w-[1140px] w-full mx-auto my-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start py-4">
        
        {/* COLUMNA IZQUIERDA: Tarjeta Institucional de Login */}
        <section className="lg:col-span-7 bg-white rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.04)] border border-[#E2E8E5] p-7 sm:p-9 md:p-10">
          
          {/* Header de la tarjeta */}
          <div className="flex items-center justify-between mb-7">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white border border-[#E4EAE6] shadow-sm flex items-center justify-center p-2 shrink-0">
                <Image
                  src="/brand/hatofi-icon.svg"
                  alt="HatoFi"
                  width={36}
                  height={36}
                  priority
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <span className="font-extrabold text-base tracking-tight text-[#063B32] block">
                  HatoFi
                </span>
                <span className="text-[9px] font-bold tracking-widest text-[#7C8B85] uppercase block">
                  Portal Institucional RWA
                </span>
              </div>
            </div>

            {/* Badge de seguridad HSM */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBF2F7] border border-[#D5E2EC] text-[#1E3A8A] text-xs font-semibold">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3z" />
              </svg>
              <span>256-Bit HSM</span>
            </div>
          </div>

          {/* Título y Descripción */}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0D1F1B] tracking-tight mb-2">
            Bienvenido a <span className="text-[#063B32]">HatoFi</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#5D6B66] leading-relaxed mb-6">
            Plataforma institucional de inversión y financiamiento pecuario en activos del mundo
            real (RWA) respaldados por contratos inteligentes.
          </p>

          {error && (
            <div
              role="alert"
              className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700"
            >
              {error}
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Campo Identificador */}
            <div>
              <label className="block text-xs font-bold text-[#2A3833] mb-1.5">
                Correo Electrónico o ID de Productor ICA
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-[#85948F] pointer-events-none">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="18" x="3" y="3" rx="2" />
                    <path d="M7 7h10M7 12h10M7 17h6" />
                  </svg>
                </div>
                <input
                  type="text"
                  required
                  placeholder="ej: inversor@fondo.co o ICA #84920-CO"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#EEF2F6] hover:bg-[#E8EDF3] focus:bg-white text-xs sm:text-sm text-[#0D1F1B] placeholder-[#8C9B95] rounded-xl border border-transparent focus:border-[#006244] focus:outline-none transition-all shadow-inner"
                />
              </div>
            </div>

            {/* Campo Contraseña */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold text-[#2A3833]">Contraseña Segura</label>
                <Link href="#" className="text-xs font-bold text-[#006244] hover:underline">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-[#85948F] pointer-events-none">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-[#EEF2F6] hover:bg-[#E8EDF3] focus:bg-white text-xs sm:text-sm text-[#0D1F1B] placeholder-[#8C9B95] rounded-xl border border-transparent focus:border-[#006244] focus:outline-none transition-all shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-[#85948F] hover:text-[#2A3833] transition-colors cursor-pointer"
                  title={showPassword ? "Ocultar" : "Mostrar"}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61M2 2l20 20" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Opciones adicionales: Recordar y Sesión Encriptada */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-xs text-[#4E5D57] cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-[#006244] focus:ring-[#006244] accent-[#006244]"
                />
                <span>Recordar en este equipo por 30 días</span>
              </label>
              
              <div className="flex items-center gap-1.5 text-xs text-[#065F46] font-medium">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
                <span>Sesión encriptada</span>
              </div>
            </div>

            {/* Botón Principal de Acceso */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-[#063B32] hover:bg-[#042822] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-75"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3" />
              </svg>
              <span>{loading ? "Verificando credenciales..." : "Ingresar a la Plataforma HatoFi"}</span>
            </button>

            {/* Alternativas SSO */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                disabled
                aria-label="Google SSO no disponible"
                title="Google SSO no disponible"
                className="py-2.5 px-3 bg-[#F1F3F4] border border-[#D8E1E8] rounded-xl text-xs font-bold text-[#8A9591] flex items-center justify-center gap-2 transition-all cursor-not-allowed opacity-65 grayscale"
              >
                <svg width="16" height="16" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Google SSO</span>
              </button>

              <button
                type="button"
                disabled
                aria-label="Passkey / Biométrica no disponible"
                title="Passkey / Biométrica no disponible"
                className="py-2.5 px-3 bg-[#F1F3F4] border border-[#D8E1E8] rounded-xl text-xs font-bold text-[#8A9591] flex items-center justify-center gap-2 transition-all cursor-not-allowed opacity-65 grayscale"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#059669]">
                  <path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4" />
                  <path d="M14 13.12c0 2.38 0 6.38-1 8.88" />
                  <path d="M17.29 21.02c.12-.6.43-2.3.5-3.02" />
                  <path d="M2 12a10 10 0 0 1 18-6" />
                  <path d="M2 16h.01" />
                  <path d="M21.8 16c.2-2 .131-5.354 0-6" />
                  <path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2" />
                  <path d="M8.65 22c.21-.66.45-1.32.57-2" />
                  <path d="M9 6.8a6 6 0 0 1 9 5.2v2" />
                </svg>
                <span>Passkey / Biométrica</span>
              </button>
            </div>

            {/* Accesos Rápidos de Prueba por Perfil */}
            <div className="pt-3 border-t border-[#EEF2F0] flex flex-col gap-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">
                Acceso Rápido de Prueba (Demo)
              </span>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  disabled
                  aria-label="Demo Inversionista no disponible"
                  title="Demo Inversionista no disponible"
                  className="py-2.5 px-3 rounded-xl bg-[#F1F3F4] text-[#8A9591] border border-[#D8E1E8] text-xs font-bold transition-all text-center cursor-not-allowed flex items-center justify-center gap-1.5 shadow-sm opacity-65 grayscale"
                >
                  <span>💼</span>
                  <span>Demo Inversionista</span>
                </button>
                <button
                  type="button"
                  disabled
                  aria-label="Demo Ganadero no disponible"
                  title="Demo Ganadero no disponible"
                  className="py-2.5 px-3 rounded-xl bg-[#F1F3F4] text-[#8A9591] border border-[#D8E1E8] text-xs font-bold transition-all text-center cursor-not-allowed flex items-center justify-center gap-1.5 shadow-sm opacity-65 grayscale"
                >
                  <span>🤠</span>
                  <span>Demo Ganadero</span>
                </button>
              </div>
            </div>
          </form>

          {/* Footer de la tarjeta con links de registro */}
          <div className="mt-7 pt-5 border-t border-[#EEF2F0] flex flex-wrap items-center justify-between text-xs text-[#6A7873] gap-2">
            <span>¿No tienes cuenta aún?</span>
            <div className="font-bold text-[#006244]">
              <Link href="/register" className="hover:underline">
                Registrarme
              </Link>
            </div>
          </div>
        </section>

        {/* COLUMNA DERECHA: Widgets de Mercado y Respaldo RWA */}
        <div className="lg:col-span-5 flex flex-col gap-5 w-full">
          
          {/* Card 1: Mercado Pecuario en Vivo */}
          <section className="bg-white rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.04)] border border-[#E2E8E5] p-6">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[11px] font-bold text-[#7A8882] tracking-wider uppercase">
                Mercado Pecuario en Vivo
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#D1FAE5] text-[#065F46]">
                Feria Subasta Fedegán
              </span>
            </div>

            <div className="flex justify-between items-baseline mb-4">
              <div>
                <span className="text-2xl sm:text-3xl font-extrabold text-[#0D1F1B]">$8,950</span>
                <span className="text-xs font-bold text-[#62716B] ml-1.5">COP / Kg en Pie</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-[#2B3934]">~$2.28 USD</span>
                <span className="text-[11px] font-bold text-[#10B981] ml-1.5">↗ +2.4% sem</span>
              </div>
            </div>

            <div className="flex justify-between items-center text-xs text-[#7A8882] mb-1">
              <span>Tendencia 30D Lote Brahman Ceba</span>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
                <span className="font-semibold text-[#3D4C46]">Trazado IoT Activo</span>
              </div>
            </div>

            {/* Sparkline SVG Chart */}
            <div className="w-full h-16 pt-1">
              <svg viewBox="0 0 400 80" className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path
                  d="M 5 65 C 50 65, 80 45, 130 45 C 180 45, 210 52, 260 38 C 310 24, 350 18, 395 12 L 395 80 L 5 80 Z"
                  fill="url(#chartGrad)"
                />
                <path
                  d="M 5 65 C 50 65, 80 45, 130 45 C 180 45, 210 52, 260 38 C 310 24, 350 18, 395 12"
                  fill="none"
                  stroke="#006244"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <circle cx="395" cy="12" r="3.5" fill="#10B981" stroke="#ffffff" strokeWidth="2" />
              </svg>
            </div>
          </section>

          {/* Card 2: Respaldo Jurídico & Operativo */}
          <section className="bg-white rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.04)] border border-[#E2E8E5] p-6">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded-lg bg-[#E6F4EA] text-[#006244] flex items-center justify-center">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <h3 className="font-extrabold text-sm sm:text-base text-[#0D1F1B]">
                Respaldo Jurídico & Operativo
              </h3>
            </div>
            <p className="text-xs text-[#71807A] mb-4">
              Garantías RWA auditadas en tiempo real
            </p>

            {/* 3 Bloques de Seguridad */}
            <div className="space-y-3">
              {/* Item 1 */}
              <div className="p-3.5 rounded-xl bg-[#F0F4FA] border border-[#DEE6F2] flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#D1FAE5] text-[#059669] flex items-center justify-center shrink-0 mt-0.5">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m14 13-7.5 7.5c-.83.83-2.17.83-3 0 0 0 0 0 0 0a2.12 2.12 0 0 1 0-3L11 10" />
                    <path d="m16 16 6-6" />
                    <path d="m8 8 6-6" />
                    <path d="m9 7 8 8" />
                    <path d="m21 11-8-8" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#0D1F1B]">
                    Garantías Prendarias en Colombia
                  </h4>
                  <p className="text-[11px] text-[#55645E] mt-0.5 leading-snug">
                    Inscripción legal en Confecámaras / RUG bajo la Ley 1676 de Garantías
                    Mobiliarias con prenda agraria de primer grado.
                  </p>
                </div>
              </div>

              {/* Item 2 */}
              <div className="p-3.5 rounded-xl bg-[#F0F4FA] border border-[#DEE6F2] flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#D1FAE5] text-[#059669] flex items-center justify-center shrink-0 mt-0.5">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9" />
                    <path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5" />
                    <circle cx="12" cy="12" r="2" />
                    <path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5" />
                    <path d="M19.1 4.9C23 8.8 23 15.1 19.1 19" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#0D1F1B]">
                    Trazabilidad RFID & Básculas IoT
                  </h4>
                  <p className="text-[11px] text-[#55645E] mt-0.5 leading-snug">
                    Pesaje continuo telemetrizado y aretes electrónicos RFID validados con
                    oráculos descentralizados Chainlink.
                  </p>
                </div>
              </div>

              {/* Item 3 */}
              <div className="p-3.5 rounded-xl bg-[#F0F4FA] border border-[#DEE6F2] flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#D1FAE5] text-[#059669] flex items-center justify-center shrink-0 mt-0.5">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#0D1F1B]">
                    Custodia Descentralizada Soroban
                  </h4>
                  <p className="text-[11px] text-[#55645E] mt-0.5 leading-snug">
                    Fondos en smart contracts no permisionados con liquidación automatizada y
                    pagos p2p de biomasa ganada.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* FOOTER INSTITUCIONAL */}
      <footer className="w-full max-w-[1140px] mx-auto mt-6 pt-5 border-t border-[#E2E8E5] flex flex-col md:flex-row items-center justify-between text-xs text-[#7A8882] gap-4">
        {/* Badges de Verificación */}
        <div className="flex flex-wrap items-center gap-5">
          <span className="flex items-center gap-1.5 font-bold text-[#059669]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Audited Smart Contracts
          </span>
          <span className="flex items-center gap-1.5 font-medium text-[#556560]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            256-bit MPC Vaults
          </span>
          <span className="flex items-center gap-1.5 font-medium text-[#556560]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            Proof of Herd Reserves
          </span>
        </div>

        {/* Enlaces Legales */}
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <Link href="#" className="hover:underline hover:text-[#0D1F1B] transition-colors">
            Privacy Policy
          </Link>
          <Link href="#" className="hover:underline hover:text-[#0D1F1B] transition-colors">
            Terms of Service
          </Link>
          <Link href="#" className="hover:underline hover:text-[#0D1F1B] transition-colors">
            Risk Disclosure
          </Link>
          <span className="text-[#9CA8A3]">© 2025 HatoFi Protocol</span>
        </div>
      </footer>
    </div>
  );
}
