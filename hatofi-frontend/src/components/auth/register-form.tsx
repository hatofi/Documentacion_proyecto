"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { registerUser, type RegisterRoleId } from "@/lib/auth-api";

const roles: Array<{ id: RegisterRoleId; label: string }> = [
  { id: 3, label: "Inversionista" },
  { id: 4, label: "Ganadero" },
];

function getPasswordStrength(password: string) {
  if (!password) {
    return { label: "Sin ingresar", pct: 0, color: "bg-[#CBD5D1]", text: "text-[#7C8B85]" };
  }
  if (password.length < 8) {
    return { label: "Débil", pct: 30, color: "bg-rose-500", text: "text-rose-600" };
  }
  if (password.length < 12) {
    return { label: "Media", pct: 65, color: "bg-amber-500", text: "text-amber-600" };
  }
  return { label: "Óptima (segura)", pct: 100, color: "bg-emerald-500", text: "text-emerald-600" };
}

export default function RegisterForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [roleId, setRoleId] = useState<RegisterRoleId>(3);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [registrationSuccessful, setRegistrationSuccessful] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(8);
  const passwordStrength = getPasswordStrength(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const hasPasswordMismatch = confirmPassword.length > 0 && !passwordsMatch;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const isFormValid =
    fullName.trim().length >= 2 &&
    fullName.trim().length <= 100 &&
    isEmailValid &&
    password.length >= 8 &&
    password.length <= 128 &&
    passwordsMatch &&
    termsAccepted;

  useEffect(() => {
    if (!registrationSuccessful) {
      return;
    }

    if (redirectCountdown === 0) {
      router.push("/login");
      return;
    }

    const countdownTimer = window.setTimeout(() => {
      setRedirectCountdown((seconds) => seconds - 1);
    }, 1000);

    return () => window.clearTimeout(countdownTimer);
  }, [redirectCountdown, registrationSuccessful, router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    try {
      await registerUser({
        full_name: fullName.trim(),
        email: email.trim(),
        password,
        confirm_password: confirmPassword,
        role_id: roleId,
        terms_accepted: termsAccepted,
      });
      setRegistrationSuccessful(true);
      setRedirectCountdown(8);
    } catch (registrationError) {
      setError(
        registrationError instanceof Error
          ? registrationError.message
          : "No fue posible completar el registro.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F4F7F5] px-4 py-8 text-[#0D1F1B] selection:bg-[#5BCB35] selection:text-white sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-start gap-8 lg:grid-cols-12">
      <section className="w-full rounded-2xl border border-[#E2E8E5] bg-white p-7 shadow-[0_4px_30px_rgba(0,0,0,0.04)] sm:p-10 lg:col-span-7">
        <div className="mb-8 flex items-center justify-between">
          <Link href="/login" className="flex items-center gap-2.5">
            <Image
              src="/brand/hatofi-icon.svg"
              alt="HatoFi"
              width={40}
              height={40}
              priority
            />
            <span className="font-extrabold tracking-tight text-[#063B32]">HatoFi</span>
          </Link>
          <Link href="/login" className="text-xs font-bold text-[#006244] hover:underline">
            Iniciar sesión
          </Link>
        </div>

        {registrationSuccessful ? (
          <section aria-live="polite" className="py-5">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#D1FAE5] text-3xl text-[#047857]">
              ✓
            </div>
            <h1 className="mb-2 text-2xl font-extrabold tracking-tight text-[#063B32] sm:text-3xl">
              ¡Cuenta creada exitosamente!
            </h1>
            <p className="mb-6 text-sm leading-relaxed text-[#5D6B66]">
              Ya puedes iniciar sesión y comenzar a completar tu perfil en HatoFi.
            </p>

            <div className="mb-6 space-y-3 rounded-2xl border border-[#DCE6E1] bg-[#F8FBF9] p-5">
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-[#64746D]">Nombre</span>
                <strong className="text-right text-[#0D1F1B]">{fullName.trim()}</strong>
              </div>
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-[#64746D]">Correo</span>
                <strong className="break-all text-right text-[#0D1F1B]">{email.trim()}</strong>
              </div>
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-[#64746D]">Tipo de cuenta</span>
                <strong className="text-right text-[#006244]">
                  {roles.find((role) => role.id === roleId)?.label}
                </strong>
              </div>
            </div>

            <div className="mb-6 rounded-xl bg-[#E8F3EE] px-4 py-3 text-xs leading-relaxed text-[#006244]">
              <strong>¿Qué sigue?</strong> Inicia sesión para completar la verificación de tu
              perfil y consultar las oportunidades disponibles para tu cuenta.
            </div>

            <p className="text-center text-sm text-[#5D6B66]">
              Te redirigiremos al inicio de sesión en{" "}
              <strong className="text-[#006244]">{redirectCountdown} segundos</strong>.
            </p>
            <Link
              href="/login"
              className="mt-4 block text-center text-xs font-bold text-[#006244] hover:underline"
            >
              Ir al inicio de sesión ahora
            </Link>
          </section>
        ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="full-name" className="mb-1.5 block text-xs font-bold text-[#2A3833]">
              Nombre completo
            </label>
            <input
              id="full-name"
              type="text"
              required
              minLength={2}
              maxLength={100}
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              className="w-full rounded-xl border border-transparent bg-[#EEF2F6] px-4 py-3 text-sm outline-none transition-all focus:border-[#006244] focus:bg-white"
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-1.5 block text-xs font-bold text-[#2A3833]">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-transparent bg-[#EEF2F6] px-4 py-3 text-sm outline-none transition-all focus:border-[#006244] focus:bg-white"
            />
          </div>

          <p className="rounded-xl bg-[#E8F3EE] px-4 py-3 text-xs leading-relaxed text-[#006244]">
            🔒 Usaremos este correo para confirmaciones de firma multi-sig y dispersión de dividendos.
          </p>

          <fieldset>
            <legend className="mb-2 text-xs font-bold text-[#2A3833]">Tipo de cuenta</legend>
            <div className="grid grid-cols-2 gap-3">
              {roles.map((role) => (
                <label
                  key={role.id}
                  className={`cursor-pointer rounded-xl border px-4 py-3 text-sm font-bold transition-all ${
                    roleId === role.id
                      ? "border-[#006244] bg-[#E8F3EE] text-[#006244]"
                      : "border-[#E2E8E5] text-[#5D6B66] hover:border-[#006244]"
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={role.id}
                    checked={roleId === role.id}
                    onChange={() => setRoleId(role.id)}
                    className="sr-only"
                  />
                  {role.label}
                </label>
              ))}
            </div>
          </fieldset>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-xs font-bold text-[#2A3833]">
              Contraseña
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                maxLength={128}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-xl border border-transparent bg-[#EEF2F6] px-4 py-3 pr-12 text-sm outline-none transition-all focus:border-[#006244] focus:bg-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7C8B85] transition-colors hover:text-[#006244]"
              >
                {showPassword ? (
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                ) : (
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="m3 3 18 18" />
                    <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                    <path d="M9.9 4.2A10.8 10.8 0 0 1 12 4c7 0 10 8 10 8a17.3 17.3 0 0 1-3.1 4.4M6.6 6.6C3.7 8.5 2 12 2 12s3 8 10 8a10.8 10.8 0 0 0 2.1-.2" />
                  </svg>
                )}
              </button>
            </div>
            <div className="mt-2">
              <div className="mb-1 flex items-center justify-between text-[11px] font-bold">
                <span className="text-[#5D6B66]">Fortaleza de clave criptográfica</span>
                <span className={passwordStrength.text}>{passwordStrength.label}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-[#E2E8E5]">
                <div
                  className={`h-full rounded-full transition-all ${passwordStrength.color}`}
                  style={{ width: `${passwordStrength.pct}%` }}
                />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="confirm-password" className="mb-1.5 block text-xs font-bold text-[#2A3833]">
              Confirmar contraseña
            </label>
            <div className="relative">
              <input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                required
                minLength={8}
                maxLength={128}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className={`w-full rounded-xl border bg-[#EEF2F6] px-4 py-3 pr-12 text-sm outline-none transition-all focus:bg-white ${
                  hasPasswordMismatch
                    ? "border-rose-300 focus:border-rose-500"
                    : passwordsMatch
                      ? "border-emerald-300 focus:border-emerald-500"
                      : "border-transparent focus:border-[#006244]"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((visible) => !visible)}
                aria-label={showConfirmPassword ? "Ocultar confirmación de contraseña" : "Mostrar confirmación de contraseña"}
                title={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7C8B85] transition-colors hover:text-[#006244]"
              >
                {showConfirmPassword ? (
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                ) : (
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="m3 3 18 18" />
                    <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                    <path d="M9.9 4.2A10.8 10.8 0 0 1 12 4c7 0 10 8 10 8a17.3 17.3 0 0 1-3.1 4.4M6.6 6.6C3.7 8.5 2 12 2 12s3 8 10 8a10.8 10.8 0 0 0 2.1-.2" />
                  </svg>
                )}
              </button>
            </div>
            {confirmPassword && (
              <p
                aria-live="polite"
                className={`mt-2 text-xs font-bold ${passwordsMatch ? "text-emerald-600" : "text-rose-600"}`}
              >
                {passwordsMatch ? "✓ Las contraseñas coinciden." : "Las contraseñas no coinciden."}
              </p>
            )}
          </div>

          <label className="flex cursor-pointer items-start gap-3 text-xs leading-relaxed text-[#5D6B66]">
            <input
              type="checkbox"
              required
              checked={termsAccepted}
              onChange={(event) => setTermsAccepted(event.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-[#006244]"
            />
            <span>
              Acepto los <strong className="text-[#006244]">Términos de Servicio</strong> y
              reconozco la constitución del contrato de sindicación con{" "}
              <strong className="text-[#006244]">
                Garantía Mobiliaria de Primer Grado bajo la Ley 1676
              </strong>
              , custodiada de forma fiduciaria e inmutable.
            </span>
          </label>

          {error && (
            <p role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !isFormValid}
            className="w-full rounded-xl bg-[#006244] px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-[#063B32] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creando cuenta..." : "Crear cuenta"}
          </button>
          <p className="pt-2 text-center text-xs text-[#5D6B66]">
            ¿Ya tienes una cuenta activa en HatoFi?{" "}
            <Link href="/login" className="font-bold text-[#006244] hover:underline">
              Iniciar Sesión
            </Link>
          </p>
        </form>
        )}
      </section>

      <aside className="space-y-5 lg:col-span-5">
        <section className="rounded-2xl bg-[#063B32] p-6 text-white shadow-[0_4px_30px_rgba(0,0,0,0.12)] sm:p-7">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#8FE27B]">
                Retorno proyectado
              </p>
              <p className="mt-1 text-4xl font-extrabold tracking-tight">14.2%</p>
              <p className="text-[11px] font-bold text-[#8FE27B]">APY histórico neto</p>
            </div>
            <span className="rounded-full border border-[#2A7864] bg-[#0B5446] px-2.5 py-1 text-[10px] font-bold text-[#B8F3AA]">
              Ceba intensiva 2024-2025
            </span>
          </div>
          <p className="mb-5 text-xs leading-relaxed text-[#D7EBE3]">
            Rentabilidad vinculada directamente a la ganancia diaria de peso (GDP) de novillos en
            llanos sostenibles y liquidación en stablecoin USDC.
          </p>
          <div className="rounded-xl bg-[#002E27] p-3">
            <div className="flex justify-between text-[10px] font-bold text-[#B8F3AA]">
              <span>Rendimiento acumulado ciclo 1-6</span>
              <span>+22.4 kg/mes prom.</span>
            </div>
            <svg viewBox="0 0 260 42" className="mt-2 h-10 w-full" aria-label="Tendencia positiva de rendimiento">
              <path d="M5 35 C50 34, 77 27, 109 25 S168 17, 198 13 S230 7, 255 4" fill="none" stroke="#5BCB35" strokeWidth="2" />
            </svg>
          </div>
        </section>

        <section className="rounded-2xl border border-[#DCE6E1] bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#E8F3EE] text-xs text-[#00966D]">✓</span>
            <h2 className="text-sm font-extrabold">Garantías y Protección del Capital</h2>
          </div>
          <p className="mb-4 text-[11px] text-[#64746D]">Mecanismos jurídicos y telemétricos auditados</p>
          <ul className="space-y-2.5">
            {[
              ["Prenda Agraria de 1er Grado", "Inscripción jurídica ante RUG / Confecámaras protegiendo el lote antes del desembolso."],
              ["Telemetría IoT Continua", "Monitoreo de biomasa por pesajes quincenales, aretes RFID y oráculos Chainlink."],
              ["Smart Contracts Soroban", "Custodia no-permisionada y dispersión programática directa en USDC nativo."],
              ["Póliza Paramétrica Climática", "Cobertura automatizada mediante índices satelitales NDVI frente a sequías o inundaciones."],
            ].map(([title, description]) => (
              <li key={title} className="flex gap-2 rounded-xl border border-[#DCE6E1] bg-[#F8FBF9] p-3">
                <span className="text-sm font-bold text-[#00966D]">✓</span>
                <div>
                  <p className="text-[11px] font-bold text-[#0D1F1B]">{title}</p>
                  <p className="mt-0.5 text-[9px] leading-relaxed text-[#64746D]">{description}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="overflow-hidden rounded-2xl border border-[#DCE6E1] bg-white shadow-sm">
          <div className="relative h-28">
            <Image
              src="https://images.unsplash.com/photo-1551884831-bbf3cdc6469e?auto=format&fit=crop&w=900&q=80"
              alt="Ganado en una hacienda"
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#063B32]/80 to-transparent" />
            <p className="absolute bottom-3 left-4 text-xs font-bold text-white">📍 Hacienda San Jerónimo · Puerto López, Meta</p>
          </div>
          <div className="flex justify-between gap-3 px-4 py-3 text-[10px] font-medium text-[#5D6B66]">
            <span>Lote activo #409 · 350 Novillos</span>
            <span className="font-bold text-[#00966D]">● Auditoría Satelital OK</span>
          </div>
        </section>

        <section className="rounded-2xl border border-[#DCE6E1] bg-white p-5 shadow-sm sm:p-6">
          <p className="mb-3 text-sm tracking-wide text-[#F59E0B]">★★★★★</p>
          <p className="text-[11px] italic leading-relaxed text-[#3E4C46]">
            “HatoFi transformó la inversión agropecuaria tradicional en un instrumento de renta fija
            estructurada, con trazabilidad milimétrica en blockchain y seguridad legal de primer nivel.”
          </p>
          <div className="mt-4 flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#006244] text-[10px] font-bold text-white">ME</span>
            <div>
              <p className="text-[11px] font-bold">Mauricio Echeverry</p>
              <p className="text-[9px] text-[#7C8B85]">CIO en InverLatam Private Wealth</p>
            </div>
          </div>
        </section>
      </aside>
      </div>
    </main>
  );
}
